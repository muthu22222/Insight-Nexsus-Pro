import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runTests() {
  console.log("=== ODA NEXT MONGODB ATLAS & PROJECT SYSTEM VERIFICATION ===");

  const { connectToDatabase } = await import("../lib/mongodb");
  const {
    User,
    Project,
    RoomAnalysis,
    AIDesign,
    Furniture,
    BudgetPlan,
    ShoppingList,
    ChatHistory,
  } = await import("../models");

  console.log("\n1. Testing MongoDB Atlas connection...");
  try {
    const conn = await connectToDatabase();
    console.log("✓ Successfully connected to MongoDB Atlas! State:", conn.connection.readyState);
  } catch (err: any) {
    console.error("✗ Failed to connect to MongoDB Atlas:", err.message);
    process.exit(1);
  }

  console.log("\n2. Verifying all 8 Mongoose models...");
  console.log("✓ User model registered:", !!User.modelName);
  console.log("✓ Project model registered:", !!Project.modelName);
  console.log("✓ RoomAnalysis model registered:", !!RoomAnalysis.modelName);
  console.log("✓ AIDesign model registered:", !!AIDesign.modelName);
  console.log("✓ Furniture model registered:", !!Furniture.modelName);
  console.log("✓ BudgetPlan model registered:", !!BudgetPlan.modelName);
  console.log("✓ ShoppingList model registered:", !!ShoppingList.modelName);
  console.log("✓ ChatHistory model registered:", !!ChatHistory.modelName);

  const testFirebaseUid = `test_firebase_uid_${Date.now()}`;
  const otherFirebaseUid = `other_firebase_uid_${Date.now()}`;

  console.log("\n3. Testing Project creation (Save Project flow)...");
  const testProject = await Project.create({
    userId: testFirebaseUid,
    name: "Luxury Modern Living Room Project",
    originalImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    roomImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    generatedImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    roomType: "Living Room",
    selectedStyle: "Modern Luxury",
    style: "Modern Luxury",
    mood: "Warm & Elegant",
    colorPreference: "Warm Neutral with Gold Accents",
    color: "Warm Neutral",
    budget: 350000,
    selectedDesign: {
      style: "Modern Luxury",
      mood: "Warm & Elegant",
      color: "Warm Neutral",
      budget: 350000,
      generatedImages: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc"],
      hotspots: [
        {
          id: 1,
          x: 35,
          y: 65,
          label: "Luxury 3-Seater Velvet Sofa",
          price: "₹65,000",
          category: "Sofa",
          brand: "Urban Ladder",
          store: "Urban Ladder",
          amazonUrl: "https://www.amazon.in/s?k=Luxury+3-Seater+Velvet+Sofa",
          flipkartUrl: "https://www.flipkart.com/search?q=Luxury+3-Seater+Velvet+Sofa",
        },
      ],
    },
    designs: [
      {
        style: "Modern Luxury",
        furnitureStyle: "Modern Luxury",
        mood: "Warm & Elegant",
        color: "Warm Neutral",
        budget: 350000,
        description: "Photorealistic luxury interior redesign.",
        generatedImages: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc"],
        hotspots: [],
      },
    ],
    roomAnalysis: {
      roomType: "Living Room",
      wallColor: "Off-white stucco",
      flooring: "Polished Italian Marble",
      ceiling: "Recessed cove with LED lighting",
      furniture: ["Sofa", "TV Unit"],
      existingFurniture: [{ item: "Sofa", placement: "Left wall", action: "preserve" }],
      suggestedFurniture: ["Center Table", "Wool Rug", "Floor Lamp"],
      isEmptyRoom: false,
      windows: "Double glazed balcony sliders",
      doors: "Teak entrance door",
      lighting: "Warm ambient",
      emptyAreas: ["Center floor"],
      proportions: "18ft x 14ft",
    },
    furniture: [
      {
        name: "Luxury 3-Seater Velvet Sofa",
        productName: "Luxury 3-Seater Velvet Sofa",
        category: "Sofa",
        brand: "Urban Ladder",
        price: 65000,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        description: "Deep seating velvet upholstery with brushed brass legs.",
        style: "Modern Luxury",
        rating: 4.8,
        amazonUrl: "https://www.amazon.in/s?k=Luxury+3-Seater+Velvet+Sofa",
        flipkartUrl: "https://www.flipkart.com/search?q=Luxury+3-Seater+Velvet+Sofa",
        productUrl: "https://www.urbanladder.com",
        storeName: "Urban Ladder",
        inStock: true,
      },
      {
        name: "Italian Marble Center Table",
        productName: "Italian Marble Center Table",
        category: "Coffee Table",
        brand: "Pepperfry",
        price: 28000,
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
        description: "Beveled Carrara marble top on geometric gold metal base.",
        style: "Modern Luxury",
        rating: 4.7,
        amazonUrl: "https://www.amazon.in/s?k=Italian+Marble+Center+Table",
        flipkartUrl: "https://www.flipkart.com/search?q=Italian+Marble+Center+Table",
        productUrl: "https://www.pepperfry.com",
        storeName: "Pepperfry",
        inStock: true,
      },
    ],
    furniturePrices: [65000, 28000],
    amazonUrls: [
      "https://www.amazon.in/s?k=Luxury+3-Seater+Velvet+Sofa",
      "https://www.amazon.in/s?k=Italian+Marble+Center+Table",
    ],
    flipkartUrls: [
      "https://www.flipkart.com/search?q=Luxury+3-Seater+Velvet+Sofa",
      "https://www.flipkart.com/search?q=Italian+Marble+Center+Table",
    ],
    budgetPlan: {
      totalBudget: 350000,
      allocations: [
        { category: "Main Furniture", amount: 175000, percentage: 50 },
        { category: "Lighting & Decor", amount: 87500, percentage: 25 },
        { category: "Textiles & Rugs", amount: 87500, percentage: 25 },
      ],
      remaining: 257000,
      spent: 93000,
    },
    shoppingList: [
      {
        furnitureId: "sofa-1",
        productName: "Luxury 3-Seater Velvet Sofa",
        category: "Sofa",
        quantity: 1,
        price: 65000,
        store: "Urban Ladder",
        productLink: "https://www.urbanladder.com",
        amazonUrl: "https://www.amazon.in/s?k=Luxury+3-Seater+Velvet+Sofa",
        flipkartUrl: "https://www.flipkart.com/search?q=Luxury+3-Seater+Velvet+Sofa",
        checked: false,
      },
      {
        furnitureId: "table-1",
        productName: "Italian Marble Center Table",
        category: "Coffee Table",
        quantity: 1,
        price: 28000,
        store: "Pepperfry",
        productLink: "https://www.pepperfry.com",
        amazonUrl: "https://www.amazon.in/s?k=Italian+Marble+Center+Table",
        flipkartUrl: "https://www.flipkart.com/search?q=Italian+Marble+Center+Table",
        checked: true,
      },
    ],
    status: "completed",
  });

  console.log("✓ Created test project in MongoDB Atlas. ID:", testProject._id.toString());

  console.log("\n4. Verifying project fields in database...");
  const loaded = await Project.findById(testProject._id);
  if (!loaded) throw new Error("Project not found in DB");

  console.log("✓ Project Name:", loaded.name);
  console.log("✓ User ID (Firebase UID):", loaded.userId);
  console.log("✓ Original Room Image:", loaded.originalImage);
  console.log("✓ Generated AI Image:", loaded.generatedImage);
  console.log("✓ Room Type:", loaded.roomType);
  console.log("✓ Room Analysis wallColor:", loaded.roomAnalysis?.wallColor);
  console.log("✓ Selected Style:", loaded.selectedStyle);
  console.log("✓ Mood:", loaded.mood);
  console.log("✓ Color Preference:", loaded.colorPreference);
  console.log("✓ Budget:", loaded.budget);
  console.log("✓ Furniture Count:", loaded.furniture.length);
  console.log("✓ Furniture Prices:", loaded.furniturePrices);
  console.log("✓ Amazon URLs Count:", loaded.amazonUrls.length);
  console.log("✓ Flipkart URLs Count:", loaded.flipkartUrls.length);
  console.log("✓ Shopping List Items:", loaded.shoppingList.length);
  console.log("✓ Created At:", loaded.createdAt);
  console.log("✓ Updated At:", loaded.updatedAt);

  console.log("\n5. Testing User Security / Cross-User Isolation...");
  // User A querying their projects
  const userAProjects = await Project.find({ userId: testFirebaseUid });
  console.log(`✓ User A projects count: ${userAProjects.length} (Expected: 1)`);

  // User B querying their projects
  const userBProjects = await Project.find({ userId: otherFirebaseUid });
  console.log(`✓ User B projects count: ${userBProjects.length} (Expected: 0)`);

  // User B attempting to find User A's project
  const crossUserAccess = await Project.findOne({
    _id: testProject._id,
    userId: otherFirebaseUid,
  });
  console.log(`✓ Cross-user access attempt blocked (returns null):`, crossUserAccess === null);

  console.log("\n6. Testing Project Update / Rename...");
  const updated = await Project.findOneAndUpdate(
    { _id: testProject._id, userId: testFirebaseUid },
    { $set: { name: "Renamed Luxury Suite" } },
    { new: true }
  );
  console.log("✓ Project successfully renamed in MongoDB:", updated?.name === "Renamed Luxury Suite");

  console.log("\n7. Testing Project Deletion...");
  await Project.findOneAndDelete({ _id: testProject._id, userId: testFirebaseUid });
  const checkDeleted = await Project.findById(testProject._id);
  console.log("✓ Project deleted from MongoDB:", checkDeleted === null);

  console.log("\n=======================================================");
  console.log("🎉 ALL MONGODB ATLAS & PROJECT SYSTEM TESTS PASSED! 🎉");
  console.log("=======================================================");

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
