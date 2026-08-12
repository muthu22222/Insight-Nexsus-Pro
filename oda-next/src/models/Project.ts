import mongoose, { Schema, Document } from 'mongoose';

export interface IHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  furnitureId: mongoose.Types.ObjectId;
}

export interface IDesign {
  style: string;
  mood: string;
  color: string;
  budget: number;
  generatedImage: string;
  hotspots: IHotspot[];
}

export interface IBudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
}

export interface IShoppingListItem {
  furnitureId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  store: string;
  productLink: string;
  checked: boolean;
}

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  roomImage: string;
  originalImage: string;
  roomAnalysis: {
    roomType: string;
    wallColor: string;
    flooring: string;
    ceiling: string;
    furniture: string[];
    windows: string;
    doors: string;
    lighting: string;
    emptyAreas: string[];
    proportions: string;
  };
  designs: IDesign[];
  selectedDesignIndex: number;
  budgetPlan: {
    totalBudget: number;
    allocations: IBudgetAllocation[];
    remaining: number;
  };
  shoppingList: IShoppingListItem[];
  status: 'draft' | 'analyzing' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const HotspotSchema = new Schema<IHotspot>({
  id: {
    type: String,
    required: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  furnitureId: {
    type: Schema.Types.ObjectId,
    ref: 'FurnitureItem',
  },
});

const DesignSchema = new Schema<IDesign>({
  style: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  generatedImage: {
    type: String,
    default: '',
  },
  hotspots: {
    type: [HotspotSchema],
    default: [],
  },
});

const BudgetAllocationSchema = new Schema<IBudgetAllocation>({
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
});

const ShoppingListItemSchema = new Schema<IShoppingListItem>({
  furnitureId: {
    type: Schema.Types.ObjectId,
    ref: 'FurnitureItem',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  store: {
    type: String,
    required: true,
  },
  productLink: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    roomAnalysis: {
      roomType: {
        type: String,
        default: '',
      },
      wallColor: {
        type: String,
        default: '',
      },
      flooring: {
        type: String,
        default: '',
      },
      ceiling: {
        type: String,
        default: '',
      },
      furniture: {
        type: [String],
        default: [],
      },
      windows: {
        type: String,
        default: '',
      },
      doors: {
        type: String,
        default: '',
      },
      lighting: {
        type: String,
        default: '',
      },
      emptyAreas: {
        type: [String],
        default: [],
      },
      proportions: {
        type: String,
        default: '',
      },
    },
    designs: {
      type: [DesignSchema],
      default: [],
    },
    selectedDesignIndex: {
      type: Number,
      default: 0,
    },
    budgetPlan: {
      totalBudget: {
        type: Number,
        default: 0,
      },
      allocations: {
        type: [BudgetAllocationSchema],
        default: [],
      },
      remaining: {
        type: Number,
        default: 0,
      },
    },
    shoppingList: {
      type: [ShoppingListItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'analyzing', 'generating', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ userId: 1 });

const Project =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
