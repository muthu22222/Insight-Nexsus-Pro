import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const candidateImages = [
  // Fully furnished Modern living rooms
  { name: 'modern_1', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800' },
  { name: 'modern_2', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
  { name: 'modern_3', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800' },
  // Fully furnished Traditional living rooms
  { name: 'traditional_1', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800' },
  { name: 'traditional_2', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
  // Fully furnished Scandinavian living rooms
  { name: 'scandi_1', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800' },
  { name: 'scandi_2', url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800' },
  // Fully furnished Luxury living rooms
  { name: 'luxury_1', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
  { name: 'luxury_2', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800' },
  // Fully furnished Industrial living rooms
  { name: 'industrial_1', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800' },
  { name: 'industrial_2', url: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800' },
  // Fully furnished Bedrooms
  { name: 'bedroom_1', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800' },
  { name: 'bedroom_2', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800' },
  // Fully furnished Offices
  { name: 'office_1', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800' },
  { name: 'office_2', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
  // Fully furnished Dining
  { name: 'dining_1', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800' },
  { name: 'dining_2', url: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800' },
];

async function verifyCandidates() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

  for (const c of candidateImages) {
    try {
      const res = await fetch(c.url);
      const buf = await res.arrayBuffer();
      const v = await model.generateContent([
        'List the main furniture pieces visible in this room image:',
        { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(buf).toString('base64') } }
      ]);
      console.log(`[${c.name}] =>`, v.response.text().replace(/\n/g, ' ').substring(0, 100));
    } catch (e) {
      console.log(`[${c.name}] Error:`, e.message);
    }
  }
}

verifyCandidates();
