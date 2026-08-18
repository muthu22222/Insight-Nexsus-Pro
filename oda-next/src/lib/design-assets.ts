export interface DesignVisuals {
  images: [string, string, string];
}

const STYLE_ROOM_IMAGES: Record<string, [string, string, string]> = {
  modern: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85',
  ],
  minimalist: [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85',
  ],
  luxury: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&auto=format&fit=crop&q=85',
  ],
  scandinavian: [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=85',
  ],
  industrial: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1600&auto=format&fit=crop&q=85',
  ],
  traditional: [
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&auto=format&fit=crop&q=85',
  ],
  contemporary: [
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1618219740975-d40978bb7378?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1600&auto=format&fit=crop&q=85',
  ],
};

const ROOM_TYPE_SPECIFIC_IMAGES: Record<string, [string, string, string]> = {
  bedroom: [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&auto=format&fit=crop&q=85',
  ],
  office: [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1600&auto=format&fit=crop&q=85',
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&auto=format&fit=crop&q=85',
  ],
  dining: [
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1600&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1604074131665-7a4b13870ab5?w=1600&auto=format&fit=crop&q=85',
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
