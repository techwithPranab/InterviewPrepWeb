export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'interview' | 'skill' | 'milestone' | 'special';
  criteria: {
    type: string;
    target: number;
    condition?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const AVAILABLE_BADGES: Badge[] = [
  // Interview Completion Badges
  {
    id: 'first_interview',
    name: 'First Steps',
    description: 'Complete your first interview',
    icon: '🎯',
    category: 'interview',
    criteria: { type: 'interviews_completed', target: 1 },
    rarity: 'common'
  },
  {
    id: 'interview_5',
    name: 'Getting Started',
    description: 'Complete 5 interviews',
    icon: '🌟',
    category: 'interview',
    criteria: { type: 'interviews_completed', target: 5 },
    rarity: 'common'
  },
  {
    id: 'interview_10',
    name: 'Practice Makes Perfect',
    description: 'Complete 10 interviews',
    icon: '💫',
    category: 'interview',
    criteria: { type: 'interviews_completed', target: 10 },
    rarity: 'rare'
  },
  {
    id: 'interview_25',
    name: 'Dedicated Learner',
    description: 'Complete 25 interviews',
    icon: '🏆',
    category: 'interview',
    criteria: { type: 'interviews_completed', target: 25 },
    rarity: 'epic'
  },
  {
    id: 'interview_50',
    name: 'Interview Master',
    description: 'Complete 50 interviews',
    icon: '👑',
    category: 'interview',
    criteria: { type: 'interviews_completed', target: 50 },
    rarity: 'legendary'
  },

  // Score-based Badges
  {
    id: 'perfect_score',
    name: 'Perfect Performance',
    description: 'Score 10/10 on an interview',
    icon: '💯',
    category: 'milestone',
    criteria: { type: 'perfect_score', target: 1 },
    rarity: 'epic'
  },
  {
    id: 'high_achiever',
    name: 'High Achiever',
    description: 'Score above 8/10 in 5 interviews',
    icon: '⭐',
    category: 'milestone',
    criteria: { type: 'high_scores', target: 5, condition: 'score >= 8' },
    rarity: 'rare'
  },

  // Skill Mastery Badges
  {
    id: 'java_master',
    name: 'Java Expert',
    description: 'Complete 10 Java interviews with avg score > 7',
    icon: '☕',
    category: 'skill',
    criteria: { type: 'skill_mastery', target: 10, condition: 'skill=Java,avgScore>7' },
    rarity: 'epic'
  },
  {
    id: 'javascript_master',
    name: 'JavaScript Guru',
    description: 'Complete 10 JavaScript interviews with avg score > 7',
    icon: '🟨',
    category: 'skill',
    criteria: { type: 'skill_mastery', target: 10, condition: 'skill=JavaScript,avgScore>7' },
    rarity: 'epic'
  },
  {
    id: 'python_master',
    name: 'Python Pro',
    description: 'Complete 10 Python interviews with avg score > 7',
    icon: '🐍',
    category: 'skill',
    criteria: { type: 'skill_mastery', target: 10, condition: 'skill=Python,avgScore>7' },
    rarity: 'epic'
  },
  {
    id: 'fullstack_master',
    name: 'Full Stack Champion',
    description: 'Complete interviews in 5 different tech stacks',
    icon: '🚀',
    category: 'skill',
    criteria: { type: 'diverse_skills', target: 5 },
    rarity: 'legendary'
  },

  // Streak Badges
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practice for 7 consecutive days',
    icon: '🔥',
    category: 'milestone',
    criteria: { type: 'daily_streak', target: 7 },
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    name: 'Monthly Dedication',
    description: 'Practice for 30 consecutive days',
    icon: '💪',
    category: 'milestone',
    criteria: { type: 'daily_streak', target: 30 },
    rarity: 'legendary'
  },

  // Special Badges
  {
    id: 'early_bird',
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    icon: '🐦',
    category: 'special',
    criteria: { type: 'user_rank', target: 100 },
    rarity: 'legendary'
  },
  {
    id: 'feedback_master',
    name: 'Feedback Champion',
    description: 'Provide detailed answers in 20 interviews',
    icon: '📝',
    category: 'special',
    criteria: { type: 'detailed_answers', target: 20 },
    rarity: 'rare'
  },
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Improve score by 3 points across 5 interviews',
    icon: '⚡',
    category: 'milestone',
    criteria: { type: 'score_improvement', target: 5, condition: 'improvement>=3' },
    rarity: 'epic'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 10 interviews after 10 PM',
    icon: '🦉',
    category: 'special',
    criteria: { type: 'late_night_interviews', target: 10 },
    rarity: 'rare'
  }
];

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100';
    case 'rare': return 'text-blue-600 bg-blue-100';
    case 'epic': return 'text-purple-600 bg-purple-100';
    case 'legendary': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};
