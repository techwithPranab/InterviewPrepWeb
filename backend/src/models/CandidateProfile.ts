import mongoose, { Schema, Document } from 'mongoose';

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  role?: string;
  duration?: string;
  achievements?: string[];
}

export interface IExperience {
  company: string;
  position: string;
  duration: string;
  location?: string;
  responsibilities: string[];
  technologies?: string[];
}

export interface IEducation {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
  major?: string;
}

export interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  resumeUrl: string;
  cloudinaryPublicId?: string;
  
  // Personal Information
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  
  // Professional Summary
  summary?: string;
  
  // Skills
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
  };
  
  // Experience
  experience: IExperience[];
  
  // Projects
  projects: IProject[];
  
  // Education
  education: IEducation[];
  
  // Certifications
  certifications: Array<{
    name: string;
    issuer: string;
    year?: string;
    credentialId?: string;
  }>;
  
  // Additional Info
  totalExperience?: string;
  currentRole?: string;
  
  // Metadata
  extractedAt: Date;
  lastUpdated: Date;
  extractionMethod: 'ai' | 'manual';
  rawText?: string; // Store original resume text for reference
}

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  role: String,
  duration: String,
  achievements: [String],
});

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  duration: { type: String, required: true },
  location: String,
  responsibilities: [{ type: String }],
  technologies: [String],
});

const EducationSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, required: true },
  grade: String,
  major: String,
});

const CandidateProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: String,
  
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    location: String,
    linkedIn: String,
    github: String,
    portfolio: String,
  },
  
  summary: String,
  
  skills: {
    technical: [{ type: String }],
    soft: [{ type: String }],
    tools: [{ type: String }],
    languages: [{ type: String }],
  },
  
  experience: [ExperienceSchema],
  projects: [ProjectSchema],
  education: [EducationSchema],
  
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    year: String,
    credentialId: String,
  }],
  
  totalExperience: String,
  currentRole: String,
  
  extractedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  extractionMethod: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'ai',
  },
  rawText: String,
}, {
  timestamps: true,
});

// Index for faster queries
CandidateProfileSchema.index({ userId: 1 });
CandidateProfileSchema.index({ 'personalInfo.email': 1 });

// Update lastUpdated on every save
CandidateProfileSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<ICandidateProfile>('CandidateProfile', CandidateProfileSchema);
