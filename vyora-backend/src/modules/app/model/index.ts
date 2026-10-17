import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeatureHighlight {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  order?: number;
}

export interface IAppRelease extends Document {
  version: string;
  releaseDate: string;
  channel: string;
  title: string;
  subtitle: string;
  features: IFeatureHighlight[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureHighlightSchema = new Schema<IFeatureHighlight>(
  {
    id: { type: String, required: true },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    badge: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const AppReleaseSchema = new Schema<IAppRelease>(
  {
    version: { type: String, required: true, index: true },
    releaseDate: { type: String, required: true },
    channel: { type: String, default: 'preview' },
    title: { type: String, default: 'New Features in Vyora' },
    subtitle: {
      type: String,
      default: "Here is what we've added to boost your store productivity:",
    },
    features: { type: [FeatureHighlightSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

AppReleaseSchema.index({ isActive: 1, createdAt: -1 });

export const AppReleaseModel: Model<IAppRelease> =
  mongoose.models.AppRelease ||
  mongoose.model<IAppRelease>('AppRelease', AppReleaseSchema);
