import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

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
    await connectToDatabase();

    const body = await request.json();
    const { imageUrl, roomAnalysis, preferences } = body;

    if (!imageUrl || !roomAnalysis || !preferences) {
      return NextResponse.json(
        { success: false, error: 'imageUrl, roomAnalysis, and preferences are required' },
        { status: 400 }
      );
    }

    const { style, mood, color, budget } = preferences;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Based on this room analysis: ${JSON.stringify(roomAnalysis)}

Generate 3 distinct interior design variants with the following preferences:
- Style: ${style}
- Mood: ${mood}
- Color palette: ${color}
- Budget: ₹${budget.toLocaleString('en-IN')}

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
    "budget": allocated budget number,
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
        "id": "unique-id",
        "x": 50,
        "y": 50,
        "label": "furniture label"
      }
    ]
  }
]
Provide only the JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
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
