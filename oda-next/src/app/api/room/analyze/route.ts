import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { GEMINI_MODELS } from '@/lib/gemini';

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
    // MongoDB connection optional - skip if not configured
    try {
      await connectToDatabase();
    } catch {
      console.log('MongoDB not configured, continuing without database');
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.error('Gemini API not initialized - GEMINI_API_KEY missing');
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please set GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

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

    let responseText = '';
    let lastGeminiError: unknown = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Analyzing image with Gemini model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.base64,
            },
          },
        ]);
        responseText = result.response.text();
        if (responseText) {
          console.log(`Image analysis succeeded with model: ${modelName}`);
          break;
        }
      } catch (geminiError) {
        console.warn(`Gemini model ${modelName} error:`, geminiError);
        lastGeminiError = geminiError;
      }
    }

    if (!responseText) {
      const errorMessage = lastGeminiError instanceof Error ? lastGeminiError.message : String(lastGeminiError);
      return NextResponse.json(
        { success: false, error: `Gemini API error: ${errorMessage}` },
        { status: 500 }
      );
    }

    console.log('Gemini raw response:', responseText);
    
    // Clean markdown code fences if present
    const cleanedText = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

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

    // Ensure array fields are arrays
    if (!Array.isArray(analysis.furniture)) {
      analysis.furniture = typeof analysis.furniture === 'string' ? [analysis.furniture] : [];
    }
    if (!Array.isArray(analysis.emptyAreas)) {
      analysis.emptyAreas = typeof analysis.emptyAreas === 'string' ? [analysis.emptyAreas] : [];
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

