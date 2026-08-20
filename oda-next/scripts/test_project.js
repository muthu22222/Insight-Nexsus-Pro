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

async function testProjectCreation() {
  try {
    await mongoose.connect(mongoUri, { bufferCommands: false });
    console.log('Connected to MongoDB');

    // Define schema matching Project.ts
    const HotspotSchema = new mongoose.Schema({
      id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
      label: { type: String, default: 'Furniture Item' },
      category: { type: String, default: 'Furniture' },
      description: { type: String, default: '' },
      price: { type: mongoose.Schema.Types.Mixed, default: 0 },
      store: { type: String, default: '' },
      brand: { type: String, default: '' },
      material: { type: String, default: '' },
      productUrl: { type: String, default: '' },
      amazonUrl: { type: String, default: null },
      flipkartUrl: { type: String, default: null },
      image: { type: String, default: '' },
      match: { type: Number, default: 95 },
      furnitureId: { type: String, default: '' },
    }, { _id: false });

    const AIDesignSchema = new mongoose.Schema({
      _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
      projectId: { type: String, default: '' },
      style: { type: String, default: 'Modern' },
      furnitureStyle: { type: String, default: 'Modern' },
      mood: { type: String, default: 'Warm' },
      color: { type: String, default: 'Neutral' },
      budget: { type: Number, default: 200000 },
      description: { type: String, default: '' },
      generatedImages: { type: [String], default: [] },
      generatedImage: { type: String, default: '' },
      hotspots: { type: [HotspotSchema], default: [] },
    }, { timestamps: true });

    const ProjectFurnitureSchema = new mongoose.Schema({
      _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
      name: { type: String, default: 'Furniture Item' },
      productName: { type: String, default: '' },
      category: { type: String, default: 'Furniture' },
      brand: { type: String, default: '' },
      price: { type: Number, default: 0 },
      image: { type: String, default: '' },
      description: { type: String, default: '' },
      style: { type: String, default: 'Modern' },
      rating: { type: Number, default: 4.5 },
      amazonUrl: { type: String, default: null },
      flipkartUrl: { type: String, default: null },
      productUrl: { type: String, default: '' },
      storeName: { type: String, default: 'Store' },
      inStock: { type: Boolean, default: true },
    }, { _id: false });

    const ShoppingListItemSchema = new mongoose.Schema({
      furnitureId: { type: mongoose.Schema.Types.Mixed, default: '' },
      productName: { type: String, default: '' },
      name: { type: String, default: '' },
      category: { type: String, default: '' },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true, default: 0 },
      store: { type: String, default: 'Store' },
      productLink: { type: String, default: '' },
      amazonUrl: { type: String, default: null },
      flipkartUrl: { type: String, default: null },
      checked: { type: Boolean, default: false },
    }, { _id: false });

    const ProjectSchema = new mongoose.Schema({
      userId: { type: String, required: [true, 'User ID is required'], index: true },
      name: { type: String, required: [true, 'Project name is required'], trim: true },
      roomImage: { type: String, default: '' },
      originalImage: { type: String, default: '' },
      generatedImage: { type: String, default: '' },
      roomType: { type: String, default: 'Living Room' },
      selectedStyle: { type: String, default: 'Modern' },
      style: { type: String, default: 'Modern' },
      mood: { type: String, default: 'Warm' },
      colorPreference: { type: String, default: 'Neutral' },
      color: { type: String, default: 'Neutral' },
      budget: { type: Number, default: 200000 },
      selectedDesign: { type: mongoose.Schema.Types.Mixed, default: null },
      selectedDesignIndex: { type: Number, default: 0 },
      roomAnalysis: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
      designs: { type: [AIDesignSchema], default: [] },
      furniture: { type: [ProjectFurnitureSchema], default: [] },
      furniturePrices: { type: [Number], default: [] },
      amazonUrls: { type: [String], default: [] },
      flipkartUrls: { type: [String], default: [] },
      budgetPlan: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
      shoppingList: { type: [ShoppingListItemSchema], default: [] },
      status: { type: String, enum: ['draft', 'analyzing', 'designing', 'completed'], default: 'completed' },
    }, { timestamps: true });

    if (mongoose.models.Project) {
      delete mongoose.models.Project;
    }
    const Project = mongoose.model('Project', ProjectSchema);

    console.log('Attempting Project.create...');
    const testDoc = await Project.create({
      userId: 'test_user_123',
      name: 'Test Project',
      roomImage: 'https://example.com/test.jpg',
      originalImage: 'https://example.com/test.jpg',
      generatedImage: 'https://example.com/gen.jpg',
      roomType: 'Living Room',
      selectedStyle: 'Modern',
      style: 'Modern',
      mood: 'Warm',
      colorPreference: 'Neutral',
      color: 'Neutral',
      budget: 200000,
      furniture: [
        {
          _id: 'f_1',
          name: 'Modern Sofa',
          productName: 'Modern Sofa',
          category: 'Sofa',
          brand: 'Brand',
          price: 45000,
          image: '',
          description: '',
          style: 'Modern',
          rating: 4.8,
          amazonUrl: 'https://amazon.in',
          flipkartUrl: 'https://flipkart.com',
          productUrl: 'https://urbanladder.com',
          storeName: 'Urban Ladder',
          inStock: true,
        }
      ],
      furniturePrices: [45000],
      shoppingList: [
        {
          furnitureId: 'f_1',
          name: 'Modern Sofa',
          productName: 'Modern Sofa',
          category: 'Sofa',
          quantity: 1,
          price: 45000,
          store: 'Urban Ladder',
          productLink: 'https://urbanladder.com',
          amazonUrl: 'https://amazon.in',
          flipkartUrl: 'https://flipkart.com',
          checked: false,
        }
      ],
      budgetPlan: {
        totalBudget: 200000,
        spent: 45000,
        remaining: 155000,
        allocations: [],
      },
      status: 'completed',
    });

    console.log('Project created successfully with ID:', testDoc._id.toString());
    await Project.deleteOne({ _id: testDoc._id });
    console.log('Cleaned up test document');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Project creation failed:');
    console.error(err);
    process.exit(1);
  }
}

testProjectCreation();
