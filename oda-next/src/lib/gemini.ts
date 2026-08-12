import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Please define the GEMINI_API_KEY environment variable in .env.local");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export function getGeminiModel(modelName: string = "gemini-1.5-flash"): GenerativeModel {
  return genAI.getGenerativeModel({ model: modelName });
}

export async function analyzeImage(
  imageBase64: string,
  prompt: string
): Promise<string> {
  const model = getGeminiModel();

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
  ]);

  return result.response.text();
}

export async function generateDesign(
  roomAnalysis: string,
  preferences: {
    style: string;
    mood: string;
    color: string;
    budget: number;
  }
): Promise<string> {
  const model = getGeminiModel("gemini-1.5-pro");

  const prompt = `Based on this room analysis: ${roomAnalysis}

Generate interior design recommendations with the following preferences:
- Style: ${preferences.style}
- Mood: ${preferences.mood}
- Color palette: ${preferences.color}
- Budget: ₹${preferences.budget.toLocaleString("en-IN")}

Provide detailed recommendations for:
1. Furniture placement and selection
2. Color scheme adjustments
3. Lighting improvements
4. Decorative elements
5. Budget allocation breakdown

Format the response as structured JSON.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function chatWithAssistant(
  message: string,
  context?: string
): Promise<string> {
  const model = getGeminiModel();

  const systemPrompt = `You are an AI interior design assistant for ODA NEXT, an Indian interior design platform.
You help users with room analysis, design suggestions, furniture recommendations, and budget planning.
Always respond in a helpful, professional manner. Use Indian Rupees (₹) for currency.
${context ? `Context about the current project: ${context}` : ""}`;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: message },
  ]);

  return result.response.text();
}

export default genAI;
