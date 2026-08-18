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
  windows: string | string[];
  doors: string | string[];
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

function getDefaultAnalysis(): RoomAnalysis {
  return {
    roomType: 'Living Room',
    wallColor: 'Off-white / Warm Gray',
    flooring: 'Vitrified Tiles / Hardwood Finish',
    ceiling: 'Plain white with recessed light points',
    furniture: ['Sofa', 'Center Coffee Table', 'TV Console', 'Wall Art'],
    windows: 'Large sliding glass window with sheer curtains',
    doors: 'Standard flush wooden entry door',
    lighting: 'Warm ambient ceiling LED fixtures and natural daylight',
    emptyAreas: ['Accent wall corner suitable for lounge chair or floor lamp', 'Center area for area rug'],
    proportions: 'Approx. 14ft x 12ft (Medium spacious layout)',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Permissive auth for guest and user flows
    await authenticate(request, { optional: true });

    try {
      await connectToDatabase();
    } catch {
      // MongoDB not required in demo mode
    }

    const body = await request.json().catch(() => ({}));
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    let analysis: RoomAnalysis | null = null;

    if (apiKey) {
      try {
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

        let imageData: { mimeType: string; base64: string } | null = null;
        try {
          imageData = await fetchImageAsBase64(imageUrl);
        } catch (fetchErr) {
          console.warn('Could not extract image data for vision model:', fetchErr);
        }

        if (imageData) {
          let responseText = '';
          for (const modelName of GEMINI_MODELS) {
            try {
              console.log(`[Room Analyze] Attempting with model: ${modelName}`);
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
                console.log(`[Room Analyze] Succeeded with model: ${modelName}`);
                break;
              }
            } catch (geminiError) {
              console.warn(`[Room Analyze] Model ${modelName} error:`, geminiError instanceof Error ? geminiError.message : geminiError);
            }
          }

          if (responseText) {
            const cleanedText = responseText
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (geminiErr) {
        console.warn('[Room Analyze] Gemini analysis error, falling back to smart defaults:', geminiErr);
      }
    }

    if (!analysis) {
      analysis = getDefaultAnalysis();
    }

    // Ensure array fields are valid arrays
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
    return NextResponse.json({
      success: true,
      data: getDefaultAnalysis(),
    });
  }
}
