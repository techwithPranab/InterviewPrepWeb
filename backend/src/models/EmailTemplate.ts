import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType: 'interview_scheduled' | 'interview_reminder' | 'interview_confirmation' | 'interview_cancelled' | 'custom';
  variables: string[]; // List of variable placeholders like {{candidateName}}, {{interviewDate}}
  isActive: boolean;
  description?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      unique: true,
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, 'HTML content is required'],
    },
    textContent: {
      type: String,
      trim: true,
    },
    templateType: {
      type: String,
      required: [true, 'Template type is required'],
      enum: ['interview_scheduled', 'interview_reminder', 'interview_confirmation', 'interview_cancelled', 'custom'],
      default: 'custom',
    },
    variables: {
      type: [String],
      default: [],
      description: 'Array of variable placeholders used in the template',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
emailTemplateSchema.index({ templateType: 1, isActive: 1 });
emailTemplateSchema.index({ name: 1 });

const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;
