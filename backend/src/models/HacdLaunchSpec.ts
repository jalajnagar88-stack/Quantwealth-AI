import mongoose, { Schema, Document } from 'mongoose';

// Asset type enum
export enum AssetType {
  FT = 'FT',
  NFT = 'NFT',
  SFT = 'SFT',
  HYBRID = 'HYBRID',
}

// Category enum
export enum ProjectCategory {
  MEME = 'meme',
  AI_AGENT = 'ai_agent',
  ART = 'art',
  RWA = 'rwa',
  STABLE_ASSET = 'stable_asset',
  GAME = 'game',
  COMMUNITY = 'community',
  UTILITY = 'utility',
  OTHER = 'other',
}

// Phase model enum
export enum PhaseModel {
  PUBLIC = 'public',
  ALLOWLIST = 'allowlist',
  DESIGNATED_FIRST = 'designated_first',
  CUSTOM = 'custom',
}

// Removal effect enum
export enum RemovalEffect {
  BURN = 'burn',
  DISABLE = 'disable',
  NO_EFFECT = 'no_effect',
  UNKNOWN = 'unknown',
}

// Launch status enum
export enum LaunchStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  LIVE = 'live',
  COMPLETED = 'completed',
}

// Project info
export interface IProjectInfo {
  name: string;
  ticker: string;
  category: ProjectCategory;
  description: string;
  website: string;
  x: string;
  contact: string;
}

// Asset info
export interface IAssetInfo {
  type: AssetType;
  total_supply: number;
  decimals: number;
  unit_name: string;
  utility_summary: string;
}

// Stack configuration
export interface IStackConfig {
  total_hacd_lots: number;
  hacd_per_lot: number;
  units_per_hacd_lot: number;
  stack_cost_hac_per_hacd: number;
  network_fee_required: boolean;
  designated_address_required: boolean;
  designated_address: string;
  first_phase_hacd_lots: number;
  public_phase_hacd_lots: number;
  removal_effect: RemovalEffect;
}

// Launch configuration
export interface ILaunchConfig {
  target_date_utc: string;
  launchpad_url: string;
  phase_model: PhaseModel;
  min_hacd_per_participant: number;
  max_hacd_per_participant: number | null;
  status: LaunchStatus;
}

// Copy/marketing content
export interface ICopyContent {
  headline: string;
  subheadline: string;
  short_description: string;
  risk_disclosure: string;
}

// Review status
export interface IReviewStatus {
  issuer_confirmed: boolean;
  hacd_labs_reviewed: boolean;
  legal_review_required: boolean;
  notes: string[];
}

// Full launch spec
export interface IHacdLaunchSpec extends Document {
  userId: string;
  schema_version: string;
  project: IProjectInfo;
  asset: IAssetInfo;
  stack: IStackConfig;
  launch: ILaunchConfig;
  copy: ICopyContent;
  review: IReviewStatus;
  generated_docs: {
    issuer_intake_form?: string;
    incubator_fit_review?: string;
    project_profile?: string;
    stack_design?: string;
    launchpad_copy?: string;
    issuer_faq?: string;
    x_announcement?: string;
    review_checklist?: string;
  };
  validation_result?: {
    passed: boolean;
    errors: string[];
    warnings: string[];
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectInfoSchema = new Schema<IProjectInfo>({
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: Object.values(ProjectCategory) 
  },
  description: { type: String, required: true },
  website: { type: String },
  x: { type: String },
  contact: { type: String, required: true },
});

const AssetInfoSchema = new Schema<IAssetInfo>({
  type: { type: String, required: true, enum: Object.values(AssetType) },
  total_supply: { type: Number, required: true, min: 1 },
  decimals: { type: Number, required: true, min: 0 },
  unit_name: { type: String, required: true },
  utility_summary: { type: String, required: true },
});

const StackConfigSchema = new Schema<IStackConfig>({
  total_hacd_lots: { type: Number, required: true, min: 1 },
  hacd_per_lot: { type: Number, required: true, min: 1 },
  units_per_hacd_lot: { type: Number, required: true, min: 1 },
  stack_cost_hac_per_hacd: { type: Number, required: true, min: 0 },
  network_fee_required: { type: Boolean, required: true },
  designated_address_required: { type: Boolean, required: true },
  designated_address: { type: String },
  first_phase_hacd_lots: { type: Number, required: true, min: 0 },
  public_phase_hacd_lots: { type: Number, required: true, min: 0 },
  removal_effect: { 
    type: String, 
    required: true, 
    enum: Object.values(RemovalEffect) 
  },
});

const LaunchConfigSchema = new Schema<ILaunchConfig>({
  target_date_utc: { type: String, required: true },
  launchpad_url: { type: String, required: true },
  phase_model: { 
    type: String, 
    required: true, 
    enum: Object.values(PhaseModel) 
  },
  min_hacd_per_participant: { type: Number, required: true, min: 1 },
  max_hacd_per_participant: { type: Number, min: 1, default: null },
  status: { 
    type: String, 
    required: true, 
    enum: Object.values(LaunchStatus),
    default: LaunchStatus.DRAFT 
  },
});

const CopyContentSchema = new Schema<ICopyContent>({
  headline: { type: String, required: true },
  subheadline: { type: String, required: true },
  short_description: { type: String, required: true },
  risk_disclosure: { type: String, required: true },
});

const ReviewStatusSchema = new Schema<IReviewStatus>({
  issuer_confirmed: { type: Boolean, required: true, default: false },
  hacd_labs_reviewed: { type: Boolean, required: true, default: false },
  legal_review_required: { type: Boolean, required: true, default: false },
  notes: { type: [String], default: [] },
});

const GeneratedDocsSchema = new Schema({
  issuer_intake_form: String,
  incubator_fit_review: String,
  project_profile: String,
  stack_design: String,
  launchpad_copy: String,
  issuer_faq: String,
  x_announcement: String,
  review_checklist: String,
});

const ValidationResultSchema = new Schema({
  passed: { type: Boolean, required: true },
  errors: { type: [String], default: [] },
  warnings: { type: [String], default: [] },
  timestamp: { type: Date, default: Date.now },
});

const HacdLaunchSpecSchema = new Schema<IHacdLaunchSpec>({
  userId: { type: String, required: true, index: true },
  schema_version: { type: String, required: true, default: '1.0' },
  project: { type: ProjectInfoSchema, required: true },
  asset: { type: AssetInfoSchema, required: true },
  stack: { type: StackConfigSchema, required: true },
  launch: { type: LaunchConfigSchema, required: true },
  copy: { type: CopyContentSchema, required: true },
  review: { type: ReviewStatusSchema, required: true },
  generated_docs: { type: GeneratedDocsSchema, default: {} },
  validation_result: { type: ValidationResultSchema },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for user's launch specs
HacdLaunchSpecSchema.index({ userId: 1, createdAt: -1 });

export const HacdLaunchSpec = mongoose.model<IHacdLaunchSpec>('HacdLaunchSpec', HacdLaunchSpecSchema);
