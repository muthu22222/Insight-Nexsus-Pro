import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { getDesignImagesForStyle } from '@/lib/design-assets';
import { matchFurnitureWithCatalog, DetectedItem } from '@/lib/furniture-matcher';
import { GEMINI_MODELS } from '@/lib/gemini';
import type { AIDesign, RoomAnalysis } from '@/types';

export const runtime = 'nodejs';

interface RawFurnitureDetection {
  style?: string;
  mood?: string;
  color?: string;
  budget?: number;
  description?: string;
  furniture?: Array<{
    name: string;
    category: string;
    style?: string;
    location?: string;
    material?: string;
    x?: number;
    y?: number;
    estimated_price?: number;
  }>;
}

// Generate realistic spatial coordinates for furniture categories based on room perspective
function getCoordinatesForCategory(category: string, index: number, roomType: string = 'Living Room'): { x: number; y: number; location: string } {
  const cat = (category || '').toLowerCase();
  const room = (roomType || 'Living Room').toLowerCase();

  if (room.includes('bedroom')) {
    if (cat.includes('bed') && !cat.includes('side') && !cat.includes('table')) return { x: 50, y: 58, location: 'Center back wall' };
    if (cat.includes('nightstand') || cat.includes('bedside') || cat.includes('side table')) {
      return index % 2 === 0 ? { x: 22, y: 62, location: 'Left bedside' } : { x: 78, y: 62, location: 'Right bedside' };
    }
    if (cat.includes('wardrobe') || cat.includes('closet') || cat.includes('dresser')) return { x: 88, y: 48, location: 'Right wall' };
    if (cat.includes('rug') || cat.includes('carpet')) return { x: 50, y: 82, location: 'Under bed footprint' };
    if (cat.includes('lamp') || cat.includes('light')) return { x: 24, y: 46, location: 'On nightstand' };
    if (cat.includes('curtain') || cat.includes('drape')) return { x: 12, y: 40, location: 'Window drape fold' };
    if (cat.includes('art') || cat.includes('canvas') || cat.includes('mirror')) return { x: 50, y: 25, location: 'Above headboard' };
    if (cat.includes('plant') || cat.includes('tree')) return { x: 88, y: 76, location: 'Corner of bedroom' };
  }

  if (room.includes('office') || room.includes('study') || room.includes('work')) {
    if (cat.includes('desk') || cat.includes('table')) return { x: 50, y: 62, location: 'Main study area' };
    if (cat.includes('chair')) return { x: 50, y: 52, location: 'At executive desk' };
    if (cat.includes('bookshelf') || cat.includes('shelf')) return { x: 20, y: 45, location: 'Left accent wall' };
    if (cat.includes('storage') || cat.includes('credenza') || cat.includes('cabinet')) return { x: 82, y: 56, location: 'Right wall' };
    if (cat.includes('lamp') || cat.includes('light')) return { x: 64, y: 48, location: 'On work desk' };
    if (cat.includes('rug')) return { x: 50, y: 84, location: 'Under desk footprint' };
    if (cat.includes('plant')) return { x: 86, y: 74, location: 'Study corner' };
  }

  if (room.includes('dining')) {
    if (cat.includes('dining table') || cat.includes('table')) return { x: 50, y: 62, location: 'Center dining area' };
    if (cat.includes('chair')) return { x: 50, y: 54, location: 'Around dining table' };
    if (cat.includes('sideboard') || cat.includes('buffet') || cat.includes('storage')) return { x: 84, y: 48, location: 'Back wall' };
    if (cat.includes('chandelier') || cat.includes('pendant') || cat.includes('light')) return { x: 50, y: 24, location: 'Suspended above dining table' };
    if (cat.includes('rug')) return { x: 50, y: 84, location: 'Under dining suite' };
    if (cat.includes('art') || cat.includes('mirror')) return { x: 22, y: 30, location: 'Main dining wall' };
  }

  if (room.includes('kitchen')) {
    if (cat.includes('island') || cat.includes('counter') || cat.includes('table')) return { x: 50, y: 64, location: 'Kitchen island center' };
    if (cat.includes('stool') || cat.includes('chair')) return { x: 42, y: 72, location: 'At kitchen island counter' };
    if (cat.includes('cabinet') || cat.includes('storage') || cat.includes('pantry')) return { x: 82, y: 46, location: 'Right wall cabinetry' };
    if (cat.includes('pendant') || cat.includes('light') || cat.includes('chandelier')) return { x: 50, y: 22, location: 'Suspended over kitchen island' };
    if (cat.includes('plant') || cat.includes('herb')) return { x: 88, y: 60, location: 'Kitchen counter corner' };
  }

  // LIVING ROOM (Default)
  if (cat.includes('sofa') || cat.includes('couch') || cat.includes('sectional')) return { x: 32, y: 64, location: 'Main seating area' };
  if (cat.includes('coffee') || cat.includes('center table') || cat.includes('nesting')) return { x: 54, y: 78, location: 'In front of sofa' };
  if (cat.includes('tv') || cat.includes('console') || cat.includes('media') || cat.includes('bookshelf') || cat.includes('shelf')) return { x: 50, y: 56, location: 'Main media wall' };
  if (cat.includes('armchair') || cat.includes('chair') || cat.includes('lounge') || cat.includes('ottoman') || cat.includes('pouffe')) return { x: 14, y: 82, location: 'Left accent corner' };
  if (cat.includes('rug') || cat.includes('carpet')) return { x: 42, y: 88, location: 'Floor under seating area' };
  if (cat.includes('curtain') || cat.includes('drape')) return { x: 94, y: 46, location: 'Window frame drapes' };
  if (cat.includes('lamp') || cat.includes('light')) return { x: 74, y: 52, location: 'Room corner / side table' };
  if (cat.includes('plant') || cat.includes('tree') || cat.includes('planter')) return { x: 88, y: 76, location: 'Corner indoor planter' };
  if (cat.includes('side table') || cat.includes('end table')) return { x: 70, y: 66, location: 'Beside seating' };
  if (cat.includes('art') || cat.includes('canvas') || cat.includes('mirror')) return { x: 20, y: 32, location: 'Main wall art frame' };

  const posX = Math.max(12, Math.min(88, 22 + ((index * 24) % 65)));
  const posY = Math.max(25, Math.min(88, 38 + ((index * 16) % 50)));
  return { x: posX, y: posY, location: 'Placed in room layout' };
}

