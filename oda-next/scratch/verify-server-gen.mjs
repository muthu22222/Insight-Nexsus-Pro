import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

async function verifyServerGenerated() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

  const buf = fs.readFileSync('public/generated/test-design-777.jpg');

  const res = await model.generateContent([
    'Is this room fully furnished? List the furniture and decor pieces visible.',
    { inlineData: { mimeType: 'image/jpeg', data: buf.toString('base64') } }
  ]);

  console.log('Gemini Vision on Server-Generated Room:\n', res.response.text());
}

verifyServerGenerated();
