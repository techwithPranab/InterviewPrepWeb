const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Dynamic imports for ES modules
let User, Skill, InterviewGuide, QuestionBank;

async function loadModels() {
  User = (await import('../lib/models/User.ts')).default;
  Skill = (await import('../lib/models/Skill.ts')).default;
  InterviewGuide = (await import('../lib/models/InterviewGuide.ts')).default;
  QuestionBank = (await import('../lib/models/QuestionBank.js')).default;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockinterview';

// ============================================================================
// ADMIN USER DATA
// ============================================================================
const adminUserData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@mockinterview.com',
  password: 'Admin@123', // This will be hashed by the pre-save hook
  role: 'admin',
  profile: {
    experience: '10+',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
    bio: 'Platform administrator with extensive experience in software development and interview preparation.',
  },
  isActive: true
};

// ============================================================================
// SKILLS DATA
// ============================================================================
const skillsData = [
  {
    name: 'JavaScript',
    category: 'programming',
    description: 'Dynamic programming language for web development',
    level: 'intermediate',
    isActive: true,
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
      },
      {
        template: 'Explain event delegation in JavaScript',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'React',
    category: 'framework',
    description: 'JavaScript library for building user interfaces',
    level: 'intermediate',
    isActive: true,
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
      },
      {
        template: 'Explain the difference between controlled and uncontrolled components',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Node.js',
    category: 'framework',
    description: 'JavaScript runtime for server-side development',
    level: 'intermediate',
    isActive: true,
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
      },
      {
        template: 'What is middleware in Express.js?',
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
    isActive: true,
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
      },
      {
        template: 'Explain the difference between lists and tuples',
        type: 'technical',
        difficulty: 'beginner'
      }
    ]
  },
  {
    name: 'MongoDB',
    category: 'database',
    description: 'NoSQL document database',
    level: 'intermediate',
    isActive: true,
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
      },
      {
        template: 'What are indexes in MongoDB and why are they important?',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'AWS',
    category: 'other',
    description: 'Amazon Web Services cloud platform',
    level: 'advanced',
    isActive: true,
    questionTemplates: [
      {
        template: 'Explain the difference between S3 storage classes',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'What is AWS Lambda and when would you use it?',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'Explain VPC and its components',
        type: 'technical',
        difficulty: 'advanced'
      }
    ]
  },
  {
    name: 'Git',
    category: 'tool',
    description: 'Version control system for tracking changes in code',
    level: 'beginner',
    isActive: true,
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
      },
      {
        template: 'What is the difference between git pull and git fetch?',
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
    isActive: true,
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
    isActive: true,
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
  },
  {
    name: 'Leadership',
    category: 'soft-skill',
    description: 'Ability to guide and inspire teams',
    level: 'advanced',
    isActive: true,
    questionTemplates: [
      {
        template: 'Describe your leadership style and give an example',
        type: 'behavioral',
        difficulty: 'advanced'
      },
      {
        template: 'How do you motivate team members during challenging projects?',
        type: 'behavioral',
        difficulty: 'advanced'
      }
    ]
  }
];

