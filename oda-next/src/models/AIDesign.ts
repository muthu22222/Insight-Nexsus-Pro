import mongoose, { Schema, Document } from 'mongoose';

export interface IHotspot {
  id?: string | number;
  x: number;
  y: number;
  label: string;
  category?: string;
  description?: string;
  price?: string | number;
  store?: string;
  brand?: string;
  material?: string;
  productUrl?: string;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  image?: string;
  match?: number;
  furnitureId?: string;
}

export interface IAIDesign {
  _id?: any;
  projectId?: string;
  style: string;
  furnitureStyle?: string;
  mood: string;
  color: string;
  budget: number;
  description?: string;
  generatedImages: string[];
  generatedImage?: string;
  hotspots: IHotspot[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const HotspotSchema = new Schema<IHotspot>(
  {
    id: {
      type: Schema.Types.Mixed,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    x: {
      type: Number,
      default: 50,
    },
    y: {
      type: Number,
      default: 50,
    },
    label: {
      type: String,
      default: 'Furniture Item',
    },
    category: {
      type: String,
      default: 'Furniture',
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Schema.Types.Mixed,
      default: 0,
    },
    store: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      default: '',
    },
    material: {
      type: String,
      default: '',
    },
    productUrl: {
      type: String,
      default: '',
    },
    amazonUrl: {
      type: String,
      default: null,
    },
    flipkartUrl: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    match: {
      type: Number,
      default: 95,
    },
    furnitureId: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

export const AIDesignSchema = new Schema(
  {
    _id: {
      type: Schema.Types.Mixed,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    projectId: {
      type: String,
      default: '',
    },
    style: {
      type: String,
      default: 'Modern',
    },
    furnitureStyle: {
      type: String,
      default: 'Modern',
    },
    mood: {
      type: String,
      default: 'Warm',
    },
    color: {
      type: String,
      default: 'Neutral',
    },
    budget: {
      type: Number,
      default: 200000,
    },
    description: {
      type: String,
      default: '',
    },
    generatedImages: {
      type: [String],
      default: [],
    },
    generatedImage: {
      type: String,
      default: '',
    },
    hotspots: {
      type: [HotspotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.AIDesign) {
  delete mongoose.models.AIDesign;
}

const AIDesign = mongoose.model('AIDesign', AIDesignSchema);

export default AIDesign;
