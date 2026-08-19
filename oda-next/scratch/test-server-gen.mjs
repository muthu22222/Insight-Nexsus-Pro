import fs from 'fs';
import path from 'path';

async function testServerSideGeneration() {
  console.log('Testing server-side generation & saving...');

  const prompt = 'Photorealistic 8k architectural interior redesign of a living room, wide-angle eye-level photo with white plaster walls, light oak hardwood flooring, windows. Visibly furnished with: 3-seater tailored modern sofa with textured cushions, round wooden coffee table in front of sofa, low-profile oak TV console unit, plush geometric area rug, warm arched floor lamp, cream bouclé lounge chair, potted monstera plant, framed wall art. Warm lighting atmosphere, neutral palette, Architectural Digest photography, completely furnished room.';

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=853&model=flux&seed=777&nologo=true`;

  console.log('Fetching from Pollinations on server...');
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    console.log(`Status: ${res.status}, Type: ${res.headers.get('content-type')}`);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      const dir = path.join(process.cwd(), 'public', 'generated');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const targetFile = path.join(dir, 'test-design-777.jpg');
      fs.writeFileSync(targetFile, Buffer.from(buf));
      console.log(`Successfully saved server-side generated image: ${targetFile} (${buf.byteLength} bytes)`);
    }
  } catch (err) {
    console.error('Server-side fetch error:', err.message);
  }
}

testServerSideGeneration();
