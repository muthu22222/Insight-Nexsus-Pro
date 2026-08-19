import fs from 'fs';

async function testImg2ImgServices() {
  console.log('Testing image-to-image services...');

  // Sample room image URL
  const testRoomUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024';

  const testEndpoints = [
    {
      name: 'Pollinations Flux with Image',
      url: `https://image.pollinations.ai/prompt/add%20modern%20leather%20sofa%20and%20coffee%20table%20to%20this%20room?image=${encodeURIComponent(testRoomUrl)}&model=flux&nologo=true&seed=42`,
    },
    {
      name: 'Pollinations Turbo with Image',
      url: `https://image.pollinations.ai/prompt/add%20modern%20leather%20sofa%20and%20coffee%20table%20to%20this%20room?image=${encodeURIComponent(testRoomUrl)}&model=turbo&nologo=true&seed=42`,
    },
  ];

  for (const ep of testEndpoints) {
    console.log(`\nTesting ${ep.name}...`);
    try {
      const res = await fetch(ep.url, { signal: AbortSignal.timeout(10000) });
      console.log(`Status: ${res.status}, Type: ${res.headers.get('content-type')}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        console.log(`Success! Buffer length: ${buf.byteLength} bytes`);
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testImg2ImgServices();
