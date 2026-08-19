import mongoose, { Schema, Document } from 'mongoose';

export interface IFurnitureItem extends Document {
  productName: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  storeName: string;
  productUrl: string;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  style: string;
  rating: number;
  description: string;
  inStock: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FurnitureItemSchema = new Schema<IFurnitureItem>(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
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
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    productUrl: {
      type: String,
      required: [true, 'Product URL is required'],
      trim: true,
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
    style: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    description: {
      type: String,
      default: '',
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

FurnitureItemSchema.index({ category: 1 });
FurnitureItemSchema.index({ style: 1 });
FurnitureItemSchema.index({ price: 1 });

const FurnitureItem =
  mongoose.models.FurnitureItem ||
  mongoose.model<IFurnitureItem>('FurnitureItem', FurnitureItemSchema);

export default FurnitureItem;
