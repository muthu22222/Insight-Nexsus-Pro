import fs from 'fs';

async function testImg2ImgAPIs() {
  console.log('Testing image-to-image options...');

  // Sample image URL (a real room)
  const sampleRoomUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024';

  const prompt = 'Contemporary Japandi interior design with sofa, coffee table, area rug, indoor plant, modern lighting, preserving same room structure and perspective';

  // Test 1: Pollinations with image parameter
  const testUrls = [
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?image=${encodeURIComponent(sampleRoomUrl)}&model=flux&nologo=true&seed=42`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?image_url=${encodeURIComponent(sampleRoomUrl)}&model=flux&nologo=true&seed=42`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?init_image=${encodeURIComponent(sampleRoomUrl)}&model=flux&nologo=true&seed=42`,
  ];

  for (let i = 0; i < testUrls.length; i++) {
    const u = testUrls[i];
    console.log(`\nTesting URL ${i + 1}: ${u.substring(0, 100)}...`);
    try {
      const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
      console.log(`Status: ${res.status}, content-type: ${res.headers.get('content-type')}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        console.log(`Received buffer size: ${buf.byteLength} bytes`);
      }
    } catch (e) {
      console.log(`Failed: ${e.message}`);
    }
  }
}

testImg2ImgAPIs();
