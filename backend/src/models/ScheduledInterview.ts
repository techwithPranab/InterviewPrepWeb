import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IScheduledInterview extends Document {
  userId: mongoose.Types.ObjectId;
  interviewerId?: mongoose.Types.ObjectId;
  title: string; // Mr, Mrs, Ms, Dr, etc.
  description: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  skills: string[];
  scheduledAt: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reminderSent: boolean;
  meetingLink?: string;
  registrationLink?: string;
  resumeUrl?: string;
  calendarEventId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledInterviewSchema = new Schema<IScheduledInterview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'Interviewer',
  },
  title: {
    type: String,
    required: true,
    enum: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Mx'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  candidateName: {
    type: String,
    required: true,
  },
  candidateEmail: {
    type: String,
    required: true,
  },
  candidatePhone: {
    type: String,
    trim: true,
  },
  skills: [{
    type: String,
    required: true,
  }],
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 60,
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  meetingLink: {
    type: String,
  },
  registrationLink: {
    type: String,
  },
  resumeUrl: {
    type: String,
  },
  calendarEventId: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
scheduledInterviewSchema.index({ userId: 1, scheduledAt: -1 });
scheduledInterviewSchema.index({ interviewerId: 1, scheduledAt: -1 });
scheduledInterviewSchema.index({ status: 1, scheduledAt: 1 });
scheduledInterviewSchema.index({ scheduledAt: 1, reminderSent: 1 });

const ScheduledInterview: Model<IScheduledInterview> = mongoose.models.ScheduledInterview || mongoose.model<IScheduledInterview>('ScheduledInterview', scheduledInterviewSchema);

export default ScheduledInterview;
