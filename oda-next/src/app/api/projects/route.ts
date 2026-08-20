import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { getAmazonProductUrl, getFlipkartProductUrl } from '@/lib/store-links';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const userIds = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter(Boolean))
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

    const projectName =
      name?.trim() ||
      `${selectedStyle || style || 'Modern'} ${roomType || 'Living Room'} Project`;

    const primaryUserId = payload.firebaseUid || payload.userId;
    const origImg = originalImage || roomImage || '';
    const genImg =
      generatedImage ||
      (Array.isArray(designs) && designs[0]?.generatedImages?.[0]) ||
      selectedDesign?.generatedImages?.[0] ||
      '';

    // Normalize furniture list and ensure real Amazon & Flipkart URLs
    let normalizedFurniture: any[] = [];
    if (Array.isArray(furniture) && furniture.length > 0) {
      normalizedFurniture = furniture.map((f: any) => {
        const pName = f.name || f.productName || f.label || 'Furniture Item';
        return {
          name: pName,
          productName: pName,
          category: f.category || 'Furniture',
          brand: f.brand || 'Retailer',
          price: typeof f.price === 'number' ? f.price : parseInt(String(f.price || '0').replace(/[^\d]/g, ''), 10) || 15000,
          image: f.image || genImg || origImg,
          description: f.description || '',
          style: f.style || selectedStyle || style || 'Modern',
          rating: typeof f.rating === 'number' ? f.rating : 4.5,
          amazonUrl: getAmazonProductUrl(pName, f.amazonUrl),
          flipkartUrl: getFlipkartProductUrl(pName, f.flipkartUrl),
          productUrl: f.productUrl || '',
          storeName: f.storeName || f.store || 'Urban Ladder',
          inStock: f.inStock !== undefined ? f.inStock : true,
        };
      });
    } else if (selectedDesign?.hotspots && Array.isArray(selectedDesign.hotspots)) {
      normalizedFurniture = selectedDesign.hotspots.map((h: any, idx: number) => {
        const pName = h.label || `Furniture Item ${idx + 1}`;
        const numPrice = typeof h.price === 'number' ? h.price : parseInt(String(h.price || '0').replace(/[^\d]/g, ''), 10) || 15000;
        return {
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
          productUrl: h.productUrl || '',
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

    // Normalize designs array
    let normalizedDesigns: any[] = [];
    if (Array.isArray(designs) && designs.length > 0) {
      normalizedDesigns = designs;
    } else if (selectedDesign) {
      normalizedDesigns = [
        {
          style: selectedDesign.style || selectedStyle || style || 'Modern',
          furnitureStyle: selectedDesign.furnitureStyle || selectedStyle || style || 'Modern',
          mood: selectedDesign.mood || mood || 'Warm',
          color: selectedDesign.color || colorPreference || color || 'Neutral',
          budget: Number(selectedDesign.budget || budget || 200000),
          description: selectedDesign.description || '',
          generatedImages: selectedDesign.generatedImages || (genImg ? [genImg] : []),
          generatedImage: genImg,
          hotspots: selectedDesign.hotspots || [],
        },
      ];
    }

    // If projectId provided, check ownership and update
    if (projectId) {
      const userIds = Array.from(
        new Set([payload.userId, payload.firebaseUid].filter(Boolean))
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
        if (budgetPlan) existing.budgetPlan = budgetPlan;
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
      selectedStyle: selectedStyle || style || 'Modern',
      style: style || selectedStyle || 'Modern',
      mood: mood || 'Warm',
      colorPreference: colorPreference || color || 'Neutral',
      color: color || colorPreference || 'Neutral',
      budget: Number(budget || selectedDesign?.budget || 200000),
      selectedDesign: selectedDesign || (normalizedDesigns[0] ?? null),
      selectedDesignIndex: 0,
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
      designs: normalizedDesigns,
      furniture: normalizedFurniture,
      furniturePrices: prices,
      amazonUrls: azUrls,
      flipkartUrls: fkUrls,
      budgetPlan: budgetPlan || {
        totalBudget: Number(budget || 200000),
        allocations: [],
        remaining: Number(budget || 200000),
        spent: prices.reduce((a, b) => a + b, 0),
      },
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
    console.error('Project create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