// Build dynamic room furniture inventory tailored to room type and style
function buildDynamicSuite(
  roomType: string,
  existingFurniture: string[] = [],
  suggestedFurniture: string[] = [],
  furnitureStyle: string = 'Modern',
  budget: number = 200000
): DetectedItem[] {
  const normRoom = (roomType || 'Living Room').toLowerCase();
  const b = Number(budget) || 200000;
  const items: DetectedItem[] = [];
  const addedNames = new Set<string>();

  // 1. Process Existing Furniture (PRESERVE & UPGRADE)
  if (Array.isArray(existingFurniture) && existingFurniture.length > 0) {
    existingFurniture.forEach((item, idx) => {
      const cleanName = item.trim();
      if (!cleanName || addedNames.has(cleanName.toLowerCase())) return;
      addedNames.add(cleanName.toLowerCase());

      const coords = getCoordinatesForCategory(cleanName, idx, roomType);
      items.push({
        id: items.length + 1,
        name: `${furnitureStyle} ${cleanName}`,
        category: cleanName.includes('Sofa') ? 'Sofa' : cleanName.includes('TV') ? 'TV Unit' : cleanName.includes('Bed') ? 'Bed' : cleanName.includes('Desk') ? 'Desk' : cleanName.includes('Table') ? 'Coffee Table' : 'Furniture',
        style: furnitureStyle,
        location: coords.location,
        material: `${furnitureStyle} Premium Finish`,
        x: coords.x,
        y: coords.y,
        estimated_price: Math.round(b * (0.35 / Math.max(1, existingFurniture.length))),
      });
    });
  }

  // 2. Add Complementary Items to complete room
  const candidatesToAdd = (Array.isArray(suggestedFurniture) && suggestedFurniture.length > 0)
    ? suggestedFurniture
    : normRoom.includes('bedroom')
    ? ['Platform Bed Frame', 'Dual Bedside Nightstands', 'Plush Bedroom Area Rug', 'Ambient Bedside Table Lamps', 'Wardrobe', 'Linen Window Drapes', 'Wall Art', 'Indoor Planter']
    : normRoom.includes('office')
    ? ['Executive Computer Desk', 'Ergonomic Mesh Office Chair', 'Modular Bookshelf', 'Low-Pile Floor Rug', 'LED Desk Task Lamp', 'Storage Credenza', 'Potted Plant']
    : normRoom.includes('dining')
    ? ['Solid Hardwood Dining Table', 'Upholstered Dining Chairs', 'Linear Pendant Chandelier', 'Dining Sideboard Buffet', 'Flatweave Dining Rug', 'Wall Canvas Art']
    : normRoom.includes('kitchen')
    ? ['Kitchen Island Counter', 'Upholstered Bar Stools', 'Linear Pendant Lighting', 'Modular Storage Cabinet', 'Indoor Herb Planter']
    : ['Sectional Sofa', 'Center Coffee Table', 'TV Media Console', 'Accent Lounge Armchair', 'Handcrafted Wool Area Rug', 'Arched Floor Lamp', 'Linen Window Curtains', 'Wall Art', 'Potted Planter'];

  candidatesToAdd.forEach((item) => {
    const cleanName = item.trim();
    const lower = cleanName.toLowerCase();
    const alreadyExists = Array.from(addedNames).some((n) => lower.includes(n) || n.includes(lower));

    if (!alreadyExists && items.length < 8) {
      addedNames.add(lower);
      const coords = getCoordinatesForCategory(cleanName, items.length, roomType);
      const priceRatio = lower.includes('sofa') || lower.includes('bed') || lower.includes('dining table') || lower.includes('desk') ? 0.28 : lower.includes('coffee') || lower.includes('rug') || lower.includes('tv') || lower.includes('chair') || lower.includes('wardrobe') ? 0.12 : 0.05;

      items.push({
        id: items.length + 1,
        name: `${furnitureStyle} ${cleanName}`,
        category: cleanName.includes('Sofa') ? 'Sofa' : cleanName.includes('Table') ? 'Coffee Table' : cleanName.includes('Rug') ? 'Rug' : cleanName.includes('Chair') ? 'Armchair' : cleanName.includes('Lamp') || cleanName.includes('Chandelier') ? 'Lighting' : cleanName.includes('Curtain') || cleanName.includes('Drape') ? 'Curtains' : cleanName.includes('TV') ? 'TV Unit' : cleanName.includes('Plant') ? 'Plants' : 'Furniture',
        style: furnitureStyle,
        location: coords.location,
        material: `${furnitureStyle} Finish & Tailored Material`,
        x: coords.x,
        y: coords.y,
        estimated_price: Math.round(b * priceRatio),
      });
    }
  });

  return items;
}

