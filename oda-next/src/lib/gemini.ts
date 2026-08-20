import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

export const GEMINI_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
] as const;

export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

export function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim() || GEMINI_API_KEY;
  if (!key) {
    throw new Error("Please define the GEMINI_API_KEY environment variable in .env.local");
  }
  return new GoogleGenerativeAI(key);
}

export function getGeminiModel(modelName: string = DEFAULT_GEMINI_MODEL): GenerativeModel {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateWithFallback(
  generateFn: (model: GenerativeModel, modelName: string) => Promise<string>
): Promise<{ text: string; modelName: string }> {
  let lastError: unknown = null;
  const genAI = getGenAI();

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on model ${modelName}`)), 4000)
      );
      const text = await Promise.race([generateFn(model, modelName), timeoutPromise]);
      if (text) {
        return { text, modelName };
      }
    } catch (err) {
      console.warn(`[Gemini] Model ${modelName} attempt failed:`, err instanceof Error ? err.message : err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate a response.");
}

export async function analyzeImage(
  imageBase64: string,
  prompt: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const { text } = await generateWithFallback(async (model) => {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);
    return result.response.text();
  });

  return text;
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

  const { text } = await generateWithFallback(async (model) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });

  return text;
}

export async function chatWithAssistant(
  message: string,
  context?: string
): Promise<string> {
  const systemPrompt = `You are an AI interior design assistant for Insight Nexsus, an Indian interior design platform.
You help users with room analysis, design suggestions, furniture recommendations, and budget planning.
Always respond in a helpful, professional manner. Use Indian Rupees (₹) for currency.
${context ? `Context about the current project: ${context}` : ""}`;

  const { text } = await generateWithFallback(async (model) => {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: message },
    ]);
    return result.response.text();
  });

  return text;
}

const defaultGenAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
export default defaultGenAI;

