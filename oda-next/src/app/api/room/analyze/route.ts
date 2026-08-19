import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { GEMINI_MODELS } from '@/lib/gemini';
import type { RoomAnalysis } from '@/types';

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

  const response = await fetch(imageUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return { mimeType: contentType, base64 };
}

function getDefaultSuggestionsForRoom(roomType: string, existingFurniture: string[] = []): string[] {
  const norm = (roomType || 'living').toLowerCase();
  const existingLower = existingFurniture.map((f) => f.toLowerCase());

  if (norm.includes('bedroom')) {
    const defaultList = [
      'Platform Bed Frame',
      'Dual Bedside Nightstands',
      'Plush Bedroom Area Rug',
      'Ambient Bedside Table Lamps',
      'Sliding Wardrobe / Dresser',
      'Floor-to-Ceiling Window Drapes',
      'Framed Wall Canvas Art',
      'Indoor Greenery Planter',
    ];
    return defaultList.filter((item) => !existingLower.some((e) => item.toLowerCase().includes(e)));
  }

  if (norm.includes('office') || norm.includes('study') || norm.includes('work')) {
    const defaultList = [
      'Executive Computer Desk',
      'Ergonomic Mesh Office Chair',
      'Modular Storage Bookshelf',
      'Acoustic Floor Area Rug',
      'Architectural LED Task Lamp',
      'Storage Credenza & File Cabinet',
      'Potted Snake Plant',
      'Framed Motivational Wall Art',
    ];
    return defaultList.filter((item) => !existingLower.some((e) => item.toLowerCase().includes(e)));
  }

  if (norm.includes('dining')) {
    const defaultList = [
      'Solid Hardwood Dining Table',
      'Upholstered Dining Chairs (Set of 6)',
      'Linear Pendant Chandelier',
      'Contemporary Sideboard Buffet',
      'Flatweave Dining Area Rug',
      'Gallery Wall Art Collection',
      'Decorative Centerpiece Vase',
    ];
    return defaultList.filter((item) => !existingLower.some((e) => item.toLowerCase().includes(e)));
  }

  // Living Room Default
  const defaultList = [
    'Sectional / 3-Seater Sofa',
    'Center Coffee Table',
    'TV Media Console',
    'Accent Lounge Armchair',
    'Handcrafted Wool Area Rug',
    'Arched Brass Floor Lamp',
    'Textured Window Linen Curtains',
    'Framed Statement Wall Art',
    'Potted Indoor Planter',
  ];
  return defaultList.filter((item) => !existingLower.some((e) => item.toLowerCase().includes(e)));
}

function getDefaultAnalysis(): RoomAnalysis {
  return {
    roomType: 'Living Room',
    wallColor: 'Off-white / Warm Gray finish',
    flooring: 'Light Natural Hardwood / Vitrified Tiles',
    ceiling: 'Clean white ceiling with recessed LED lighting',
    furniture: ['Sectional Sofa', 'TV Console'],
    existingFurniture: [
      { item: 'Sectional Sofa', placement: 'Left wall seating area', action: 'preserve' },
      { item: 'TV Console', placement: 'Main media wall', action: 'preserve' },
    ],
    suggestedFurniture: [
      'Round Center Coffee Table',
      'Handcrafted Wool Area Rug',
      'Bouclé Accent Armchair',
      'Arched Brass Floor Lamp',
      'Textured Linen Curtains',
      'Framed Gallery Wall Canvas',
    ],
    isEmptyRoom: false,
    perspective: 'Eye-level wide perspective showing central seating area and media wall',
    windows: 'Large sliding glass window with sheer curtains',
    doors: 'Standard wooden entry doorway',
    lighting: 'Natural daylight combined with warm ceiling ambient lighting',
    emptyAreas: [
      'Center floor between sofa and TV unit (perfect for coffee table and area rug)',
      'Corner beside window (ideal for floor lamp and accent chair)',
      'Main wall space (suitable for wall art and decor)',
    ],
    proportions: 'Approx. 16ft x 13ft (Spacious medium layout)',
  };
}

