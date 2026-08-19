import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testFurnitureEndpoints() {
  console.log('Testing Furniture API and Amazon/Flipkart support...');

  try {
    const listRes = await fetch('http://localhost:3000/api/furniture/list?limit=5');
    if (listRes.ok) {
      const data = await listRes.json();
      console.log(`Fetched ${data.data?.items?.length || 0} products successfully.`);
      if (data.data?.items?.[0]) {
        console.log('Sample product:', {
          name: data.data.items[0].productName,
          amazonUrl: data.data.items[0].amazonUrl,
          flipkartUrl: data.data.items[0].flipkartUrl,
        });
      }
    } else {
      console.log(`List API status: ${listRes.status}`);
    }
  } catch (e) {
    console.error('Test error:', e.message);
  }
}

testFurnitureEndpoints();
