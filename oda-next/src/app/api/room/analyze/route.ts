import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ mimeType: string; base64: string }> {
  const dataUrlResult = parseDataUrl(imageUrl);
  if (dataUrlResult) {
    return dataUrlResult;
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return { mimeType: contentType, base64 };
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

    if (!genAI) {
      console.error('Gemini API not initialized - GEMINI_API_KEY missing');
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please set GEMINI_API_KEY.' },
        { status: 500 }
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

    let imageData: { mimeType: string; base64: string };
    try {
      imageData = await fetchImageAsBase64(imageUrl);
    } catch (fetchError) {
      console.error('Image fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: `Failed to process image: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    console.log('Sending image to Gemini:', { mimeType: imageData.mimeType, base64Length: imageData.base64.length });

    let result;
    try {
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64,
          },
        },
      ]);
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      const errorMessage = geminiError instanceof Error ? geminiError.message : String(geminiError);
      return NextResponse.json(
        { success: false, error: `Gemini API error: ${errorMessage}` },
        { status: 500 }
      );
    }

    const responseText = result.response.text();
    console.log('Gemini raw response:', responseText);
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', responseText);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response - invalid format' },
        { status: 500 }
      );
    }

    let analysis: RoomAnalysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw match:', jsonMatch[0]);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response - invalid JSON' },
        { status: 500 }
      );
    }

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
