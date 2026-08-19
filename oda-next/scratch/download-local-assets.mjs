import fs from 'fs';
import path from 'path';

const verifiedAssets = [
  {
    name: 'modern_living_1.jpg',
    url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1600&auto=format&fit=crop&q=85',
  },
  {
    name: 'modern_living_2.jpg',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85',
  },
  {
    name: 'luxury_living.jpg',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85',
  },
  {
    name: 'scandi_living.jpg',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop&q=85',
  },
  {
    name: 'bedroom.jpg',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&auto=format&fit=crop&q=85',
  },
  {
    name: 'dining.jpg',
    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&auto=format&fit=crop&q=85',
  },
  {
    name: 'office.jpg',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&auto=format&fit=crop&q=85',
  },
];

async function downloadLocalAssets() {
  console.log('Downloading local design assets to public/images/designs/ ...');
  const targetDir = path.join(process.cwd(), 'public', 'images', 'designs');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const asset of verifiedAssets) {
    try {
      console.log(`Fetching ${asset.name}...`);
      const res = await fetch(asset.url);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const filePath = path.join(targetDir, asset.name);
        fs.writeFileSync(filePath, Buffer.from(buf));
        console.log(`Saved ${filePath} (${buf.byteLength} bytes)`);
      } else {
        console.error(`Failed ${asset.name}: HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`Error downloading ${asset.name}:`, e.message);
    }
  }
}

downloadLocalAssets();
