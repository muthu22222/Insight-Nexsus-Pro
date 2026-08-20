import mongoose, { Schema, Document } from 'mongoose';
import { AIDesignSchema, IAIDesign, HotspotSchema, IHotspot } from './AIDesign';
import { RoomAnalysisSchema, IRoomAnalysis } from './RoomAnalysis';
import { BudgetPlanSchema, IBudgetPlan, BudgetAllocationSchema, IBudgetAllocation } from './BudgetPlan';
import { ShoppingListItemSchema, IShoppingListItem } from './ShoppingList';
import { FurnitureSchema, IFurniture } from './Furniture';

export interface IProjectFurniture {
  _id?: string;
  name: string;
  productName?: string;
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
  inStock?: boolean;
}

export interface IProject extends Document {
  userId: string;
  name: string;
  roomImage: string;
  originalImage: string;
  generatedImage: string;
  roomType: string;
  selectedStyle: string;
  style: string;
  mood: string;
  colorPreference: string;
  color: string;
  budget: number;
  selectedDesign: any;
  selectedDesignIndex: number;
  roomAnalysis: any;
  designs: IAIDesign[];
  furniture: IProjectFurniture[];
  furniturePrices: number[];
  amazonUrls: string[];
  flipkartUrls: string[];
  budgetPlan: any;
  shoppingList: IShoppingListItem[];
  status: 'draft' | 'analyzing' | 'designing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFurnitureSchema = new Schema<IProjectFurniture>({
  name: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'Furniture',
  },
  brand: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    default: 0,
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
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  amazonUrl: {
    type: String,
    default: null,
  },
  flipkartUrl: {
    type: String,
    default: null,
  },
  productUrl: {
    type: String,
    default: '',
  },
  storeName: {
    type: String,
    default: 'Store',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
});

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    roomImage: {
      type: String,
      default: '',
    },
    originalImage: {
      type: String,
      default: '',
    },
    generatedImage: {
      type: String,
      default: '',
    },
    roomType: {
      type: String,
      default: 'Living Room',
    },
    selectedStyle: {
      type: String,
      default: 'Modern',
    },
    style: {
      type: String,
      default: 'Modern',
    },
    mood: {
      type: String,
      default: 'Warm',
    },
    colorPreference: {
      type: String,
      default: 'Neutral',
    },
    color: {
      type: String,
      default: 'Neutral',
    },
    budget: {
      type: Number,
      default: 200000,
    },
    selectedDesign: {
      type: Schema.Types.Mixed,
      default: null,
    },
    selectedDesignIndex: {
      type: Number,
      default: 0,
    },
    roomAnalysis: {
      type: Schema.Types.Mixed,
      default: () => ({
        roomType: 'Living Room',
        wallColor: '',
        flooring: '',
        ceiling: '',
        furniture: [],
        existingFurniture: [],
        suggestedFurniture: [],
        isEmptyRoom: false,
        windows: '',
        doors: '',
        lighting: '',
        emptyAreas: [],
        proportions: '',
      }),
    },
    designs: {
      type: [AIDesignSchema],
      default: [],
    },
    furniture: {
      type: [ProjectFurnitureSchema],
      default: [],
    },
    furniturePrices: {
      type: [Number],
      default: [],
    },
    amazonUrls: {
      type: [String],
      default: [],
    },
    flipkartUrls: {
      type: [String],
      default: [],
    },
    budgetPlan: {
      type: Schema.Types.Mixed,
      default: () => ({
        totalBudget: 200000,
        allocations: [],
        remaining: 200000,
        spent: 0,
      }),
    },
    shoppingList: {
      type: [ShoppingListItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'analyzing', 'designing', 'completed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ userId: 1, createdAt: -1 });

const Project =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
export {
  ProjectSchema,
  HotspotSchema,
  AIDesignSchema,
  RoomAnalysisSchema,
  BudgetPlanSchema,
  BudgetAllocationSchema,
  ShoppingListItemSchema,
  FurnitureSchema,
};
