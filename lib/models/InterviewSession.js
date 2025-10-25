const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Interview title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'mixed'],
    default: 'technical'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  skills: [{
    type: String,
    required: true
  }],
  duration: {
    type: Number, // in minutes
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational'],
      default: 'technical'
    },
    expectedAnswer: {
      type: String
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    answer: {
      text: String,
      audioUrl: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    evaluation: {
      score: {
        type: Number,
        min: 0,
        max: 10
      },
      feedback: String,
      criteria: {
        technical_accuracy: Number,
        communication: Number,
        problem_solving: Number,
        confidence: Number
      },
      aiAnalysis: {
        sentiment: String,
        keywords: [String],
        clarity_score: Number,
        confidence_level: String
      }
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  overallEvaluation: {
    totalScore: {
      type: Number,
      min: 0,
      max: 10
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 10
    },
    feedback: String,
    strengths: [String],
    improvements: [String],
    recommendation: {
      type: String,
      enum: ['strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend']
    }
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  totalDuration: {
    type: Number // actual duration in minutes
  },
  recording: {
    audioUrl: String,
    transcription: String
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
interviewSessionSchema.index({ candidate: 1, createdAt: -1 });
interviewSessionSchema.index({ status: 1 });
interviewSessionSchema.index({ skills: 1 });

// Virtual for session duration
interviewSessionSchema.virtual('sessionDuration').get(function() {
  if (this.startedAt && this.completedAt) {
    return Math.round((this.completedAt - this.startedAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Method to calculate average score
interviewSessionSchema.methods.calculateAverageScore = function() {
  if (this.questions.length === 0) return 0;
  
  const validScores = this.questions
    .filter(q => q.evaluation && q.evaluation.score !== undefined)
    .map(q => q.evaluation.score);
  
  if (validScores.length === 0) return 0;
  
  const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  this.overallEvaluation.averageScore = Math.round(average * 100) / 100;
  return this.overallEvaluation.averageScore;
};

// Pre-save hook to update completed status and duration
interviewSessionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (this.startedAt && this.completedAt) {
    this.totalDuration = Math.round((this.completedAt - this.startedAt) / (1000 * 60));
  }
  
  next();
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
