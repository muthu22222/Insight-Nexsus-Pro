export interface DesignVisuals {
  images: [string, string, string];
}

// Fully furnished, photorealistic interior photography with complete furniture suites (sofa, coffee table, rug, TV console, lighting, decor)
const STYLE_ROOM_IMAGES: Record<string, [string, string, string]> = {
  modern: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=85', // Fully furnished modern living room: L-sofa, coffee table, rug, art, plants
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85', // Fully furnished contemporary living room with seating, center table, lighting
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85', // Modern architectural living space with complete furniture suite
  ],
  scandinavian: [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&auto=format&fit=crop&q=85', // Scandinavian furnished living room: light wood, cozy sofa, rug, plant
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1600&auto=format&fit=crop&q=85', // Nordic furnished room with full seating, coffee table, natural light
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=85', // Japandi warm wooden furnished living room
  ],
  luxury: [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85', // Luxury furnished living room: marble table, velvet sofas, brass accents
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&auto=format&fit=crop&q=85', // Opulent bespoke interior with full seating suite and designer lighting
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&auto=format&fit=crop&q=85', // Luxury penthouse living room with full furniture suite
  ],
  minimalist: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85',
  ],
  industrial: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&auto=format&fit=crop&q=85', // Industrial loft furnished: leather sofa, reclaimed wood table, metal lamps
    'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1600&auto=format&fit=crop&q=85', // Urban industrial furnished space with complete furniture
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=85', // Industrial studio with seating, rugs, lamps
  ],
  traditional: [
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1600&auto=format&fit=crop&q=85', // Traditional furnished room: classic sofa, solid wood tables, Persian rug
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1600&auto=format&fit=crop&q=85', // Heritage furnished space with armchairs and wooden credenza
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&auto=format&fit=crop&q=85', // Classic warm furnished living room
  ],
  contemporary: [
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1600&auto=format&fit=crop&q=85', // Contemporary furnished room with curved sofa, nested tables, art
    'https://images.unsplash.com/photo-1618219740975-d40978bb7378?w=1600&auto=format&fit=crop&q=85', // Organic modern furnished space
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1600&auto=format&fit=crop&q=85', // Contemporary furnished living room
  ],
};

const ROOM_TYPE_SPECIFIC_IMAGES: Record<string, [string, string, string]> = {
  bedroom: [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&auto=format&fit=crop&q=85', // Fully furnished bedroom: platform bed, nightstands, lamps, rug, art
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&auto=format&fit=crop&q=85', // Modern furnished bedroom with bed frame, wardrobe, lighting
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&auto=format&fit=crop&q=85', // Scandinavian furnished bedroom
  ],
  office: [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&auto=format&fit=crop&q=85', // Fully furnished home office: executive desk, ergonomic chair, bookshelf
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=85', // Designer study with desk suite, task lamp, rug
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1600&auto=format&fit=crop&q=85', // Modern workstation with chair, desk, plants
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=85', // Fully fitted modern kitchen with island and stools
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85', // Luxury kitchen with cabinetry, pendant lights
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&auto=format&fit=crop&q=85', // Contemporary furnished kitchen
  ],
  dining: [
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&auto=format&fit=crop&q=85', // Fully furnished dining room: solid table, 6 chairs, chandelier, sideboard
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1600&auto=format&fit=crop&q=85', // Modern dining room suite with tableware and rug
    'https://images.unsplash.com/photo-1604074131665-7a4b13870ab5?w=1600&auto=format&fit=crop&q=85', // Contemporary dining room with lighting and chairs
  ],
};

export function getDesignImagesForStyle(styleName?: string, roomTypeName?: string): [string, string, string] {
  const normalizedStyle = (styleName || 'modern').toLowerCase().trim();
  const normalizedRoom = (roomTypeName || '').toLowerCase().trim();

  if (normalizedRoom.includes('bedroom')) {
    return ROOM_TYPE_SPECIFIC_IMAGES.bedroom;
  }
  if (normalizedRoom.includes('office') || normalizedRoom.includes('study') || normalizedRoom.includes('work')) {
    return ROOM_TYPE_SPECIFIC_IMAGES.office;
  }
  if (normalizedRoom.includes('kitchen')) {
    return ROOM_TYPE_SPECIFIC_IMAGES.kitchen;
  }
  if (normalizedRoom.includes('dining')) {
    return ROOM_TYPE_SPECIFIC_IMAGES.dining;
  }

  for (const [styleKey, images] of Object.entries(STYLE_ROOM_IMAGES)) {
    if (normalizedStyle.includes(styleKey) || styleKey.includes(normalizedStyle)) {
      return images;
    }
  }

  return STYLE_ROOM_IMAGES.modern;
}
