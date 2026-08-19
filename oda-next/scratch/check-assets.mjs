import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const urlsToCheck = [
  { name: 'traditional[0]', url: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800' },
  { name: 'traditional[1]', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800' },
  { name: 'modern[0]', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800' },
  { name: 'scandi[0]', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800' },
  { name: 'luxury[0]', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800' },
];

async function checkAllAssets() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

  for (const item of urlsToCheck) {
    console.log(`Checking ${item.name}: ${item.url}`);
    try {
      const res = await fetch(item.url);
      const buffer = await res.arrayBuffer();
      const visionRes = await model.generateContent([
        'Describe in 1 sentence what furniture is visible in this room image (e.g. sofa, coffee table, empty room, etc.):',
        { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(buffer).toString('base64') } }
      ]);
      console.log(`=> Result for ${item.name}:`, visionRes.response.text().trim());
    } catch (e) {
      console.log(`=> Error for ${item.name}:`, e.message);
    }
  }
}

checkAllAssets();
