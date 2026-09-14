import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Import models
import Project from '../models/Project';
import User from '../models/User';
import FurnitureItem from '../models/FurnitureItem';

const sampleProjectsData = [
  {
    name: 'Luxury Scandinavian Living Room',
    roomType: 'Living Room',
    style: 'Scandinavian',
    selectedStyle: 'Scandinavian Minimalist',
    mood: 'Calming & Airy',
    colorPreference: 'Warm Neutrals & Sage Green',
    color: 'Warm Beige & Sage',
    budget: 350000,
    status: 'completed' as const,
    originalImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    roomImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    generatedImage:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
    roomAnalysis: {
      roomType: 'Living Room',
      wallColor: 'Warm Alabaster / Neutral Beige',
      flooring: 'Light Natural Oak Hardwood',
      ceiling: 'Recessed 9ft ceiling with warm ambient LED strips',
      perspective: 'Eye-level wide perspective viewing main seating wall and bay windows',
      lighting: 'Abundant natural southern sunlight paired with 2700K warm recessed fixtures',
      windows: 'Large floor-to-ceiling double-glazed windows with linen sheer drapes',
      doors: 'Open archway connecting to foyer and hallway',
      proportions: '18ft x 14ft (Spacious rectangular layout)',
      isEmptyRoom: false,
      furniture: ['3-Seater Fabric Sofa', 'Round Coffee Table', 'Minimalist Media Console'],
      existingFurniture: [
        { item: '3-Seater Fabric Sofa', placement: 'Facing main wall', action: 'preserve' },
        { item: 'Round Coffee Table', placement: 'Center floor', action: 'preserve' },
      ],
      suggestedFurniture: [
        'Bouclé Swivel Accent Armchair',
        'Arched Brass Floor Lamp',
        'Large Hand-Knotted Wool Area Rug (9x12)',
        'Oak Floating Media Console',
        'Minimalist Ceramic Planter with Fiddle Leaf Fig',
      ],
      emptyAreas: [
        'Corner left of the window (ideal for reading nook with armchair and floor lamp)',
        'Main media wall (ideal for floating low console and gallery art)',
      ],
    },
    designs: [
      {
        style: 'Scandinavian Minimalist',
        mood: 'Calming & Airy',
        color: 'Warm Beige & Sage',
        budget: 350000,
        description:
          'A serene, Nordic-inspired interior blending light woods, textured bouclé fabrics, and soft botanical greens for everyday relaxation.',
        generatedImages: [
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
        ],
        generatedImage:
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
        hotspots: [
          {
            x: 48,
            y: 65,
            label: 'Harmony 3-Seater Sofa',
            category: 'Sofa',
            price: 74999,
            store: 'IKEA India',
            brand: 'IKEA',
            productUrl: 'https://www.ikea.com/in/en/p/harmony-sectional-sofa',
            amazonUrl: 'https://www.amazon.in/s?k=harmony+3+seater+sofa',
            flipkartUrl: 'https://www.flipkart.com/search?q=harmony+3+seater+sofa',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
          },
          {
            x: 52,
            y: 78,
            label: 'Solid Oak Round Coffee Table',
            category: 'Table',
            price: 18999,
            store: 'Urban Ladder',
            brand: 'Urban Ladder',
            productUrl: 'https://www.urbanladder.com/products/solid-oak-coffee-table',
            amazonUrl: 'https://www.amazon.in/s?k=solid+oak+round+coffee+table',
            flipkartUrl: 'https://www.flipkart.com/search?q=solid+oak+round+coffee+table',
            image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600',
          },
          {
            x: 25,
            y: 68,
            label: 'Bouclé Lounge Armchair',
            category: 'Chair',
            price: 24999,
            store: 'Pepperfry',
            brand: 'Pepperfry',
            productUrl: 'https://www.pepperfry.com/boucle-armchair.html',
            amazonUrl: 'https://www.amazon.in/s?k=boucle+lounge+armchair',
            flipkartUrl: 'https://www.flipkart.com/search?q=boucle+lounge+armchair',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
          },
          {
            x: 82,
            y: 50,
            label: 'Arched Brass Floor Lamp',
            category: 'Lamp',
            price: 8499,
            store: 'HomeTown',
            brand: 'HomeTown',
            productUrl: 'https://www.hometown.in/arched-brass-floor-lamp',
            amazonUrl: 'https://www.amazon.in/s?k=arched+brass+floor+lamp',
            flipkartUrl: 'https://www.flipkart.com/search?q=arched+brass+floor+lamp',
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
          },
        ],
      },
    ],
    furniture: [
      {
        name: 'Harmony 3-Seater Sofa',
        productName: 'Harmony 3-Seater Sofa',
        category: 'Sofa',
        brand: 'IKEA',
        price: 74999,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        description: 'Deep seating with breathable Nordic fabric and sustainable solid pine frame.',
        style: 'Scandinavian',
        rating: 4.8,
        amazonUrl: 'https://www.amazon.in/s?k=harmony+3+seater+sofa',
        flipkartUrl: 'https://www.flipkart.com/search?q=harmony+3+seater+sofa',
        productUrl: 'https://www.ikea.com/in/en/p/harmony-sectional-sofa',
        storeName: 'IKEA India',
        inStock: true,
      },
      {
        name: 'Solid Oak Round Coffee Table',
        productName: 'Solid Oak Round Coffee Table',
        category: 'Table',
        brand: 'Urban Ladder',
        price: 18999,
        image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600',
        description: 'Handcrafted natural European oak round table with smooth matte protective varnish.',
        style: 'Modern',
        rating: 4.7,
        amazonUrl: 'https://www.amazon.in/s?k=solid+oak+round+coffee+table',
        flipkartUrl: 'https://www.flipkart.com/search?q=solid+oak+round+coffee+table',
        productUrl: 'https://www.urbanladder.com/products/solid-oak-coffee-table',
        storeName: 'Urban Ladder',
        inStock: true,
      },
      {
        name: 'Bouclé Lounge Armchair',
        productName: 'Bouclé Lounge Armchair',
        category: 'Chair',
        brand: 'Pepperfry',
        price: 24999,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
        description: 'Curved cocoon silhouette with high-density foam padding and textured cream bouclé.',
        style: 'Modern',
        rating: 4.9,
        amazonUrl: 'https://www.amazon.in/s?k=boucle+lounge+armchair',
        flipkartUrl: 'https://www.flipkart.com/search?q=boucle+lounge+armchair',
        productUrl: 'https://www.pepperfry.com/boucle-armchair.html',
        storeName: 'Pepperfry',
        inStock: true,
      },
      {
        name: 'Arched Brass Floor Lamp',
        productName: 'Arched Brass Floor Lamp',
        category: 'Lamp',
        brand: 'HomeTown',
        price: 8499,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
        description: 'Graceful brushed brass arch with weighted natural marble base and dome diffuser.',
        style: 'Mid-Century',
        rating: 4.6,
        amazonUrl: 'https://www.amazon.in/s?k=arched+brass+floor+lamp',
        flipkartUrl: 'https://www.flipkart.com/search?q=arched+brass+floor+lamp',
        productUrl: 'https://www.hometown.in/arched-brass-floor-lamp',
        storeName: 'HomeTown',
        inStock: true,
      },
      {
        name: 'Hand-Knotted Wool Area Rug (9x12)',
        productName: 'Hand-Knotted Wool Area Rug (9x12)',
        category: 'Rug',
        brand: 'Pepperfry',
        price: 32999,
        image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600',
        description: 'Pure New Zealand wool rug with subtle organic tribal geometric line accents.',
        style: 'Scandinavian',
        rating: 4.9,
        amazonUrl: 'https://www.amazon.in/s?k=hand+knotted+wool+area+rug',
        flipkartUrl: 'https://www.flipkart.com/search?q=hand+knotted+wool+area+rug',
        productUrl: 'https://www.pepperfry.com/hand-knotted-wool-rug.html',
        storeName: 'Pepperfry',
        inStock: true,
      },
    ],
    furniturePrices: [74999, 18999, 24999, 8499, 32999],
    amazonUrls: [
      'https://www.amazon.in/s?k=harmony+3+seater+sofa',
      'https://www.amazon.in/s?k=solid+oak+round+coffee+table',
      'https://www.amazon.in/s?k=boucle+lounge+armchair',
    ],
    flipkartUrls: [
      'https://www.flipkart.com/search?q=harmony+3+seater+sofa',
      'https://www.flipkart.com/search?q=solid+oak+round+coffee+table',
    ],
    budgetPlan: {
      totalBudget: 350000,
      spent: 160495,
      remaining: 189505,
      allocations: [
        { category: 'Furniture', amount: 210000, percentage: 60 },
        { category: 'Lighting', amount: 45000, percentage: 13 },
        { category: 'Decor & Rugs', amount: 40000, percentage: 11 },
        { category: 'Wall Paint & Finishes', amount: 35000, percentage: 10 },
        { category: 'Installation & Delivery', amount: 20000, percentage: 6 },
      ],
    },
    shoppingList: [
      {
        productName: 'Harmony 3-Seater Sofa',
        name: 'Harmony 3-Seater Sofa',
        category: 'Sofa',
        quantity: 1,
        price: 74999,
        store: 'IKEA India',
        productLink: 'https://www.ikea.com/in/en/p/harmony-sectional-sofa',
        amazonUrl: 'https://www.amazon.in/s?k=harmony+3+seater+sofa',
        checked: true,
      },
      {
        productName: 'Solid Oak Round Coffee Table',
        name: 'Solid Oak Round Coffee Table',
        category: 'Table',
        quantity: 1,
        price: 18999,
        store: 'Urban Ladder',
        productLink: 'https://www.urbanladder.com/products/solid-oak-coffee-table',
        checked: true,
      },
      {
        productName: 'Bouclé Lounge Armchair',
        name: 'Bouclé Lounge Armchair',
        category: 'Chair',
        quantity: 1,
        price: 24999,
        store: 'Pepperfry',
        productLink: 'https://www.pepperfry.com/boucle-armchair.html',
        checked: false,
      },
      {
        productName: 'Arched Brass Floor Lamp',
        name: 'Arched Brass Floor Lamp',
        category: 'Lamp',
        quantity: 1,
        price: 8499,
        store: 'HomeTown',
        productLink: 'https://www.hometown.in/arched-brass-floor-lamp',
        checked: false,
      },
      {
        productName: 'Hand-Knotted Wool Area Rug (9x12)',
        name: 'Hand-Knotted Wool Area Rug (9x12)',
        category: 'Rug',
        quantity: 1,
        price: 32999,
        store: 'Pepperfry',
        productLink: 'https://www.pepperfry.com/hand-knotted-wool-rug.html',
        checked: false,
      },
    ],
  },
  {
    name: 'Japandi Zen Master Bedroom',
    roomType: 'Bedroom',
    style: 'Japandi',
    selectedStyle: 'Japandi Minimalist',
    mood: 'Serene & Grounded',
    colorPreference: 'Muted Earth Tones & Charcoal',
    color: 'Sand Beige & Slate',
    budget: 280000,
    status: 'completed' as const,
    originalImage:
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80',
    roomImage:
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80',
    generatedImage:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop&q=80',
    roomAnalysis: {
      roomType: 'Bedroom',
      wallColor: 'Limewash textured bone white',
      flooring: 'Matte bleached oak timber planks',
      ceiling: 'Minimal smooth ceiling with concealed cove warm lighting',
      perspective: 'Center frontal view facing master platform bed and flanking floating nightstands',
      lighting: 'Subdued ambient light with bedside touch-dimmable paper globe pendants',
      windows: 'East-facing window with custom sliding Japanese shoji-inspired screens',
      doors: 'Concealed flush-to-wall pocket door',
      proportions: '15ft x 13ft (Cozy master bedroom)',
      isEmptyRoom: false,
      furniture: ['King Platform Bed', 'Dual Floating Nightstands'],
      existingFurniture: [{ item: 'King Platform Bed', placement: 'Center wall', action: 'preserve' }],
      suggestedFurniture: [
        'Rice Paper Globe Pendant Lamps',
        'Flatweave Jute Rug',
        'Sliding Cane Wardrobe',
        'Minimalist Ceramic Bonsai Planter',
      ],
      emptyAreas: ['Right corner beside window (suitable for meditation bench or small dressing nook)'],
    },
    designs: [
      {
        style: 'Japandi Minimalist',
        mood: 'Serene & Grounded',
        color: 'Sand Beige & Slate',
        budget: 280000,
        description:
          'Harmonious fusion of Scandinavian functionality and Japanese wabi-sabi aesthetics, prioritizing raw textures and clean uncluttered lines.',
        generatedImages: [
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop&q=80',
        ],
        generatedImage:
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop&q=80',
        hotspots: [
          {
            x: 50,
            y: 62,
            label: 'Solid Teak Low Platform Bed',
            category: 'Bed',
            price: 64999,
            store: 'Urban Ladder',
            brand: 'Urban Ladder',
            productUrl: 'https://www.urbanladder.com/products/teak-platform-bed',
            image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
          },
          {
            x: 22,
            y: 68,
            label: 'Floating Oak Nightstand (Pair)',
            category: 'Table',
            price: 14999,
            store: 'Pepperfry',
            brand: 'Pepperfry',
            productUrl: 'https://www.pepperfry.com/floating-nightstand.html',
            image: 'https://images.unsplash.com/photo-1532372993498-1541c98198f2?w=600',
          },
          {
            x: 50,
            y: 85,
            label: 'Natural Fiber Organic Jute Rug',
            category: 'Rug',
            price: 12499,
            store: 'IKEA India',
            brand: 'IKEA',
            productUrl: 'https://www.ikea.com/in/en/p/jute-rug',
            image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600',
          },
        ],
      },
    ],
    furniture: [
      {
        name: 'Solid Teak Low Platform Bed',
        productName: 'Solid Teak Low Platform Bed',
        category: 'Bed',
        brand: 'Urban Ladder',
        price: 64999,
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
        description: 'Low-profile solid teak platform bed with Japanese joinery and recessed slats.',
        style: 'Japandi',
        rating: 4.9,
        productUrl: 'https://www.urbanladder.com/products/teak-platform-bed',
        storeName: 'Urban Ladder',
        inStock: true,
      },
      {
        name: 'Floating Oak Nightstands (Set of 2)',
        productName: 'Floating Oak Nightstands (Set of 2)',
        category: 'Table',
        brand: 'Pepperfry',
        price: 14999,
        image: 'https://images.unsplash.com/photo-1532372993498-1541c98198f2?w=600',
        description: 'Wall-mounted dual bedside drawer tables with soft-close Blum runners.',
        style: 'Minimalist',
        rating: 4.7,
        productUrl: 'https://www.pepperfry.com/floating-nightstand.html',
        storeName: 'Pepperfry',
        inStock: true,
      },
      {
        name: 'Woven Cane Sliding Wardrobe',
        productName: 'Woven Cane Sliding Wardrobe',
        category: 'Cabinet',
        brand: 'IKEA',
        price: 54999,
        image: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?w=600',
        description: '2-door sliding wardrobe featuring handwoven cane webbing inserts and ample modular shelving.',
        style: 'Japandi',
        rating: 4.8,
        productUrl: 'https://www.ikea.com/in/en/p/cane-sliding-wardrobe',
        storeName: 'IKEA India',
        inStock: true,
      },
    ],
    furniturePrices: [64999, 14999, 54999],
    amazonUrls: ['https://www.amazon.in/s?k=solid+teak+low+platform+bed'],
    flipkartUrls: ['https://www.flipkart.com/search?q=solid+teak+low+platform+bed'],
    budgetPlan: {
      totalBudget: 280000,
      spent: 134997,
      remaining: 145003,
      allocations: [
        { category: 'Furniture', amount: 165000, percentage: 59 },
        { category: 'Lighting', amount: 35000, percentage: 12 },
        { category: 'Bedding & Linen', amount: 30000, percentage: 11 },
        { category: 'Finishes & Drapes', amount: 30000, percentage: 11 },
        { category: 'Delivery & Setup', amount: 20000, percentage: 7 },
      ],
    },
    shoppingList: [
      {
        productName: 'Solid Teak Low Platform Bed',
        name: 'Solid Teak Low Platform Bed',
        category: 'Bed',
        quantity: 1,
        price: 64999,
        store: 'Urban Ladder',
        productLink: 'https://www.urbanladder.com/products/teak-platform-bed',
        checked: true,
      },
      {
        productName: 'Floating Oak Nightstands (Set of 2)',
        name: 'Floating Oak Nightstands (Set of 2)',
        category: 'Table',
        quantity: 1,
        price: 14999,
        store: 'Pepperfry',
        productLink: 'https://www.pepperfry.com/floating-nightstand.html',
        checked: true,
      },
      {
        productName: 'Woven Cane Sliding Wardrobe',
        name: 'Woven Cane Sliding Wardrobe',
        category: 'Cabinet',
        quantity: 1,
        price: 54999,
        store: 'IKEA India',
        productLink: 'https://www.ikea.com/in/en/p/cane-sliding-wardrobe',
        checked: false,
      },
    ],
  },
  {
    name: 'Modern Ergonomic Home Office',
    roomType: 'Home Office',
    style: 'Modern Industrial',
    selectedStyle: 'Modern Industrial',
    mood: 'Focused & Crisp',
    colorPreference: 'Charcoal, Walnut & Brass',
    color: 'Matte Black & Walnut',
    budget: 175000,
    status: 'completed' as const,
    originalImage:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
    roomImage:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
    generatedImage:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&auto=format&fit=crop&q=80',
    roomAnalysis: {
      roomType: 'Home Office',
      wallColor: 'Accent deep slate gray with exposed architectural concrete',
      flooring: 'Vitrified matte concrete-finish tiles',
      ceiling: 'Exposed conduits with linear magnetic track spotlights',
      perspective: 'Three-quarter wide angle capturing desk setup and floor-to-ceiling bookshelf',
      lighting: 'Adjustable 4000K daylight LED task lighting with indirect bias light',
      windows: 'Corner window with matte black aluminum Venetian blinds',
      doors: 'Single acoustic solid core timber door',
      proportions: '12ft x 11ft (Compact focused studio)',
      isEmptyRoom: false,
      furniture: ['Standing Executive Desk', 'Ergonomic Mesh Chair'],
      existingFurniture: [
        { item: 'Standing Executive Desk', placement: 'Center facing window', action: 'preserve' },
      ],
      suggestedFurniture: [
        'Ergonomic Mesh Task Chair',
        'Modular Open Metal Bookshelf',
        'Acoustic Felt Floor Mat',
        'Architectural Balance Desk Lamp',
      ],
      emptyAreas: ['Back wall (ideal for acoustic pinboard and reference library bookshelf)'],
    },
    designs: [
      {
        style: 'Modern Industrial',
        mood: 'Focused & Crisp',
        color: 'Matte Black & Walnut',
        budget: 175000,
        description:
          'High-productivity workspace built with ergonomic furniture, anti-glare task lighting, and smart cable management.',
        generatedImages: [
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&auto=format&fit=crop&q=80',
        ],
        generatedImage:
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&auto=format&fit=crop&q=80',
        hotspots: [
          {
            x: 45,
            y: 65,
            label: 'Dual Motor Height-Adjustable Desk',
            category: 'Table',
            price: 36999,
            store: 'Pepperfry',
            brand: 'Pepperfry',
            productUrl: 'https://www.pepperfry.com/standing-desk.html',
            image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
          },
          {
            x: 48,
            y: 72,
            label: 'Ergonomic Lumbar Mesh Office Chair',
            category: 'Chair',
            price: 18999,
            store: 'IKEA India',
            brand: 'IKEA',
            productUrl: 'https://www.ikea.com/in/en/p/markus-office-chair',
            image: 'https://images.unsplash.com/photo-1580481077195-c228ff31a78a?w=600',
          },
        ],
      },
    ],
    furniture: [
      {
        name: 'Dual Motor Height-Adjustable Desk',
        productName: 'Dual Motor Height-Adjustable Desk',
        category: 'Table',
        brand: 'Pepperfry',
        price: 36999,
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
        description: 'Smooth motorized sit-stand desk with walnut veneer top, anti-collision sensor, and preset memory.',
        style: 'Modern',
        rating: 4.8,
        productUrl: 'https://www.pepperfry.com/standing-desk.html',
        storeName: 'Pepperfry',
        inStock: true,
      },
      {
        name: 'Ergonomic Lumbar Mesh Office Chair',
        productName: 'Ergonomic Lumbar Mesh Office Chair',
        category: 'Chair',
        brand: 'IKEA',
        price: 18999,
        image: 'https://images.unsplash.com/photo-1580481077195-c228ff31a78a?w=600',
        description: 'High-back mesh chair with adjustable lumbar support, 4D armrests, and synchronous tilt mechanism.',
        style: 'Modern',
        rating: 4.9,
        productUrl: 'https://www.ikea.com/in/en/p/markus-office-chair',
        storeName: 'IKEA India',
        inStock: true,
      },
      {
        name: 'Modular Steel & Walnut Bookshelf',
        productName: 'Modular Steel & Walnut Bookshelf',
        category: 'Shelf',
        brand: 'Urban Ladder',
        price: 26999,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
        description: '5-tier architectural open storage shelving with powder-coated steel frame and solid wood shelves.',
        style: 'Industrial',
        rating: 4.7,
        productUrl: 'https://www.urbanladder.com/products/bookshelf',
        storeName: 'Urban Ladder',
        inStock: true,
      },
    ],
    furniturePrices: [36999, 18999, 26999],
    amazonUrls: ['https://www.amazon.in/s?k=dual+motor+height+adjustable+desk'],
    flipkartUrls: ['https://www.flipkart.com/search?q=dual+motor+height+adjustable+desk'],
    budgetPlan: {
      totalBudget: 175000,
      spent: 82997,
      remaining: 92003,
      allocations: [
        { category: 'Desk & Seating', amount: 75000, percentage: 43 },
        { category: 'Storage & Bookshelves', amount: 40000, percentage: 23 },
        { category: 'Task Lighting & Electrics', amount: 30000, percentage: 17 },
        { category: 'Decor & Acoustics', amount: 20000, percentage: 11 },
        { category: 'Setup', amount: 10000, percentage: 6 },
      ],
    },
    shoppingList: [
      {
        productName: 'Dual Motor Height-Adjustable Desk',
        name: 'Dual Motor Height-Adjustable Desk',
        category: 'Table',
        quantity: 1,
        price: 36999,
        store: 'Pepperfry',
        productLink: 'https://www.pepperfry.com/standing-desk.html',
        checked: true,
      },
      {
        productName: 'Ergonomic Lumbar Mesh Office Chair',
        name: 'Ergonomic Lumbar Mesh Office Chair',
        category: 'Chair',
        quantity: 1,
        price: 18999,
        store: 'IKEA India',
        productLink: 'https://www.ikea.com/in/en/p/markus-office-chair',
        checked: true,
      },
      {
        productName: 'Modular Steel & Walnut Bookshelf',
        name: 'Modular Steel & Walnut Bookshelf',
        category: 'Shelf',
        quantity: 1,
        price: 26999,
        store: 'Urban Ladder',
        productLink: 'https://www.urbanladder.com/products/bookshelf',
        checked: false,
      },
    ],
  },
  {
    name: 'Boho Chic Dining Sanctuary',
    roomType: 'Dining Room',
    style: 'Bohemian',
    selectedStyle: 'Bohemian Warm',
    mood: 'Vibrant & Welcoming',
    colorPreference: 'Terracotta, Ochre & Natural Wood',
    color: 'Terracotta & Warm Cream',
    budget: 220000,
    status: 'designing' as const,
    originalImage:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&auto=format&fit=crop&q=80',
    roomImage:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&auto=format&fit=crop&q=80',
    generatedImage:
      'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=1200&auto=format&fit=crop&q=80',
    roomAnalysis: {
      roomType: 'Dining Room',
      wallColor: 'Subtle warm lime plastered walls in desert sand',
      flooring: 'Handmade terracotta patterned floor tiles',
      ceiling: 'White painted beams with central woven pendant cord',
      perspective: 'Eye-level wide shot focused on 6-seater dining table and open buffet credenza',
      lighting: 'Warm 2400K woven bamboo cluster pendant lights',
      windows: 'Double French balcony doors leading to garden patio',
      doors: 'Arched entry opening into kitchen corridor',
      proportions: '14ft x 12ft (Intimate dining space)',
      isEmptyRoom: false,
      furniture: ['Solid Sheesham Dining Table', 'Cane Dining Chairs'],
      existingFurniture: [
        { item: 'Solid Sheesham Dining Table', placement: 'Center room', action: 'preserve' },
      ],
      suggestedFurniture: [
        'Woven Rattan Dining Chairs (Set of 6)',
        'Bamboo Multi-Tier Pendant Chandelier',
        'Carved Wood Sideboard Buffet',
        'Handmade Ceramic Dinnerware Set',
      ],
      emptyAreas: ['Wall opposite French doors (perfect for rustic credenza sideboard buffet)'],
    },
    designs: [
      {
        style: 'Bohemian Warm',
        mood: 'Vibrant & Welcoming',
        color: 'Terracotta & Warm Cream',
        budget: 220000,
        description:
          'Warm textured dining setting featuring solid sheesham wood, handwoven cane seating, and organic earthen dinnerware.',
        generatedImages: [
          'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=1200&auto=format&fit=crop&q=80',
        ],
        generatedImage:
          'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=1200&auto=format&fit=crop&q=80',
        hotspots: [
          {
            x: 50,
            y: 65,
            label: 'Solid Sheesham 6-Seater Dining Table',
            category: 'Table',
            price: 42999,
            store: 'Urban Ladder',
            brand: 'Urban Ladder',
            productUrl: 'https://www.urbanladder.com/products/sheesham-dining-table',
            image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
          },
          {
            x: 35,
            y: 68,
            label: 'Natural Cane Bistro Dining Chairs (Pair)',
            category: 'Chair',
            price: 16999,
            store: 'Pepperfry',
            brand: 'Pepperfry',
            productUrl: 'https://www.pepperfry.com/cane-dining-chairs.html',
            image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600',
          },
        ],
      },
    ],
    furniture: [
      {
        name: 'Solid Sheesham 6-Seater Dining Table',
        productName: 'Solid Sheesham 6-Seater Dining Table',
        category: 'Table',
        brand: 'Urban Ladder',
        price: 42999,
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
        description: 'Rich natural grain Sheesham hardwood table with beveled edges and sturdy square legs.',
        style: 'Traditional',
        rating: 4.8,
        productUrl: 'https://www.urbanladder.com/products/sheesham-dining-table',
        storeName: 'Urban Ladder',
        inStock: true,
      },
      {
        name: 'Natural Cane Bistro Dining Chairs (Pair)',
        productName: 'Natural Cane Bistro Dining Chairs (Pair)',
        category: 'Chair',
        brand: 'Pepperfry',
        price: 16999,
        image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600',
        description: 'Steam-bent solid ash wood chairs with breathable woven French cane backrests.',
        style: 'Bohemian',
        rating: 4.9,
        productUrl: 'https://www.pepperfry.com/cane-dining-chairs.html',
        storeName: 'Pepperfry',
        inStock: true,
      },
      {
        name: 'Woven Bamboo Tiered Chandelier',
        productName: 'Woven Bamboo Tiered Chandelier',
        category: 'Lamp',
        brand: 'IKEA',
        price: 7999,
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
        description: 'Handmade artisanal woven bamboo lantern fixture casting intricate ambient shadow patterns.',
        style: 'Bohemian',
        rating: 4.7,
        productUrl: 'https://www.ikea.com/in/en/p/bamboo-chandelier',
        storeName: 'IKEA India',
        inStock: true,
      },
    ],
    furniturePrices: [42999, 16999, 7999],
    amazonUrls: ['https://www.amazon.in/s?k=sheesham+dining+table'],
    flipkartUrls: ['https://www.flipkart.com/search?q=sheesham+dining+table'],
    budgetPlan: {
      totalBudget: 220000,
      spent: 67997,
      remaining: 152003,
      allocations: [
        { category: 'Dining Table & Chairs', amount: 110000, percentage: 50 },
        { category: 'Sideboard Buffet', amount: 45000, percentage: 20 },
        { category: 'Lighting & Pendants', amount: 25000, percentage: 11 },
        { category: 'Tableware & Linens', amount: 25000, percentage: 11 },
        { category: 'Delivery & Assembly', amount: 15000, percentage: 7 },
      ],
    },
    shoppingList: [
      {
        productName: 'Solid Sheesham 6-Seater Dining Table',
        name: 'Solid Sheesham 6-Seater Dining Table',
        category: 'Table',
        quantity: 1,
        price: 42999,
        store: 'Urban Ladder',
        productLink: 'https://www.urbanladder.com/products/sheesham-dining-table',
        checked: true,
      },
      {
        productName: 'Natural Cane Bistro Dining Chairs (Pair)',
        name: 'Natural Cane Bistro Dining Chairs (Pair)',
        category: 'Chair',
        quantity: 3,
        price: 16999,
        store: 'Pepperfry',
        productLink: 'https://www.pepperfry.com/cane-dining-chairs.html',
        checked: false,
      },
      {
        productName: 'Woven Bamboo Tiered Chandelier',
        name: 'Woven Bamboo Tiered Chandelier',
        category: 'Lamp',
        quantity: 1,
        price: 7999,
        store: 'IKEA India',
        productLink: 'https://www.ikea.com/in/en/p/bamboo-chandelier',
        checked: false,
      },
    ],
  },
];

