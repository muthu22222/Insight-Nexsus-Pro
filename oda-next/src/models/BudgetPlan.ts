import mongoose, { Schema, Document } from 'mongoose';

export interface IBudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
}

export interface IBudgetPlan extends Document {
  projectId?: string;
  totalBudget: number;
  allocations: IBudgetAllocation[];
  remaining: number;
  spent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const BudgetAllocationSchema = new Schema<IBudgetAllocation>({
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

export const BudgetPlanSchema = new Schema<IBudgetPlan>(
  {
    projectId: {
      type: String,
      default: '',
    },
    totalBudget: {
      type: Number,
      required: true,
      default: 200000,
    },
    allocations: {
      type: [BudgetAllocationSchema],
      default: [],
    },
    remaining: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BudgetPlan =
  mongoose.models.BudgetPlan ||
  mongoose.model<IBudgetPlan>('BudgetPlan', BudgetPlanSchema);

export default BudgetPlan;