// Server-side image fetcher and persistent file saver
async function resolveAndSaveGeneratedImage(
  visualPrompt: string,
  baseSeed: number,
  fallbackUrl: string,
  designId: string
): Promise<string> {
  const generatedDir = path.join(process.cwd(), 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const localFileName = `${designId}.jpg`;
  const localFilePath = path.join(generatedDir, localFileName);
  const publicUrl = `/generated/${localFileName}`;

  const fluxAiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt)}?width=1280&height=853&model=flux&seed=${baseSeed}&nologo=true`;

  try {
    const res = await fetch(fluxAiUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 5000) {
        fs.writeFileSync(localFilePath, Buffer.from(buffer));
        return publicUrl;
      }
    }
  } catch (e) {
    console.warn('[Design Generate] AI endpoint fetch timed out or failed, using curated image:', e instanceof Error ? e.message : e);
  }

  // If remote generation is slow, fetch fallback image and save locally
  try {
    const resFallback = await fetch(fallbackUrl, { signal: AbortSignal.timeout(5000) });
    if (resFallback.ok) {
      const buffer = await resFallback.arrayBuffer();
      fs.writeFileSync(localFilePath, Buffer.from(buffer));
      return publicUrl;
    }
  } catch {}

  return fallbackUrl;
}

export async function POST(request: NextRequest) {
  try {
    await authenticate(request, { optional: true });

    try {
      await connectToDatabase();
    } catch {}

    const body = await request.json().catch(() => ({}));
    const { imageUrl, imageId, requestId } = body;
    const roomAnalysis: RoomAnalysis = body.roomAnalysis || body.analysis || {};
    const preferences = body.preferences || {
      style: 'modern',
      furnitureStyle: 'modern',
      mood: 'warm',
      color: 'neutral',
      budget: 200000,
    };

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const budget = Number(preferences.budget) || 200000;
    const style = preferences.style || 'modern';
    const furnitureStyle = preferences.furnitureStyle || style;
    const roomType = roomAnalysis?.roomType || 'Living Room';
    const wallColor = roomAnalysis?.wallColor || 'neutral tone';
    const flooring = roomAnalysis?.flooring || 'hardwood flooring';
    const perspective = roomAnalysis?.perspective || 'eye-level architectural view';
    const windows = Array.isArray(roomAnalysis?.windows) ? roomAnalysis.windows.join(', ') : (roomAnalysis?.windows || 'windows');
    const doors = Array.isArray(roomAnalysis?.doors) ? roomAnalysis.doors.join(', ') : (roomAnalysis?.doors || 'doors');
    const existingFurniture = Array.isArray(roomAnalysis?.furniture) ? roomAnalysis.furniture : [];
    const suggestedFurniture = Array.isArray(roomAnalysis?.suggestedFurniture) ? roomAnalysis.suggestedFurniture : [];

    const hasExisting = existingFurniture.length > 0;
    
    // Unique deterministic seed derived from imageId, imageUrl, and timestamp
    const seedInput = `${imageId || ''}_${imageUrl ? imageUrl.slice(-30) : ''}_${Date.now()}`;
    const baseSeed = Math.abs(
      seedInput.split('').reduce((acc: number, c: string) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0)
    ) % 999999;

    const curatedImages = getDesignImagesForStyle(furnitureStyle, roomType, baseSeed);
    const furnitureList = normListForRoom(roomType, existingFurniture, suggestedFurniture, furnitureStyle);
    const designId = `${imageId || 'design'}_${baseSeed}`;

    let singleDesign: AIDesign | null = null;

    // 1. Attempt Gemini dynamic spatial furniture layout & coordinate synthesis for the SINGLE design
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const aiPrompt = `You are an expert AI interior designer and architectural 3D layout engine.
Create ONE photorealistic interior design redesign for this specific newly uploaded room:
- Room Type: ${roomType}
- Camera Perspective: ${perspective}
- Wall Color/Finish: ${wallColor}
- Flooring Material: ${flooring}
- Windows: ${windows}
- Doors: ${doors}
- Existing Furniture to PRESERVE & UPGRADE: ${hasExisting ? existingFurniture.join(', ') : 'None (Empty Room - must add complete furniture suite)'}
- Suggested Missing Furniture to COMPLETE ROOM: ${suggestedFurniture.join(', ')}
- Design Style: ${style}
- Furniture Aesthetic: ${furnitureStyle}
- Lighting Atmosphere: ${preferences.mood}
- Color Palette: ${preferences.color}
- Total Target Budget: ₹${budget.toLocaleString('en-IN')}