async function seedDummyData() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI?.split('@')[1] || 'localhost');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB successfully.');

    // Fetch all existing users from database
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} registered users in DB:`);
    users.forEach((u) => console.log(` - ${u.email} (id: ${u._id})`));

    // Target users include all found users + 'test_user_1'
    const targetUserIds: string[] = [];
    for (const u of users) {
      targetUserIds.push(u._id.toString());
      if ((u as any).firebaseUid) {
        targetUserIds.push((u as any).firebaseUid);
      }
    }
    targetUserIds.push('test_user_1');

    console.log(`\nRemoving previous demo projects for targeted users...`);
    await Project.deleteMany({ userId: { $in: targetUserIds } });

    console.log(`\nSeeding dummy projects for users...`);
    let totalInserted = 0;

    // We will assign projects to each unique user
    for (const user of users) {
      const userProjects = sampleProjectsData.map((p, index) => ({
        ...p,
        // Primary user identifier
        userId: (user as any).firebaseUid || user._id.toString(),
        selectedDesign: p.designs[0],
        selectedDesignIndex: 0,
      }));

      const inserted = await Project.insertMany(userProjects);
      totalInserted += inserted.length;
      console.log(`✓ Inserted ${inserted.length} projects for user: ${user.email} (${(user as any).firebaseUid || user._id})`);
    }

    // Also add a set with 'test_user_1' for guests / local dev fallback
    const guestProjects = sampleProjectsData.map((p) => ({
      ...p,
      userId: 'test_user_1',
      selectedDesign: p.designs[0],
      selectedDesignIndex: 0,
    }));
    await Project.insertMany(guestProjects);
    totalInserted += guestProjects.length;
    console.log(`✓ Inserted ${guestProjects.length} projects for guest/demo fallback (test_user_1)`);

    console.log(`\n==============================================`);
    console.log(`TOTAL DUMMY PROJECTS SEEDED: ${totalInserted}`);
    console.log(`==============================================`);

    // Verify projects count in DB
    const count = await Project.countDocuments();
    console.log(`Total projects currently in database: ${count}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB. Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding dummy data:', error);
    process.exit(1);
  }
}

seedDummyData();