// ============================================================================
// INTERVIEW GUIDES DATA
// ============================================================================
const interviewGuidesData = [
  {
    title: 'React Interview Questions - Comprehensive Guide',
    description: 'Master React interviews with this comprehensive guide covering hooks, component lifecycle, state management, and performance optimization.',
    domain: 'Frontend',
    technology: 'React',
    difficulty: 'intermediate',
    tags: ['javascript', 'frontend', 'ui', 'components', 'hooks'],
    questions: [
      {
        question: 'What is the Virtual DOM and how does it work in React?',
        answer: 'The Virtual DOM is a lightweight copy of the actual DOM maintained by React. When state changes occur, React creates a new Virtual DOM tree, compares it with the previous one (diffing), and then updates only the changed parts in the real DOM (reconciliation). This makes updates much faster than manipulating the real DOM directly.',
        category: 'Concept',
        tags: ['virtual-dom', 'performance', 'core-concept'],
        codeExample: `// React efficiently updates only what changed
const App = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};`,
        references: ['https://react.dev/learn/preserving-and-resetting-state'],
        order: 1
      },
      {
        question: 'Explain the difference between useState and useRef hooks.',
        answer: 'useState is used for state that triggers re-renders when changed, while useRef is used for mutable values that persist across renders without causing re-renders. useState returns [value, setter], while useRef returns an object with a .current property. useRef is commonly used for accessing DOM elements and storing mutable values.',
        category: 'Hooks',
        tags: ['hooks', 'useState', 'useRef'],
        codeExample: `// useState - triggers re-render
const [count, setCount] = useState(0);

// useRef - no re-render on change
const countRef = useRef(0);
const inputRef = useRef(null);

// Access DOM element
inputRef.current.focus();`,
        references: ['https://react.dev/reference/react/useRef', 'https://react.dev/reference/react/useState'],
        order: 2
      },
      {
        question: 'What are React Keys and why are they important?',
        answer: 'Keys help React identify which items in a list have changed, been added, or removed. They should be stable, unique, and predictable. Using array indices as keys is discouraged when the list can be reordered. Keys optimize reconciliation and help maintain component state correctly.',
        category: 'Best Practices',
        tags: ['keys', 'lists', 'reconciliation'],
        codeExample: `// Good - using unique IDs
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// Bad - using array indices (when order can change)
{items.map((item, index) => (
  <Item key={index} data={item} />
))}`,
        references: ['https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key'],
        order: 3
      }
    ],
    isPublished: true
  },
  {
    title: 'Node.js Backend Development Interview Guide',
    description: 'Complete guide to Node.js interviews covering event loop, async programming, Express.js, database integration, and security best practices.',
    domain: 'Backend',
    technology: 'Node.js',
    difficulty: 'advanced',
    tags: ['javascript', 'backend', 'express', 'async', 'api'],
    questions: [
      {
        question: 'Explain the Node.js Event Loop and how it handles async operations.',
        answer: 'The Event Loop is the core of Node.js asynchronous architecture. It continuously checks the call stack and callback queue. When the stack is empty, it takes the first event from the queue and pushes its callback to the stack. Phases include: timers, pending callbacks, idle/prepare, poll, check, and close callbacks. This allows Node.js to handle thousands of concurrent connections without creating threads.',
        category: 'Core Concepts',
        tags: ['event-loop', 'async', 'concurrency'],
        codeExample: `console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('End');

// Output: Start, End, Promise, Timeout
// Microtasks (Promises) run before macrotasks (setTimeout)`,
        references: ['https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/'],
        order: 1
      },
      {
        question: 'What is middleware in Express.js and how does it work?',
        answer: 'Middleware functions have access to request, response objects and the next middleware function. They can execute code, modify request/response objects, end the request-response cycle, or call next(). Middleware can be application-level, router-level, error-handling, built-in, or third-party.',
        category: 'Express.js',
        tags: ['express', 'middleware', 'request-handling'],
        codeExample: `// Custom middleware
const logger = (req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  next(); // Pass to next middleware
};

app.use(logger);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});`,
        references: ['https://expressjs.com/en/guide/using-middleware.html'],
        order: 2
      }
    ],
    isPublished: true
  },
  {
    title: 'Python Data Science Interview Preparation',
    description: 'Essential Python and data science concepts for interviews including pandas, numpy, machine learning fundamentals, and data visualization.',
    domain: 'Data Science',
    technology: 'Python',
    difficulty: 'intermediate',
    tags: ['python', 'data-science', 'pandas', 'numpy', 'ml'],
    questions: [
      {
        question: 'Explain the difference between lists and numpy arrays in Python.',
        answer: 'Lists are built-in Python data structures that can hold mixed types, while numpy arrays are homogeneous (same type), more memory efficient, and support vectorized operations. Numpy arrays are much faster for numerical computations and support broadcasting. Lists use more memory as they store type information for each element.',
        category: 'Data Structures',
        tags: ['numpy', 'arrays', 'performance'],
        codeExample: `import numpy as np

# List - slower, mixed types
my_list = [1, 2, 3, 'four']

# Numpy array - faster, homogeneous
my_array = np.array([1, 2, 3, 4])

# Vectorized operations (fast)
result = my_array * 2  # [2, 4, 6, 8]

# Broadcasting
matrix = np.array([[1, 2], [3, 4]])
result = matrix + 10  # Adds 10 to all elements`,
        references: ['https://numpy.org/doc/stable/user/basics.html'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'AWS Cloud Solutions Architect Interview Guide',
    description: 'Comprehensive AWS interview guide covering core services, architecture patterns, security, networking, and best practices for cloud solutions.',
    domain: 'Cloud',
    technology: 'AWS',
    difficulty: 'advanced',
    tags: ['aws', 'cloud', 'architecture', 'devops', 'infrastructure'],
    questions: [
      {
        question: 'Explain the difference between S3 storage classes and when to use each.',
        answer: 'S3 Standard: Frequently accessed data. S3 IA (Infrequent Access): Less frequent access, lower cost. S3 One Zone-IA: Single AZ, even lower cost. S3 Glacier: Long-term archive, minutes to hours retrieval. S3 Glacier Deep Archive: Lowest cost, 12 hour retrieval. S3 Intelligent-Tiering: Automatically moves objects between tiers based on access patterns.',
        category: 'Storage',
        tags: ['s3', 'storage', 'cost-optimization'],
        references: ['https://aws.amazon.com/s3/storage-classes/'],
        order: 1
      },
      {
        question: 'What is AWS Lambda and what are its use cases?',
        answer: 'AWS Lambda is a serverless compute service that runs code in response to events without provisioning servers. It automatically scales, and you pay only for compute time used. Use cases: API backends, data processing, real-time file processing, scheduled tasks, IoT backends, and microservices. Supports multiple languages and integrates with many AWS services.',
        category: 'Compute',
        tags: ['lambda', 'serverless', 'compute'],
        codeExample: `// Lambda function example (Node.js)
exports.handler = async (event) => {
    const name = event.queryStringParameters?.name || 'World';
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: \`Hello, \${name}!\`
        })
    };
};`,
        references: ['https://aws.amazon.com/lambda/'],
        order: 2
      }
    ],
    isPublished: true
  },
  {
    title: 'JavaScript Fundamentals for Interviews',
    description: 'Core JavaScript concepts every developer should know including closures, promises, async/await, prototypes, and ES6+ features.',
    domain: 'Frontend',
    technology: 'JavaScript',
    difficulty: 'beginner',
    tags: ['javascript', 'fundamentals', 'es6', 'async'],
    questions: [
      {
        question: 'What are closures in JavaScript?',
        answer: 'A closure is a function that has access to variables in its outer (enclosing) function scope, even after the outer function has returned. Closures are created every time a function is created. They are commonly used for data privacy, creating factory functions, and in callbacks.',
        category: 'Core Concepts',
        tags: ['closures', 'scope', 'functions'],
        codeExample: `function createCounter() {
  let count = 0; // Private variable
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
// count is not accessible directly`,
        references: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'],
        order: 1
      },
      {
        question: 'Explain the difference between Promise and async/await.',
        answer: 'Both handle asynchronous operations. Promises use .then() and .catch() for chaining. Async/await is syntactic sugar over Promises, making async code look synchronous and easier to read. Async functions always return a Promise. Await pauses execution until Promise resolves. Error handling uses try/catch with async/await vs .catch() with Promises.',
        category: 'Asynchronous',
        tags: ['promises', 'async-await', 'asynchronous'],
        codeExample: `// Using Promises
fetchData()
  .then(data => processData(data))
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Using async/await (cleaner)
async function getData() {
  try {
    const data = await fetchData();
    const result = await processData(data);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}`,
        references: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function'],
        order: 2
      }
    ],
    isPublished: true
  }
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function seedAll() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌱 Starting Database Seeding Process...');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Load models
    console.log('📦 Loading models...');
    await loadModels();
    console.log('✅ Models loaded\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ========================================================================
    // CLEAR EXISTING DATA
    // ========================================================================
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await InterviewGuide.deleteMany({});
    await QuestionBank.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // ========================================================================
    // SEED ADMIN USER
    // ========================================================================
    console.log('👤 Creating Admin User...');
    const adminUser = await User.create(adminUserData);
    console.log('✅ Admin user created successfully!');
    console.log('   📧 Email:', adminUser.email);
    console.log('   🔑 Password: Admin@123');
    console.log('   👑 Role:', adminUser.role);
    console.log('   🆔 ID:', adminUser._id, '\n');

    // ========================================================================
    // SEED SKILLS
    // ========================================================================
    console.log('🎯 Seeding Skills...');
    const skills = await Skill.insertMany(skillsData);
    console.log(`✅ Successfully created ${skills.length} skills:`);
    skills.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.name} (${skill.category}) - ${skill.questionTemplates?.length || 0} templates`);
    });
    console.log('');

    // ========================================================================
    // SEED INTERVIEW GUIDES
    // ========================================================================
    console.log('📚 Seeding Interview Guides...');
    const guidesWithCreator = interviewGuidesData.map(guide => ({
      ...guide,
      createdBy: adminUser._id,
      publishedDate: new Date()
    }));
    
    const guides = await InterviewGuide.insertMany(guidesWithCreator);
    console.log(`✅ Successfully created ${guides.length} interview guides:`);
    guides.forEach((guide, index) => {
      console.log(`   ${index + 1}. ${guide.title}`);
      console.log(`      - Technology: ${guide.technology}`);
      console.log(`      - Difficulty: ${guide.difficulty}`);
      console.log(`      - Questions: ${guide.questions.length}`);
    });
    console.log('');

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Database Seeding Completed Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`   ✓ Admin Users: 1`);
    console.log(`   ✓ Skills: ${skills.length}`);
    console.log(`   ✓ Interview Guides: ${guides.length}`);
    console.log('');

    console.log('🔐 Admin Login Credentials:');
    console.log('   Email: admin@mockinterview.com');
    console.log('   Password: Admin@123');
    console.log('');

    console.log('🌐 Next Steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000/admin/login');
    console.log('   3. Login with the admin credentials above');
    console.log('   4. Manage skills at: /admin/skills');
    console.log('   5. Manage interview guides at: /admin/interview-guides');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
}

// Run the seed function
if (require.main === module) {
  seedAll();
}

module.exports = seedAll;