CRITICAL RULES:
1. The design MUST be fully furnished. Do NOT return an empty or bare room.
2. If existing furniture is listed, preserve its location and upgrade its materials and style to ${furnitureStyle}.
3. Add complementary items (sofa/bed/desk, coffee table, rug, lighting, curtains, plants, art) to fill the empty layout areas.
4. Provide exact visual percentage coordinates x (10-90) and y (10-90) on the room image where each furniture piece is situated.

Return ONLY a single JSON object structured as:
{
  "style": "${style.charAt(0).toUpperCase() + style.slice(1)} ${furnitureStyle.toUpperCase()} Redesign",
  "mood": "Detailed mood and spatial layout description for this room",
  "color": "${preferences.color} Palette",
  "budget": ${budget},
  "description": "Comprehensive description of the furnished room layout and preserved/added furniture pieces",
  "furniture": [
    {
      "name": "Specific item name",
      "category": "Sofa | Bed | Desk | Coffee Table | TV Unit | Armchair | Rug | Curtains | Lighting | Plants | Wall Art",
      "style": "${furnitureStyle}",
      "location": "Placement in room",
      "material": "Material and finish",
      "x": 32,
      "y": 64,
      "estimated_price": ${Math.round(budget * 0.25)}
    }
  ]
}`;

        let responseText = '';
        for (const modelName of GEMINI_MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('AI timeout')), 4000)
            );
            const res = await Promise.race([model.generateContent(aiPrompt), timeoutPromise]);
            responseText = (res as any)?.response?.text?.() || '';
            if (responseText) break;
          } catch (e) {
            console.warn(`[Design Generate] Gemini attempt with ${modelName} skipped:`, e instanceof Error ? e.message : e);
          }
        }

        if (responseText) {
          const cleanedText = responseText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedDesign: RawFurnitureDetection = JSON.parse(jsonMatch[0]);

            let detectedItems: DetectedItem[] = [];

            if (Array.isArray(parsedDesign.furniture) && parsedDesign.furniture.length > 0) {
              detectedItems = parsedDesign.furniture.map((item, idx) => {
                const fallbackCoords = getCoordinatesForCategory(item.category || item.name, idx, roomType);
                const validX = typeof item.x === 'number' && item.x >= 5 && item.x <= 95 ? item.x : fallbackCoords.x;
                const validY = typeof item.y === 'number' && item.y >= 5 && item.y <= 95 ? item.y : fallbackCoords.y;

                return {
                  id: idx + 1,
                  name: item.name,
                  category: item.category || 'Furniture',
                  style: item.style || furnitureStyle,
                  location: item.location || fallbackCoords.location,
                  material: item.material,
                  x: validX,
                  y: validY,
                  estimated_price: item.estimated_price,
                };
              });
            } else {
              detectedItems = buildDynamicSuite(
                roomType,
                existingFurniture,
                suggestedFurniture,
                furnitureStyle,
                budget
              );
            }

            const matchedHotspots = await matchFurnitureWithCatalog(
              detectedItems,
              budget,
              furnitureStyle
            );

            const visualPrompt = buildVisualPrompt(roomType, perspective, wallColor, flooring, windows, furnitureStyle, furnitureList, preferences.mood, preferences.color);

            const visualImage = await resolveAndSaveGeneratedImage(
              visualPrompt,
              baseSeed,
              curatedImages[0],
              designId
            );

            const preservedText = hasExisting
              ? `Preserving existing ${existingFurniture.join(', ')} (upgraded to ${furnitureStyle} style) + ${matchedHotspots.length - existingFurniture.length} added designer furniture pieces.`
              : `Fully furnished ${roomType} suite with ${matchedHotspots.length} verified products.`;

            singleDesign = {
              _id: designId,
              projectId: 'current',
              style: parsedDesign.style || `${style.charAt(0).toUpperCase() + style.slice(1)} ${furnitureStyle.toUpperCase()} Redesign`,
              furnitureStyle,
              mood: parsedDesign.mood || `Photorealistic ${furnitureStyle} redesign with complete furniture suite`,
              color: parsedDesign.color || `${preferences.color || 'Neutral'} Palette`,
              budget,
              description: parsedDesign.description || `Complete ${roomType} interior redesign. ${preservedText}`,
              generatedImages: [visualImage],
              hotspots: matchedHotspots,
            };
          }
        }
      } catch (err) {
        console.warn('[Design Generate] Gemini synthesis error, using dynamic fallback:', err);
      }
    }

    // 2. High-fidelity dynamic fallback engine if AI generation didn't produce object
    if (!singleDesign) {
      const detectedItems = buildDynamicSuite(
        roomType,
        existingFurniture,
        suggestedFurniture,
        furnitureStyle,
        budget
      );
      const matchedHotspots = await matchFurnitureWithCatalog(detectedItems, budget, furnitureStyle);
      const visualPrompt = buildVisualPrompt(roomType, perspective, wallColor, flooring, windows, furnitureStyle, furnitureList, preferences.mood, preferences.color);

      const visualImage = await resolveAndSaveGeneratedImage(
        visualPrompt,
        baseSeed,
        curatedImages[0],
        designId
      );

      const preservedText = hasExisting
        ? `Preserving existing ${existingFurniture.join(', ')} (upgraded to ${furnitureStyle} aesthetic) with ${matchedHotspots.length - existingFurniture.length} added designer pieces.`
        : `Complete ${furnitureStyle} furniture suite with ${matchedHotspots.length} catalog items.`;

      singleDesign = {
        _id: designId,
        projectId: 'current',
        style: `${style.charAt(0).toUpperCase() + style.slice(1)} ${furnitureStyle.toUpperCase()} Redesign`,
        furnitureStyle,
        mood: `Photorealistic ${furnitureStyle} redesign with complete furniture suite`,
        color: `${preferences.color || 'Neutral'} Palette`,
        budget,
        description: `Complete ${roomType} interior redesign. ${preservedText}`,
        generatedImages: [visualImage],
        hotspots: matchedHotspots,
      };
    }

    return NextResponse.json(
      {
        success: true,
        design: singleDesign,
        data: [singleDesign],
        designs: [singleDesign],
        imageId: imageId || null,
        requestId: requestId || null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Design generate general error:', error);
    const fallbackItems = buildDynamicSuite('Living Room', ['Sofa', 'TV Console'], ['Coffee Table', 'Rug', 'Floor Lamp'], 'modern', 200000);
    const hotspots = await matchFurnitureWithCatalog(fallbackItems, 200000, 'modern');
    const fallback = {
      _id: `fallback-1-${Date.now()}`,
      projectId: 'current',
      style: 'Modern Contemporary Redesign',
      furnitureStyle: 'modern',
      mood: 'Photorealistic Modern Redesign with complete furniture suite',
      color: 'Neutral Palette',
      budget: 200000,
      description: 'Complete interior redesign featuring preserved and matched furniture products.',
      generatedImages: [getDesignImagesForStyle('modern', 'Living Room')[0]],
      hotspots,
    };

    return NextResponse.json(
      {
        success: true,
        design: fallback,
        data: [fallback],
        designs: [fallback],
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

function normListForRoom(roomType: string, existing: string[], suggested: string[], fStyle: string): string[] {
  const norm = (roomType || 'Living Room').toLowerCase();
  if (existing.length > 0) {
    return [...existing.map(e => `${fStyle} ${e}`), ...suggested.slice(0, 5).map(s => `${fStyle} ${s}`)];
  }
  if (norm.includes('bedroom')) {
    return [
      `${fStyle} King Platform Bed Frame with tufted headboard`,
      'Dual matching bedside nightstands on left and right',
      'Warm ambient bedside table lamps with soft linen shades',
      'Plush high-pile bedroom area rug under bed footprint',
      'Sliding wardrobe with dark wood finish',
      'Floor-to-ceiling linen window drapes',
      'Framed canvas wall art above headboard',
      'Potted indoor plant in ceramic planter'
    ];
  }
  if (norm.includes('office') || norm.includes('study') || norm.includes('work')) {
    return [
      `Executive ${fStyle} computer desk with walnut top and cable grommets`,
      'Ergonomic high-back mesh office chair with lumbar support',
      'Modular open display bookshelf with curated books',
      'Low-pile acoustic floor rug under desk',
      'Architectural LED desk task lamp',
      'Storage credenza file cabinet',
      'Potted snake plant in ceramic pot',
      'Framed architectural wall art'
    ];
  }
  if (norm.includes('dining')) {
    return [
      `Solid hardwood 6-seater ${fStyle} dining table`,
      'Set of 6 upholstered ergonomic dining chairs',
      'Contemporary linear pendant chandelier suspended above table',
      'Modern dining sideboard credenza',
      'Flatweave stain-resistant dining area rug under dining suite',
      'Gallery framed canvas wall art'
    ];
  }
  if (norm.includes('kitchen')) {
    return [
      `Modern ${fStyle} kitchen island counter with quartz top`,
      'Set of 3 upholstered counter bar stools',
      'Linear pendant lighting fixture over island',
      'Modular pantry cabinetry with brass hardware',
      'Indoor herb planter on counter'
    ];
  }
  // Living Room Default
  return [
    `3-seater tailored ${fStyle} sofa with textured throw cushions`,
    'Round wooden coffee table in front of sofa',
    'Low-profile oak TV console unit with 65-inch TV on accent wall',
    'Plush geometric area rug on floor under seating',
    'Warm arched brass floor lamp in corner',
    'Cream bouclé lounge accent armchair',
    'Tailored linen curtains on sliding glass windows',
    'Potted monstera plant in ceramic planter',
    'Framed canvas wall art'
  ];
}

function buildVisualPrompt(
  roomType: string,
  perspective: string,
  wallColor: string,
  flooring: string,
  windows: string,
  fStyle: string,
  furnitureList: string[],
  mood: string,
  color: string
): string {
  const itemsText = furnitureList.join(', ');
  return `Photorealistic 8k architectural interior redesign of this ${roomType}, wide-angle ${perspective} photo with ${wallColor} walls, ${flooring} flooring, ${windows}. Visibly furnished with: ${itemsText}. ${mood} lighting atmosphere, ${color} color harmony, Architectural Digest photography, completely furnished room, realistic furniture placement, no empty room, no bare floor.`;
}
