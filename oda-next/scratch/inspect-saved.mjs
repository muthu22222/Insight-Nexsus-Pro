import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

async function inspectSavedImage() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

  const buf = fs.readFileSync('public/test-pollinations_with_prompt___image.jpg');

  const res = await model.generateContent([
    'Describe this room image in detail: Is it empty or fully furnished? What furniture, lighting, and decor pieces are visible in the scene?',
    { inlineData: { mimeType: 'image/jpeg', data: buf.toString('base64') } }
  ]);

  console.log('Gemini Vision on Generated Image:\n', res.response.text());
}

inspectSavedImage();
