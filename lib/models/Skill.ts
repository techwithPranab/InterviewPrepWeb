import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'programming' | 'framework' | 'database' | 'tool' | 'soft-skill' | 'other';
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  questionTemplates: Array<{
    template: string;
    type: 'technical' | 'behavioral' | 'situational';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    enum: ['programming', 'framework', 'database', 'tool', 'soft-skill', 'other'],
    default: 'programming'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questionTemplates: [{
    template: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational'],
      default: 'technical'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    }
  }],
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
skillSchema.index({ name: 'text', description: 'text' });
skillSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', skillSchema);
