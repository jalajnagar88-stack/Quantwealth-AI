import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  otp?: {
    code: string;
    expiresAt: Date;
    type: 'email' | 'phone';
  };
  kycStatus: 'pending' | 'in_progress' | 'verified' | 'rejected';
  profile: {
    avatar?: string;
    investmentExperience: 'beginner' | 'intermediate' | 'expert';
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    annualIncome?: number;
    investmentGoals?: string[];
  };
  connectedBrokers: {
    broker: 'zerodha' | 'upstox' | 'angel_one' | 'alice_blue';
    accessToken?: string;
    isActive: boolean;
    connectedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date,
    type: {
      type: String,
      enum: ['email', 'phone']
    }
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'verified', 'rejected'],
    default: 'pending'
  },
  profile: {
    avatar: String,
    investmentExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner'
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    annualIncome: Number,
    investmentGoals: [String]
  },
  connectedBrokers: [{
    broker: {
      type: String,
      enum: ['zerodha', 'upstox', 'angel_one', 'alice_blue']
    },
    accessToken: String,
    isActive: {
      type: Boolean,
      default: false
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
