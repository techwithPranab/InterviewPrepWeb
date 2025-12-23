import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'Mock Interview Platform'
  },
  siteDescription: {
    type: String,
    default: 'Practice interviews with AI-powered feedback'
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'admin@example.com'
  },
  enableRegistration: {
    type: Boolean,
    default: true
  },
  enableEmailNotifications: {
    type: Boolean,
    default: true
  },
  maxSessionsPerUser: {
    type: Number,
    default: 10,
    min: 1
  },
  sessionTimeoutMinutes: {
    type: Number,
    default: 60,
    min: 5
  },
  enableAnalytics: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
SystemSettingsSchema.pre('save', async function(next) {
  const count = await mongoose.models.SystemSettings?.countDocuments() || 0;
  if (count > 0 && !this.isNew) {
    // Allow updates to existing document
    return next();
  }
  if (count > 0 && this.isNew) {
    const error = new Error('Only one system settings document is allowed');
    return next(error);
  }
  next();
});

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
