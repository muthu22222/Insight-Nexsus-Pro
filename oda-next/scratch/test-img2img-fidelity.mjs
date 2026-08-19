import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

async function testImg2ImgFidelity() {
  const testRoomUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024';

  const origRes = await fetch(testRoomUrl);
  const origBuf = await origRes.arrayBuffer();

  const url = `https://image.pollinations.ai/prompt/professional%20interior%20redesign%20of%20this%20exact%20room%20adding%20sofa%20and%20coffee%20table?image=${encodeURIComponent(testRoomUrl)}&model=flux&nologo=true&seed=101`;

  const genRes = await fetch(url);
  const genBuf = await genRes.arrayBuffer();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

  const evalRes = await model.generateContent([
    `Compare these two images:
Image 1: Original uploaded room.
Image 2: Generated redesign.
Question: Does Image 2 keep the SAME walls, doors, windows, and camera perspective as Image 1? Or did it generate a different room? Answer directly in 2 sentences.`,
    { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(origBuf).toString('base64') } },
    { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(genBuf).toString('base64') } },
  ]);

  console.log('Gemini Vision Comparison:\n', evalRes.response.text());
}

testImg2ImgFidelity();
