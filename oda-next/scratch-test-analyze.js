const { GoogleGenerativeAI } = require('./node_modules/@google/generative-ai');
const fs = require('fs');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

console.log('API key found:', Boolean(apiKey));
const genAI = new GoogleGenerativeAI(apiKey);

const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const prompt = `You are an expert AI interior designer and architectural vision model.
Analyze this newly uploaded room photograph in extreme detail and return a valid JSON object.

Return ONLY a JSON object with this exact structure:
{
  "roomType": "Living Room",
  "isEmptyRoom": false,
  "perspective": "Eye-level wide perspective",
  "wallColor": "Neutral white",
  "flooring": "Light hardwood",
  "ceiling": "Standard white ceiling",
  "furniture": ["Sofa", "Coffee Table"],
  "existingFurniture": [
    {
      "item": "Sofa",
      "placement": "Living room main area",
      "action": "preserve"
    }
  ],
  "suggestedFurniture": ["Area Rug", "Floor Lamp"],
  "windows": "Standard window",
  "doors": "Entry door",
  "lighting": "Natural daylight",
  "emptyAreas": ["Corner space"],
  "proportions": "15ft x 12ft"
}
Provide ONLY the JSON output without any markdown or conversational text.`;

async function testAnalyze() {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'];
  for (const m of models) {
    try {
      console.log('Testing model:', m);
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/png',
            data: samplePngBase64
          }
        }
      ]);
      const text = res.response.text();
      console.log('MODEL', m, 'SUCCESS:');
      console.log(text);
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned.match(/\{[\s\S]*\}/)[0]);
      console.log('Successfully parsed JSON roomType:', parsed.roomType, 'suggested:', parsed.suggestedFurniture);
      return;
    } catch (e) {
      console.log('MODEL', m, 'FAILED:', e.message);
    }
  }
}
testAnalyze();
