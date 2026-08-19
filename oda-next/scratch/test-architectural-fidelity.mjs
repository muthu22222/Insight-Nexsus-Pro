import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

async function testArchitecturalFidelity() {
  console.log('Testing architectural fidelity with Gemini Vision...');

  // Sample original room
  const sampleRoomUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024';
  const origRes = await fetch(sampleRoomUrl);
  const origBuffer = await origRes.arrayBuffer();

  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    // Ask Gemini Vision to extract the EXACT pixel bounds and geometry of walls, doors, windows, floor, and furniture placement zones
    const visionAnalysis = await model.generateContent([
      `You are an expert architectural computer vision engine. Analyze this room image:
1. Identify exact room boundaries:
   - Left wall, center wall, right wall
   - Ceiling boundary line
   - Floor plane and boundary line
   - Windows (position, shape, frames)
   - Doors (position, shape, frame)
2. Identify existing furniture to preserve or restyle
3. Identify the EXACT 2D/3D perspective placement coordinates (x%, y%, width%, height%) for adding:
   - Modern Sofa
   - Coffee Table
   - Area Rug
   - TV Console / Media Unit
   - Lighting Fixture
   - Wall Art / Decor
   - Plant / Greenery
4. Output strict JSON with coordinates and perspective vectors.`,
      { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(origBuffer).toString('base64') } }
    ]);

    console.log('\n--- GEMINI ARCHITECTURAL SPATIAL ANALYSIS ---');
    console.log(visionAnalysis.response.text());
  }
}

testArchitecturalFidelity();
