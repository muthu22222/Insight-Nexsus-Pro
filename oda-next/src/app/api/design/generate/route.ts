import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { GEMINI_MODELS } from '@/lib/gemini';

interface DesignVariant {
  style: string;
  mood: string;
  color: string;
  budget: number;
  description: string;
  furniture: {
    name: string;
    position: string;
    description: string;
  }[];
  hotspots: {
    id: string;
    x: number;
    y: number;
    label: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    await authenticate(request);
    try {
      await connectToDatabase();
    } catch {
      console.log('MongoDB not configured, continuing without database');
    }

    const body = await request.json();
    const { imageUrl, roomAnalysis, preferences } = body;

    if (!imageUrl || !roomAnalysis || !preferences) {
      return NextResponse.json(
        { success: false, error: 'imageUrl, roomAnalysis, and preferences are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please set GEMINI_API_KEY.' },
        { status: 500 }
      );
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const { style, mood, color, budget } = preferences;

    const prompt = `Based on this room analysis: ${JSON.stringify(roomAnalysis)}

Generate 3 distinct interior design variants with the following preferences:
- Style: ${style}
- Mood: ${mood}
- Color palette: ${color}
- Budget: ₹${Number(budget).toLocaleString('en-IN')}

For each variant, provide:
1. A unique design concept
2. Furniture placement recommendations with positions (x, y coordinates as percentages 0-100)
3. Color scheme and materials
4. Budget breakdown

Return the response as a JSON array with exactly 3 objects, each having this structure:
[
  {
    "style": "specific style name",
    "mood": "mood description",
    "color": "color palette name",
    "budget": ${Number(budget)},
    "description": "detailed design description",
    "furniture": [
      {
        "name": "furniture item name",
        "position": "where to place it",
        "description": "item details"
      }
    ],
    "hotspots": [
      {
        "id": "unique-id-1",
        "x": 50,
        "y": 50,
        "label": "furniture label"
      }
    ]
  }
]
Provide only the JSON array, no additional text.`;

    let responseText = '';
    let lastError: unknown = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Generating design with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        if (responseText) {
          console.log(`Design generation success with model: ${modelName}`);
          break;
        }
      } catch (err) {
        console.warn(`Design generation failed with model ${modelName}:`, err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('Failed to generate design variants');
    }

    const cleanedText = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON array from design response:', responseText);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const designs: DesignVariant[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: designs,
    });
  } catch (error) {
    console.error('Design generate error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

