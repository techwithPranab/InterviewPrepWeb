import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInterviewer extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  expertise: string[];
  availability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  }[];
  hourlyRate?: number;
  rating: number;
  totalInterviews: number;
  verified: boolean;
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const interviewerSchema = new Schema<IInterviewer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  expertise: [{
    type: String,
    required: true,
  }],
  availability: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  }],
  hourlyRate: {
    type: Number,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalInterviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  languages: [{
    type: String,
    default: ['English'],
  }],
}, {
  timestamps: true,
});

// Indexes
interviewerSchema.index({ userId: 1 });
interviewerSchema.index({ expertise: 1 });
interviewerSchema.index({ verified: 1, rating: -1 });

const Interviewer: Model<IInterviewer> = mongoose.models.Interviewer || mongoose.model<IInterviewer>('Interviewer', interviewerSchema);

export default Interviewer;
