const mongoose = require('mongoose');
const Skill = require('../models/Skill'); // Adjust path as needed

const skills = [
  {
    name: 'JavaScript',
    category: 'programming',
    description: 'Core scripting language for web development',
    level: 'intermediate',
    isActive: true,
    usageCount: 0,
  },
  {
    name: 'React',
    category: 'framework',
    description: 'Popular frontend library for building UIs',
    level: 'intermediate',
    isActive: true,
    usageCount: 0,
  },
  {
    name: 'Node.js',
    category: 'programming',
    description: 'JavaScript runtime for backend development',
    level: 'intermediate',
    isActive: true,
    usageCount: 0,
  },
  {
    name: 'MongoDB',
    category: 'database',
    description: 'NoSQL database for scalable applications',
    level: 'intermediate',
    isActive: true,
    usageCount: 0,
  },
  {
    name: 'Communication',
    category: 'soft-skill',
    description: 'Ability to communicate ideas clearly',
    level: 'beginner',
    isActive: true,
    usageCount: 0,
  },
];

async function seedSkills() {
  await mongoose.connect('mongodb://localhost:27017/mockinterview'); // Update URI as needed
  await Skill.deleteMany({});
  await Skill.insertMany(skills);
  console.log('Skills seeded!');
  mongoose.disconnect();
}

seedSkills();
