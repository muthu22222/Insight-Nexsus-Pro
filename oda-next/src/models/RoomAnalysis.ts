import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomAnalysis extends Document {
  roomType: string;
  wallColor: string;
  flooring: string;
  ceiling: string;
  furniture: string[];
  existingFurniture?: Array<{
    item: string;
    placement: string;
    action?: 'preserve' | 'upgrade' | 'replace';
  }>;
  suggestedFurniture?: string[];
  isEmptyRoom?: boolean;
  perspective?: string;
  windows: string | string[];
  doors: string | string[];
  lighting: string;
  emptyAreas: string[];
  proportions: any;
  createdAt: Date;
  updatedAt: Date;
}

export const RoomAnalysisSchema = new Schema<IRoomAnalysis>(
  {
    roomType: {
      type: String,
      default: 'Living Room',
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
    existingFurniture: {
      type: [
        {
          item: { type: String, default: '' },
          placement: { type: String, default: '' },
          action: { type: String, default: 'preserve' },
        },
      ],
      default: [],
    },
    suggestedFurniture: {
      type: [String],
      default: [],
    },
    isEmptyRoom: {
      type: Boolean,
      default: false,
    },
    perspective: {
      type: String,
      default: '',
    },
    windows: {
      type: Schema.Types.Mixed,
      default: '',
    },
    doors: {
      type: Schema.Types.Mixed,
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
      type: Schema.Types.Mixed,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const RoomAnalysis =
  mongoose.models.RoomAnalysis ||
  mongoose.model<IRoomAnalysis>('RoomAnalysis', RoomAnalysisSchema);

export default RoomAnalysis;
