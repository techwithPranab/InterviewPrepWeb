import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuestionBank extends Document {
  question: string;
  type: 'technical' | 'behavioral' | 'situational';
  category: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedAnswer?: string;
  hints?: string[];
  followUpQuestions?: string[];
  evaluationCriteria?: Array<{
    criterion: string;
    weight: number;
  }>;
  tags?: string[];
  isActive: boolean;
  usageCount: number;
  averageScore: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionBankSchema = new Schema<IQuestionBank>({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'situational'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    required: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  expectedAnswer: {
    type: String,
    trim: true
  },
  hints: [String],
  followUpQuestions: [String],
  evaluationCriteria: [{
    criterion: String,
    weight: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.25
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
questionBankSchema.index({ type: 1, difficulty: 1 });
questionBankSchema.index({ skills: 1 });
questionBankSchema.index({ category: 1 });
questionBankSchema.index({ isActive: 1 });

const QuestionBank: Model<IQuestionBank> = mongoose.models.QuestionBank || mongoose.model<IQuestionBank>('QuestionBank', questionBankSchema);

export default QuestionBank;
