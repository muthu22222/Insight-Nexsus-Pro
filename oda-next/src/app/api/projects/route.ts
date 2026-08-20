import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { getAmazonProductUrl, getFlipkartProductUrl } from '@/lib/store-links';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const userIds: string[] = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
    );

    const projects = await Project.find({
      userId: { $in: userIds },
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Projects list error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const body = await request.json().catch(() => ({}));
    const {
      name,
      roomImage,
      originalImage,
      generatedImage,
      roomType,
      roomAnalysis,
      selectedStyle,
      style,
      mood,
      colorPreference,
      color,
      budget,
      selectedDesign,
      designs,
      furniture,
      furniturePrices,
      amazonUrls,
      flipkartUrls,
      budgetPlan,
      shoppingList,
      status,
      projectId,
    } = body;

    const primaryUserId = payload.firebaseUid || payload.userId;

    const projectName =
      (typeof name === 'string' && name.trim()) ||
      `${selectedStyle || style || 'Modern'} ${roomType || roomAnalysis?.roomType || 'Room'} Project`;

    const origImg = originalImage || roomImage || '';
    const genImg =
      generatedImage ||
      (selectedDesign && (selectedDesign.generatedImage || selectedDesign.generatedImages?.[0])) ||
      (Array.isArray(designs) && designs[0]?.generatedImages?.[0]) ||
      '';

    // Normalize designs
    let normalizedDesigns: any[] = [];
    if (Array.isArray(designs) && designs.length > 0) {
      normalizedDesigns = designs;
    } else if (selectedDesign) {
      normalizedDesigns = [selectedDesign];
    }

    // Normalize furniture items with real live store links
    let normalizedFurniture: any[] = [];
    if (Array.isArray(furniture) && furniture.length > 0) {
      normalizedFurniture = furniture.map((item: any, idx: number) => {
        const pName = item.name || item.productName || `Furniture Item ${idx + 1}`;
        const numPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 15000;
        return {
          _id: item._id || `furn_${idx + 1}`,
          name: pName,
          productName: pName,
          category: item.category || 'Furniture',
          brand: item.brand || 'Retailer',
          price: numPrice,
          image: item.image || genImg || origImg,
          description: item.description || '',
          style: item.style || selectedStyle || style || 'Modern',
          rating: item.rating || 4.5,
          amazonUrl: getAmazonProductUrl(pName, item.amazonUrl),
          flipkartUrl: getFlipkartProductUrl(pName, item.flipkartUrl),
          productUrl: item.productUrl || 'https://www.urbanladder.com',
          storeName: item.storeName || item.store || 'Urban Ladder',
          inStock: true,
        };
      });
    } else if (selectedDesign && Array.isArray(selectedDesign.hotspots)) {
      normalizedFurniture = selectedDesign.hotspots.map((h: any, idx: number) => {
        const pName = h.label || `Product ${idx + 1}`;
        const numPrice = typeof h.price === 'number' ? h.price : parseInt(String(h.price || '0').replace(/[^\d]/g, ''), 10) || 15000;
        return {
          _id: h.id || `hotspot_${idx + 1}`,
          name: pName,
          productName: pName,
          category: h.category || 'Furniture',
          brand: h.brand || 'Retailer',
          price: numPrice,
          image: h.image || genImg || origImg,
          description: h.description || '',
          style: selectedStyle || style || 'Modern',
          rating: 4.5,
          amazonUrl: getAmazonProductUrl(pName, h.amazonUrl),
          flipkartUrl: getFlipkartProductUrl(pName, h.flipkartUrl),
          productUrl: h.productUrl || 'https://www.urbanladder.com',
          storeName: h.store || 'Urban Ladder',
          inStock: true,
        };
      });
    }

    const prices =
      Array.isArray(furniturePrices) && furniturePrices.length > 0
        ? furniturePrices
        : normalizedFurniture.map((f) => f.price);

    const azUrls =
      Array.isArray(amazonUrls) && amazonUrls.length > 0
        ? amazonUrls
        : normalizedFurniture.map((f) => f.amazonUrl).filter(Boolean);

    const fkUrls =
      Array.isArray(flipkartUrls) && flipkartUrls.length > 0
        ? flipkartUrls
        : normalizedFurniture.map((f) => f.flipkartUrl).filter(Boolean);

    // Normalize shopping list
    let normalizedShoppingList: any[] = [];
    if (Array.isArray(shoppingList) && shoppingList.length > 0) {
      normalizedShoppingList = shoppingList.map((item: any) => ({
        furnitureId: item.furnitureId || '',
        productName: item.productName || item.name || '',
        name: item.name || item.productName || '',
        category: item.category || 'Furniture',
        quantity: item.quantity || 1,
        price: typeof item.price === 'number' ? item.price : parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 0,
        store: item.store || 'Store',
        productLink: item.productLink || '',
        amazonUrl: getAmazonProductUrl(item.productName || item.name || '', item.amazonUrl),
        flipkartUrl: getFlipkartProductUrl(item.productName || item.name || '', item.flipkartUrl),
        checked: item.checked || false,
      }));
    } else if (normalizedFurniture.length > 0) {
      normalizedShoppingList = normalizedFurniture.map((f) => ({
        furnitureId: f._id || '',
        productName: f.name,
        name: f.name,
        category: f.category,
        quantity: 1,
        price: f.price,
        store: f.storeName,
        productLink: f.productUrl,
        amazonUrl: f.amazonUrl,
        flipkartUrl: f.flipkartUrl,
        checked: false,
      }));
    }

    // Normalize budget plan
    const calculatedSpend = prices.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const targetBudget = Number(budget || selectedDesign?.budget || 200000);
    const plan = budgetPlan || {
      totalBudget: targetBudget,
      allocations: [
        { category: 'Main Furniture', amount: Math.round(targetBudget * 0.5), percentage: 50 },
        { category: 'Lighting & Decor', amount: Math.round(targetBudget * 0.25), percentage: 25 },
        { category: 'Textiles & Rugs', amount: Math.round(targetBudget * 0.25), percentage: 25 },
      ],
      remaining: Math.max(0, targetBudget - calculatedSpend),
      spent: calculatedSpend,
    };

    // If projectId provided, check ownership and update
    if (projectId) {
      const userIds: string[] = Array.from(
        new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
      );
      const existing = await Project.findOne({
        _id: projectId,
        userId: { $in: userIds },
      });

      if (existing) {
        existing.name = projectName;
        if (origImg) existing.originalImage = origImg;
        if (origImg) existing.roomImage = origImg;
        if (genImg) existing.generatedImage = genImg;
        if (roomType) existing.roomType = roomType;
        if (roomAnalysis) existing.roomAnalysis = roomAnalysis;
        if (selectedStyle || style) existing.selectedStyle = selectedStyle || style;
        if (style) existing.style = style;
        if (mood) existing.mood = mood;
        if (colorPreference || color) existing.colorPreference = colorPreference || color;
        if (color) existing.color = color;
        if (budget) existing.budget = Number(budget);
        if (selectedDesign) existing.selectedDesign = selectedDesign;
        if (normalizedDesigns.length > 0) existing.designs = normalizedDesigns;
        if (normalizedFurniture.length > 0) existing.furniture = normalizedFurniture;
        if (prices.length > 0) existing.furniturePrices = prices;
        if (azUrls.length > 0) existing.amazonUrls = azUrls;
        if (fkUrls.length > 0) existing.flipkartUrls = fkUrls;
        if (budgetPlan) existing.budgetPlan = plan;
        if (normalizedShoppingList.length > 0) existing.shoppingList = normalizedShoppingList;
        if (status) existing.status = status;

        await existing.save();
        return NextResponse.json({
          success: true,
          data: existing,
        });
      }
    }

    // Create new project
    const project = await Project.create({
      userId: primaryUserId,
      name: projectName,
      roomImage: origImg,
      originalImage: origImg,
      generatedImage: genImg,
      roomType: roomType || roomAnalysis?.roomType || 'Living Room',
      roomAnalysis: roomAnalysis || {
        roomType: roomType || 'Living Room',
        wallColor: '',
        flooring: '',
        ceiling: '',
        furniture: [],
        existingFurniture: [],
        suggestedFurniture: [],
        isEmptyRoom: false,
        windows: '',
        doors: '',
        lighting: '',
        emptyAreas: [],
        proportions: '',
      },
      selectedStyle: selectedStyle || style || 'Modern',
      style: selectedStyle || style || 'Modern',
      mood: mood || 'Warm',
      colorPreference: colorPreference || color || 'Neutral',
      color: colorPreference || color || 'Neutral',
      budget: targetBudget,
      selectedDesign: selectedDesign || (normalizedDesigns[0] ?? null),
      selectedDesignIndex: 0,
      designs: normalizedDesigns,
      furniture: normalizedFurniture,
      furniturePrices: prices,
      amazonUrls: azUrls,
      flipkartUrls: fkUrls,
      budgetPlan: plan,
      shoppingList: normalizedShoppingList,
      status: status || 'completed',
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Project create/update error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
