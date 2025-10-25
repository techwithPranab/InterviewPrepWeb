const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Skill = require('../lib/models/Skill.js');

// Sample skills data
const skillsData = [
  {
    name: 'JavaScript',
    category: 'programming',
    description: 'Dynamic programming language for web development',
    level: 'intermediate',
    questionTemplates: [
      {
        template: 'Explain closures in JavaScript and provide an example',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'What are the differences between let, const, and var?',
        type: 'technical',
        difficulty: 'beginner'
      }
    ]
  },
  {
    name: 'React',
    category: 'framework',
    description: 'JavaScript library for building user interfaces',
    level: 'intermediate',
    questionTemplates: [
      {
        template: 'Explain the useState hook and when to use it',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'What is the virtual DOM and how does it work?',
        type: 'technical',
        difficulty: 'advanced'
      }
    ]
  },
  {
    name: 'Node.js',
    category: 'framework',
    description: 'JavaScript runtime for server-side development',
    level: 'intermediate',
    questionTemplates: [
      {
        template: 'Explain the event loop in Node.js',
        type: 'technical',
        difficulty: 'advanced'
      },
      {
        template: 'How do you handle asynchronous operations in Node.js?',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Python',
    category: 'programming',
    description: 'High-level programming language for various applications',
    level: 'intermediate',
    questionTemplates: [
      {
        template: 'Explain list comprehensions in Python with examples',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'What are decorators and how do you use them?',
        type: 'technical',
        difficulty: 'advanced'
      }
    ]
  },
  {
    name: 'MongoDB',
    category: 'database',
    description: 'NoSQL document database',
    level: 'intermediate',
    questionTemplates: [
      {
        template: 'Explain the difference between SQL and NoSQL databases',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'How do you design schemas in MongoDB?',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Git',
    category: 'tool',
    description: 'Version control system for tracking changes in code',
    level: 'beginner',
    questionTemplates: [
      {
        template: 'Explain the difference between git merge and git rebase',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you resolve merge conflicts in Git?',
        type: 'technical',
        difficulty: 'beginner'
      }
    ]
  },
  {
    name: 'Communication',
    category: 'soft-skill',
    description: 'Ability to convey information effectively',
    level: 'intermediate',
    questionTemplates: [
      {
        template: 'Describe a time when you had to explain a complex technical concept to a non-technical audience',
        type: 'behavioral',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you handle disagreements with team members?',
        type: 'behavioral',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Problem Solving',
    category: 'soft-skill',
    description: 'Ability to analyze and solve complex problems',
    level: 'intermediate',
    questionTemplates: [
      {
        template: 'Tell me about a challenging problem you solved recently',
        type: 'behavioral',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you approach debugging a complex issue?',
        type: 'situational',
        difficulty: 'intermediate'
      }
    ]
  }
];

async function seedSkills() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Cleared existing skills');

    // Insert new skills
    await Skill.insertMany(skillsData);
    console.log(`Inserted ${skillsData.length} skills`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding skills:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedSkills();
