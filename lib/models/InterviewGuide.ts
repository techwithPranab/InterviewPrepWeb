import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewGuide extends Document {
  title: string;
  description: string;
  domain: string; // e.g., 'Frontend', 'Backend', 'DevOps', 'Data Science', etc.
  technology: string; // e.g., 'React', 'Node.js', 'AWS', 'Python', etc.
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  questions: Array<{
    question: string;
    answer: string;
    category: string; // e.g., 'Concept', 'Practical', 'Scenario-based'
    tags: string[];
    codeExample?: string;
    references?: string[];
    order: number;
  }>;
  tags: string[];
  isPublished: boolean;
  publishedDate?: Date;
  views: number;
  upvotes: number;
  downvotes: number;
  createdBy: mongoose.Schema.Types.ObjectId;
  lastUpdatedBy?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const interviewGuideSchema = new Schema<IInterviewGuide>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true,
    index: true
  },
  technology: {
    type: String,
    required: [true, 'Technology is required'],
    trim: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
    default: 'beginner'
  },
  questions: [{
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    codeExample: {
      type: String,
      trim: true
    },
    references: [{
      type: String,
      trim: true
    }],
    order: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedDate: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
interviewGuideSchema.index({ domain: 1, technology: 1 });
interviewGuideSchema.index({ isPublished: 1, publishedDate: -1 });
interviewGuideSchema.index({ tags: 1 });
interviewGuideSchema.index({ difficulty: 1 });
interviewGuideSchema.index({ views: -1 });

// Virtual for question count
interviewGuideSchema.virtual('questionCount').get(function(this: IInterviewGuide) {
  return this.questions.length;
});

// Ensure virtual fields are serialized
interviewGuideSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.models.InterviewGuide || mongoose.model<IInterviewGuide>('InterviewGuide', interviewGuideSchema);
