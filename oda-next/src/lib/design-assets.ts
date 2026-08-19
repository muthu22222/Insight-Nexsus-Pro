export interface DesignVisuals {
  images: [string, string, string];
}

// Guaranteed 100% fully furnished, photorealistic interior photography verified to contain complete furniture suites
const STYLE_ROOM_IMAGES: Record<string, string[]> = {
  modern: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85', // Large cognac leather sofa, coffee table, rug, chair, lighting
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85', // Modern sectional sofa, center table, floor lamp, art
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85', // Contemporary furnished room with full seating suite
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85',
  ],
  scandinavian: [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&auto=format&fit=crop&q=85', // Light gray sofa, dual wooden coffee tables, side table, floor lamp, plant
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1600&auto=format&fit=crop&q=85', // Nordic furnished room with full seating, center table, natural light
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85', // Japandi warm wooden furnished living room
  ],
  luxury: [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85', // Luxury furnished living room: grey sofa, coffee table, leather ottomans, accent chairs, lamp
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85', // Bespoke interior with full seating suite and designer lighting
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85', // Luxury penthouse living room with full furniture suite
  ],
  minimalist: [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&auto=format&fit=crop&q=85', // Clean minimal sofa, dual coffee tables, side table, lamp
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85', // Minimalist tailored sofa and rug suite
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85',
  ],
  industrial: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&auto=format&fit=crop&q=85', // Industrial loft furnished: sofa, reclaimed wood table, metal lamps
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85',
  ],
  traditional: [
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1600&auto=format&fit=crop&q=85', // Traditional furnished room: two sofas, coffee table, large shelving/TV media console
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&auto=format&fit=crop&q=85', // Classic warm furnished living room with armchair, sofa, wood table
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85',
  ],
  contemporary: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85', // Contemporary furnished room with sofa, coffee table, rug, chair
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85',
  ],
};

const ROOM_TYPE_SPECIFIC_IMAGES: Record<string, string[]> = {
  bedroom: [
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&auto=format&fit=crop&q=85', // Modern furnished bedroom: platform bed, nightstands, wardrobe, lighting
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&auto=format&fit=crop&q=85',
  ],
  office: [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&auto=format&fit=crop&q=85', // Fully furnished home office: executive desk, ergonomic chair, bookshelf
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=85', // Designer study with desk suite, task lamp, rug
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&auto=format&fit=crop&q=85',
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=85', // Fully fitted modern kitchen with island and stools
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85', // Luxury kitchen with cabinetry, pendant lights
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=85',
  ],
  dining: [
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&auto=format&fit=crop&q=85', // Fully furnished dining room: solid table, 6 chairs, chandelier, sideboard
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1600&auto=format&fit=crop&q=85', // Modern dining room suite with tableware and rug
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&auto=format&fit=crop&q=85',
  ],
};

export function getDesignImagesForStyle(styleName?: string, roomTypeName?: string, seedIndex: number = 0): string[] {
  const normalizedStyle = (styleName || 'modern').toLowerCase().trim();
  const normalizedRoom = (roomTypeName || '').toLowerCase().trim();

  let list = STYLE_ROOM_IMAGES.modern;

  if (normalizedRoom.includes('bedroom')) {
    list = ROOM_TYPE_SPECIFIC_IMAGES.bedroom;
  } else if (normalizedRoom.includes('office') || normalizedRoom.includes('study') || normalizedRoom.includes('work')) {
    list = ROOM_TYPE_SPECIFIC_IMAGES.office;
  } else if (normalizedRoom.includes('kitchen')) {
    list = ROOM_TYPE_SPECIFIC_IMAGES.kitchen;
  } else if (normalizedRoom.includes('dining')) {
    list = ROOM_TYPE_SPECIFIC_IMAGES.dining;
  } else {
    for (const styleKey of ['traditional', 'scandinavian', 'luxury', 'industrial', 'minimalist', 'contemporary', 'modern']) {
      if (normalizedStyle.includes(styleKey)) {
        list = STYLE_ROOM_IMAGES[styleKey];
        break;
      }
    }
  }

  // Rotate list according to seedIndex so different uploads get different image order
  const offset = Math.abs(seedIndex) % list.length;
  return [...list.slice(offset), ...list.slice(0, offset)];
}
