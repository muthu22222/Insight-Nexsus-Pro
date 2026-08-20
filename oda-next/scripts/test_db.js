const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const lines = envContent.split('\n');
let mongoUri = '';
for (const line of lines) {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.replace('MONGODB_URI=', '').trim();
  }
}

console.log('Testing MongoDB URI:', mongoUri.replace(/:([^:@]+)@/, ':****@'));

async function testConnection() {
  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };
    console.log('Connecting...');
    await mongoose.connect(mongoUri, opts);
    console.log('SUCCESS: Connected to MongoDB Atlas successfully!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Ready state:', mongoose.connection.readyState);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('ERROR connecting to MongoDB:');
    console.error(err);
    process.exit(1);
  }
}

testConnection();
