import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICollaborativeSession extends Document {
  interviewSessionId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  interviewerNotes: {
    timestamp: Date;
    note: string;
    category?: string;
  }[];
  ratings: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    cultureFit: number;
    overall: number;
  };
  feedback: string;
  recording?: {
    url: string;
    duration: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const collaborativeSessionSchema = new Schema<ICollaborativeSession>({
  interviewSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'Interviewer',
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  meetingLink: {
    type: String,
  },
  interviewerNotes: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
  }],
  ratings: {
    technicalSkills: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    communication: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    problemSolving: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    cultureFit: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    overall: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
  },
  feedback: {
    type: String,
    default: '',
  },
  recording: {
    url: String,
    duration: Number,
  },
}, {
  timestamps: true,
});

// Indexes
collaborativeSessionSchema.index({ candidateId: 1, scheduledAt: -1 });
collaborativeSessionSchema.index({ interviewerId: 1, scheduledAt: -1 });
collaborativeSessionSchema.index({ status: 1, scheduledAt: 1 });

const CollaborativeSession: Model<ICollaborativeSession> = mongoose.models.CollaborativeSession || mongoose.model<ICollaborativeSession>('CollaborativeSession', collaborativeSessionSchema);

export default CollaborativeSession;
