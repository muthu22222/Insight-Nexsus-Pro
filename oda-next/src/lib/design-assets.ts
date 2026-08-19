export interface DesignVisuals {
  images: [string, string, string];
}

// Guaranteed 100% fully furnished, photorealistic interior photography stored locally on disk
const STYLE_ROOM_IMAGES: Record<string, string[]> = {
  modern: [
    '/images/designs/modern_living_1.jpg', // 2 Sofas, Coffee Table, Area Rug, TV/Media Wall Unit
    '/images/designs/modern_living_2.jpg', // Large Sectional Sofa, Dual Coffee Tables, Large Rug, TV Console Cabinetry
    '/images/designs/luxury_living.jpg',   // Velvet Sofa, Coffee Table, Rug, Lounge Chairs, Ottomans, Lamp
    '/images/designs/scandi_living.jpg',   // Large Sectional Sofa, Round Coffee Table, Rug, Armchair, Side Table
  ],
  scandinavian: [
    '/images/designs/scandi_living.jpg',   // Nordic Sectional Sofa, Round Wood Coffee Table, Textured Rug, Armchair, Lamp
    '/images/designs/modern_living_1.jpg', // Dual Sofas, Wood Coffee Table, Media Unit, Wool Rug
    '/images/designs/luxury_living.jpg',
  ],
  luxury: [
    '/images/designs/luxury_living.jpg',   // Luxury Penthouse: Velvet Sofa, Coffee Table, Leather Chairs, Ottomans, Lamp, Rug
    '/images/designs/modern_living_2.jpg', // Sectional Sofa, Marble Coffee Table, TV Wall Cabinetry, Rug
    '/images/designs/modern_living_1.jpg',
  ],
  minimalist: [
    '/images/designs/scandi_living.jpg',   // Tailored Minimal Sofa, Round Coffee Table, Neutral Rug, Armchair
    '/images/designs/modern_living_1.jpg',
    '/images/designs/modern_living_2.jpg',
  ],
  industrial: [
    '/images/designs/modern_living_1.jpg', // Industrial Loft: Sofas, Wood & Metal Coffee Table, Media Unit, Rug
    '/images/designs/luxury_living.jpg',
    '/images/designs/modern_living_2.jpg',
  ],
  traditional: [
    '/images/designs/modern_living_1.jpg', // Traditional: 2 Full Sofas, Center Coffee Table, TV Media Shelving Console, Rug
    '/images/designs/luxury_living.jpg',
    '/images/designs/modern_living_2.jpg',
  ],
  contemporary: [
    '/images/designs/modern_living_2.jpg', // Contemporary Sectional, Coffee Table, Media Unit, Area Rug
    '/images/designs/modern_living_1.jpg',
    '/images/designs/luxury_living.jpg',
    '/images/designs/scandi_living.jpg',
  ],
};

const ROOM_TYPE_SPECIFIC_IMAGES: Record<string, string[]> = {
  bedroom: [
    '/images/designs/bedroom.jpg', // Platform Bed, Bedside Tables, Large Rug, Accent Chair, Lighting
    '/images/designs/bedroom.jpg',
  ],
  office: [
    '/images/designs/office.jpg',  // Executive Desk Suite, Ergonomic Seating, Coffee Tables, Rugs, Shelving
    '/images/designs/office.jpg',
  ],
  kitchen: [
    '/images/designs/modern_living_2.jpg', // Kitchen Island, Counter Stools, Cabinetry, Living Seating Suite
    '/images/designs/modern_living_2.jpg',
  ],
  dining: [
    '/images/designs/dining.jpg',  // Solid Dining Table, 6 Dining Chairs, Sideboard Buffet, Area Rug, Chandelier
    '/images/designs/dining.jpg',
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
