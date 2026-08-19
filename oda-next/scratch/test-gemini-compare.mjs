import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

async function testComparison() {
  console.log('Testing image comparison with Gemini Vision...');

  // Original room image
  const sampleRoomUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024';

  const origRes = await fetch(sampleRoomUrl);
  const origBuffer = await origRes.arrayBuffer();

  const prompt = 'Modern Scandinavian Japandi interior redesign of THIS EXACT ROOM: preserve exact perspective, wall positions, floor, and windows. Add tailored modern 3-seater sofa, round wooden coffee table, area rug, indoor plant, floor lamp, warm daylight.';

  const genUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?image=${encodeURIComponent(sampleRoomUrl)}&width=1024&height=768&model=flux&nologo=true&seed=888`;

  console.log('Fetching generated img2img image...');
  const genRes = await fetch(genUrl);
  const genBuffer = await genRes.arrayBuffer();

  fs.writeFileSync('public/test-orig.jpg', Buffer.from(origBuffer));
  fs.writeFileSync('public/test-gen.jpg', Buffer.from(genBuffer));

  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const promptText = `Compare these two images:
Image 1: The original uploaded room.
Image 2: The AI redesigned room.

Evaluate:
1. Does Image 2 preserve the architectural context, perspective, and boundaries of the room in Image 1?
2. What furniture and design elements were successfully added in Image 2?
3. Provide a rating from 1-10 on fidelity and interior quality.`;

    const res = await model.generateContent([
      promptText,
      { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(origBuffer).toString('base64') } },
      { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(genBuffer).toString('base64') } },
    ]);

    console.log('\n--- GEMINI VISION EVALUATION ---');
    console.log(res.response.text());
  }
}

testComparison();
