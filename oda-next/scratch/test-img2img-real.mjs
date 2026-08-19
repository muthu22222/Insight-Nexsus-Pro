import fs from 'fs';

async function testImg2ImgParams() {
  console.log('Testing image-to-image parameters...');

  // Public sample room image
  const sampleRoomUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024';

  const testCases = [
    {
      name: 'Pollinations with prompt + image',
      url: `https://image.pollinations.ai/prompt/photorealistic%20interior%20design%20redesign%2C%20add%20modern%20sofa%2C%20coffee%20table%2C%20area%20rug%2C%20warm%20lighting%2C%20keeping%20same%20room%20walls%20and%20floor?image=${encodeURIComponent(sampleRoomUrl)}&model=flux&nologo=true&seed=42`,
    },
    {
      name: 'Pollinations with turbo + image',
      url: `https://image.pollinations.ai/prompt/photorealistic%20interior%20design%20redesign%2C%20add%20modern%20sofa%2C%20coffee%20table%2C%20area%20rug%2C%20warm%20lighting%2C%20keeping%20same%20room%20walls%20and%20floor?image=${encodeURIComponent(sampleRoomUrl)}&model=turbo&nologo=true&seed=42`,
    },
    {
      name: 'Pollinations with prompt only (high fidelity architectural)',
      url: `https://image.pollinations.ai/prompt/Architectural%20Digest%20photography%20of%20a%20modern%20living%20room%20with%20light%20hardwood%20floor%2C%20white%20plaster%20walls%2C%20sliding%20windows%2C%20furnished%20with%20a%20tailored%20grey%20sofa%2C%20round%20oak%20coffee%20table%2C%20textured%20wool%20rug%2C%20floor%20lamp%2C%20potted%20monstera%20plant%2C%20natural%20daylight%2C%208k%20resolution?model=flux&nologo=true&seed=42`,
    },
  ];

  for (const tc of testCases) {
    console.log(`\nFetching ${tc.name}...`);
    try {
      const res = await fetch(tc.url, { signal: AbortSignal.timeout(12000) });
      console.log(`Status: ${res.status}, Type: ${res.headers.get('content-type')}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const fname = `public/test-${tc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`;
        fs.writeFileSync(fname, Buffer.from(buf));
        console.log(`Saved ${fname} (${buf.byteLength} bytes)`);
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testImg2ImgParams();
