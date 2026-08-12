import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

interface RoomAnalysis {
  roomType: string;
  wallColor: string;
  flooring: string;
  ceiling: string;
  furniture: string[];
  windows: string;
  doors: string;
  lighting: string;
  emptyAreas: string[];
  proportions: string;
}

export async function POST(request: NextRequest) {
  try {
    await authenticate(request);
    await connectToDatabase();

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this room image and provide detailed information in JSON format with the following structure:
{
  "roomType": "type of room (e.g., Living Room, Bedroom, Kitchen)",
  "wallColor": "description of wall colors",
  "flooring": "type of flooring",
  "ceiling": "description of ceiling",
  "furniture": ["list of furniture items visible"],
  "windows": "description of windows",
  "doors": "description of doors",
  "lighting": "type of lighting",
  "emptyAreas": ["list of empty areas suitable for new furniture"],
  "proportions": "estimated room proportions description"
}
Provide only the JSON response, no additional text.`;

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageUrl.includes('.png') ? 'image/png' : 'image/jpeg';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const analysis: RoomAnalysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Room analyze error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