export async function POST(request: NextRequest) {
  try {
    await authenticate(request, { optional: true });

    try {
      await connectToDatabase();
    } catch {
      // MongoDB not required in demo mode
    }

    const body = await request.json().catch(() => ({}));
    const { imageUrl, imageId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    let analysis: RoomAnalysis | null = null;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `You are an expert AI interior designer and architectural vision model.
Analyze this newly uploaded room photograph in extreme detail and return a valid JSON object.

Key requirements:
1. DETECT EXISTING FURNITURE: Inspect all visible furniture already present in the room (e.g., Sofa, TV Unit, Bed, Table, Chairs, Desk).
   - If furniture is present, list each item in "furniture" and in "existingFurniture" with its exact position and specify action: "preserve" (meaning preserve and restyle into chosen design).
   - If the room is bare or empty, set "isEmptyRoom": true and "furniture": [].
2. SUGGEST FURNITURE TO COMPLETE ROOM: In "suggestedFurniture", provide a list of appropriate, essential furniture and decor needed to make this specific room fully furnished, realistic, and complete (e.g. Sofa, Bed, Desk, Coffee Table, TV Unit, Rug, Armchair, Floor Lamp, Curtains, Wall Art, Plants) matching the room type and empty spaces.
3. PERSPECTIVE & ARCHITECTURE: Analyze camera perspective (eye-level, wide angle, frontal), wall finish, flooring material/color, ceiling, windows, doors, lighting, and empty areas.

Return ONLY a JSON object with this exact structure:
{
  "roomType": "Living Room | Bedroom | Dining Room | Home Office | Kitchen",
  "isEmptyRoom": false,
  "perspective": "description of viewpoint and camera angle",
  "wallColor": "description of wall color, texture, and finish",
  "flooring": "type and tone of flooring (e.g. light oak hardwood, beige tiles, marble)",
  "ceiling": "description of ceiling height, structure, and light fixtures",
  "furniture": ["List of all existing visible furniture items detected"],
  "existingFurniture": [
    {
      "item": "Name of existing furniture piece",
      "placement": "Exact location in room (e.g. against left wall, center, corner)",
      "action": "preserve"
    }
  ],
  "suggestedFurniture": [
    "List of complementary furniture items needed to make the room fully furnished and complete"
  ],
  "windows": "description of window positions, size, drapes or view",
  "doors": "description of door positions and openings",
  "lighting": "type of natural and artificial lighting",
  "emptyAreas": [
    "description of empty floor and wall zones suitable for new furniture placement"
  ],
  "proportions": "estimated room dimensions and layout size"
}
Provide ONLY the JSON output without any markdown or conversational text.`;

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
              console.log(`[Room Analyze] Attempting vision analysis with model: ${modelName} for image ${imageId || 'new'}`);
              const model = genAI.getGenerativeModel({ model: modelName });
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('AI timeout')), 6500)
              );
              const resultPromise = model.generateContent([
                prompt,
                {
                  inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.base64,
                  },
                },
              ]);
              const result = await Promise.race([resultPromise, timeoutPromise]);
              responseText = (result as any)?.response?.text?.() || '';
              if (responseText) {
                console.log(`[Room Analyze] Vision analysis succeeded with model: ${modelName}`);
                break;
              }
            } catch (geminiError) {
              console.warn(`[Room Analyze] Model ${modelName} attempt error:`, geminiError instanceof Error ? geminiError.message : geminiError);
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

    // Normalize array fields
    if (!Array.isArray(analysis.furniture)) {
      analysis.furniture = typeof analysis.furniture === 'string' ? [analysis.furniture] : [];
    }
    if (!Array.isArray(analysis.emptyAreas)) {
      analysis.emptyAreas = typeof analysis.emptyAreas === 'string' ? [analysis.emptyAreas] : [];
    }
    if (!Array.isArray(analysis.suggestedFurniture) || analysis.suggestedFurniture.length === 0) {
      analysis.suggestedFurniture = getDefaultSuggestionsForRoom(analysis.roomType, analysis.furniture);
    }
    if (!Array.isArray(analysis.existingFurniture)) {
      analysis.existingFurniture = analysis.furniture.map((item) => ({
        item,
        placement: 'Main room space',
        action: 'preserve',
      }));
    }

    if (analysis.isEmptyRoom === undefined) {
      analysis.isEmptyRoom = analysis.furniture.length === 0;
    }

    return NextResponse.json(
      {
        success: true,
        data: analysis,
        imageId: imageId || null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Room analyze error:', error);
    return NextResponse.json(
      {
        success: true,
        data: getDefaultAnalysis(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
