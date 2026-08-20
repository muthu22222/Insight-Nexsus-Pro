import mongoose, { Schema, Document } from 'mongoose';

export interface IFurniture extends Document {
  name: string;
  productName: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  style: string;
  rating: number;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  productUrl: string;
  storeName: string;
  inStock: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const FurnitureSchema = new Schema<IFurniture>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      trim: true,
      default: function (this: IFurniture) {
        return this.name;
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    brand: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    style: {
      type: String,
      default: 'Modern',
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    amazonUrl: {
      type: String,
      default: null,
      trim: true,
    },
    flipkartUrl: {
      type: String,
      default: null,
      trim: true,
    },
    productUrl: {
      type: String,
      default: '',
      trim: true,
    },
    storeName: {
      type: String,
      default: 'Retailer',
      trim: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

FurnitureSchema.index({ category: 1 });
FurnitureSchema.index({ style: 1 });
FurnitureSchema.index({ price: 1 });
FurnitureSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Furniture =
  mongoose.models.Furniture || mongoose.model<IFurniture>('Furniture', FurnitureSchema);

export default Furniture;
