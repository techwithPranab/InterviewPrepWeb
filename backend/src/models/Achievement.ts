import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  badgeId: {
    type: String,
    required: true
  },
  badgeName: {
    type: String,
    required: true
  },
  badgeDescription: {
    type: String,
    required: true
  },
  badgeIcon: {
    type: String,
    required: true
  },
  badgeCategory: {
    type: String,
    enum: ['interview', 'skill', 'milestone', 'special'],
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    current: { type: Number, default: 0 },
    target: { type: Number, required: true }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index for user and badge
achievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

export default Achievement;
