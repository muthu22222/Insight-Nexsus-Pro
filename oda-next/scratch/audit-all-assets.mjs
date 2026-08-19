import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

const testUrls = [
  // Modern Living Room Candidates
  { id: 'candidate_1', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200' }, // Green sofa, table, rug, plant
  { id: 'candidate_2', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200' }, // Yellow armchair, sofa, wood table
  { id: 'candidate_3', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200' }, // Scandi living room: light grey sofa, round wood tables, floor lamp, plant
  { id: 'candidate_4', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200' }, // 2 sofas, coffee table, TV console, shelving
  { id: 'candidate_5', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200' }, // Large sofa suite, coffee table, armchairs, lighting
  { id: 'candidate_6', url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200' }, // Full furnished living room
  { id: 'candidate_7', url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=1200' }, // Bedroom
  { id: 'candidate_8', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200' }, // Modern bed, nightstands, wardrobe
  { id: 'candidate_9', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200' }, // Dining room with table & 6 chairs
  { id: 'candidate_10', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200' }, // Office with desk, chair, shelves
  { id: 'candidate_11', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200' }, // Modern Japandi furnished living room
  { id: 'candidate_12', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200' }, // Living room
  { id: 'candidate_13', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200' }, // Loft living room
  { id: 'candidate_14', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200' },
  { id: 'candidate_15', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200' }, // Let's check what this is!
];

async function audit() {
  console.log('Auditing candidates with Gemini Vision...');
  for (const item of testUrls) {
    try {
      const res = await fetch(item.url);
      if (!res.ok) {
        console.log(`[${item.id}] HTTP ${res.status}`);
        continue;
      }
      const buf = await res.arrayBuffer();
      const geminiRes = await model.generateContent([
        'List all furniture visible in this room: Does it have a sofa, coffee table, rug, TV/media unit, or bed? Is it furnished or empty? Reply concisely.',
        { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(buf).toString('base64') } }
      ]);
      console.log(`\n=== [${item.id}] ${item.url} ===`);
      console.log(geminiRes.response.text().trim());
    } catch (e) {
      console.log(`[${item.id}] Error: ${e.message}`);
    }
  }
}

audit();
