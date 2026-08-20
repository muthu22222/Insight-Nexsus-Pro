import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingListItem {
  furnitureId?: string;
  productName?: string;
  name?: string;
  category?: string;
  quantity: number;
  price: number;
  store: string;
  productLink: string;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  checked: boolean;
}

export interface IShoppingList extends Document {
  projectId?: string;
  userId?: string;
  items: IShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export const ShoppingListItemSchema = new Schema<IShoppingListItem>({
  furnitureId: {
    type: String,
    default: '',
  },
  productName: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  store: {
    type: String,
    default: 'Store',
  },
  productLink: {
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
  checked: {
    type: Boolean,
    default: false,
  },
});

export const ShoppingListSchema = new Schema<IShoppingList>(
  {
    projectId: {
      type: String,
      default: '',
    },
    userId: {
      type: String,
      default: '',
    },
    items: {
      type: [ShoppingListItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ShoppingList =
  mongoose.models.ShoppingList ||
  mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchema);

export default ShoppingList;
