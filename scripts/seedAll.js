const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Dynamic imports for ES modules
let User, Skill, InterviewGuide, QuestionBank;

async function loadModels() {
  User = (await import('./backend/src/models/User.ts')).default;
  Skill = (await import('./backend/src/models/Skill.ts')).default;
  InterviewGuide = (await import('./backend/src/models/InterviewGuide.ts')).default;
  QuestionBank = (await import('./backend/src/models/QuestionBank.ts')).default;
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
  },
  {
    name: 'Core Java',
    category: 'programming',
    description: 'Fundamental Java programming concepts and object-oriented programming',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'Explain the difference between abstract class and interface in Java',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'What is method overloading and overriding?',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'Explain Java memory management and garbage collection',
        type: 'technical',
        difficulty: 'advanced'
      }
    ]
  },
  {
    name: 'Spring Boot',
    category: 'framework',
    description: 'Spring Boot framework for building Java applications',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'What is Spring Boot and its advantages over Spring Framework?',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'Explain Spring Boot auto-configuration',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you handle exception handling in Spring Boot?',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Spring MVC',
    category: 'framework',
    description: 'Spring Model-View-Controller framework for web applications',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'Explain the Spring MVC architecture and request flow',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'What is the role of DispatcherServlet in Spring MVC?',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you handle form validation in Spring MVC?',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Design Patterns',
    category: 'other',
    description: 'Software design patterns and architectural principles',
    level: 'advanced',
    isActive: true,
    questionTemplates: [
      {
        template: 'Explain the Singleton design pattern and its implementation',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'What is the Observer pattern and when would you use it?',
        type: 'technical',
        difficulty: 'advanced'
      },
      {
        template: 'Explain the Factory pattern with examples',
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
    name: 'SQL Server',
    category: 'database',
    description: 'Microsoft SQL Server database management system',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'Explain the difference between INNER JOIN and LEFT JOIN',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'What are indexes and how do they improve query performance?',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'Explain stored procedures and their advantages',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Maven',
    category: 'tool',
    description: 'Build automation and dependency management tool for Java projects',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'What is Maven and what are its key features?',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'Explain Maven lifecycle phases',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you manage dependencies in Maven?',
        type: 'technical',
        difficulty: 'beginner'
      }
    ]
  },
  {
    name: 'Docker',
    category: 'tool',
    description: 'Containerization platform for application deployment',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'What is Docker and how does it differ from virtual machines?',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'Explain Docker images, containers, and Dockerfile',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you optimize Docker images for production?',
        type: 'technical',
        difficulty: 'advanced'
      }
    ]
  },
  {
    name: 'Gradle',
    category: 'tool',
    description: 'Build automation tool for multi-language software development',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'What is Gradle and how does it differ from Maven?',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'Explain Gradle build script and tasks',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you create custom tasks in Gradle?',
        type: 'technical',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    name: 'Web Services',
    category: 'framework',
    description: 'RESTful and SOAP web services development',
    level: 'intermediate',
    isActive: true,
    questionTemplates: [
      {
        template: 'What is the difference between REST and SOAP?',
        type: 'technical',
        difficulty: 'beginner'
      },
      {
        template: 'Explain RESTful web service principles',
        type: 'technical',
        difficulty: 'intermediate'
      },
      {
        template: 'How do you handle authentication in web services?',
        type: 'technical',
        difficulty: 'intermediate'
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
  },
  {
    title: 'Core Java Interview Questions - Complete Guide',
    description: 'Comprehensive Java interview guide covering OOP concepts, collections, multithreading, exception handling, and JVM internals.',
    domain: 'Backend',
    technology: 'Core Java',
    difficulty: 'intermediate',
    tags: ['java', 'oop', 'collections', 'multithreading', 'jvm'],
    questions: [
      {
        question: 'What is the difference between abstract class and interface in Java?',
        answer: 'Abstract classes can have both abstract and concrete methods, constructors, instance variables, and access modifiers. Interfaces (before Java 8) could only have abstract methods and constants. From Java 8+, interfaces can have default and static methods. A class can extend only one abstract class but implement multiple interfaces. Use abstract classes for "is-a" relationships and interfaces for "can-do" relationships.',
        category: 'OOP Concepts',
        tags: ['abstract-class', 'interface', 'inheritance'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Spring Boot Interview Questions - Comprehensive Guide',
    description: 'Master Spring Boot interviews with questions on auto-configuration, dependency injection, REST APIs, data access, and microservices.',
    domain: 'Backend',
    technology: 'Spring Boot',
    difficulty: 'intermediate',
    tags: ['spring-boot', 'java', 'microservices', 'rest-api', 'dependency-injection'],
    questions: [
      {
        question: 'What is Spring Boot and what are its key advantages?',
        answer: 'Spring Boot is an opinionated framework that simplifies Spring application development. Key advantages: Auto-configuration (reduces boilerplate), Embedded servers (Tomcat, Jetty), Starter dependencies (simplified dependency management), Production-ready features (health checks, metrics), Opinionated defaults, and Convention over configuration approach.',
        category: 'Core Concepts',
        tags: ['spring-boot', 'auto-configuration', 'embedded-server'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Spring MVC Interview Questions - Web Development Guide',
    description: 'Complete Spring MVC interview preparation covering MVC architecture, controllers, view resolution, form handling, and REST services.',
    domain: 'Backend',
    technology: 'Spring MVC',
    difficulty: 'intermediate',
    tags: ['spring-mvc', 'web-development', 'controllers', 'rest', 'view-resolution'],
    questions: [
      {
        question: 'Explain the Spring MVC architecture and request flow.',
        answer: 'Spring MVC follows Model-View-Controller pattern. Request flow: 1) DispatcherServlet receives request, 2) HandlerMapping maps request to controller, 3) Controller processes request and returns ModelAndView, 4) ViewResolver resolves view name to actual view, 5) View renders response with model data, 6) Response sent back to client.',
        category: 'Architecture',
        tags: ['mvc-pattern', 'dispatcherservlet', 'request-flow'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Design Patterns Interview Questions - Software Architecture',
    description: 'Essential design patterns for interviews including Singleton, Factory, Observer, Strategy, and architectural patterns with real-world examples.',
    domain: 'Backend',
    technology: 'Design Patterns',
    difficulty: 'advanced',
    tags: ['design-patterns', 'architecture', 'singleton', 'factory', 'observer'],
    questions: [
      {
        question: 'Explain the Singleton design pattern and its implementation approaches.',
        answer: 'Singleton ensures only one instance of a class exists. Implementation approaches: 1) Eager initialization (thread-safe but wastes memory), 2) Lazy initialization (not thread-safe), 3) Thread-safe lazy initialization (synchronized method - performance issue), 4) Double-checked locking, 5) Enum singleton (best approach). Use cases: Database connections, logging, configuration settings.',
        category: 'Creational Patterns',
        tags: ['singleton', 'thread-safety', 'lazy-loading'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Git Interview Questions - Version Control Mastery',
    description: 'Master Git version control with questions on branching, merging, rebasing, conflict resolution, and collaborative workflows.',
    domain: 'DevOps',
    technology: 'Git',
    difficulty: 'beginner',
    tags: ['git', 'version-control', 'branching', 'merging', 'collaboration'],
    questions: [
      {
        question: 'What is the difference between git merge and git rebase?',
        answer: 'Git merge creates a new commit that combines changes from two branches, preserving the commit history of both branches (creates a merge commit). Git rebase moves commits from one branch to another, rewriting commit history to create a linear history. Merge preserves context and is safer for shared branches. Rebase creates cleaner history but should not be used on public branches.',
        category: 'Branching',
        tags: ['merge', 'rebase', 'commit-history'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'SQL Server Interview Questions - Database Administration',
    description: 'Comprehensive SQL Server guide covering queries, indexing, stored procedures, performance tuning, and database design principles.',
    domain: 'Database',
    technology: 'SQL Server',
    difficulty: 'intermediate',
    tags: ['sql-server', 'database', 'queries', 'indexing', 'performance'],
    questions: [
      {
        question: 'Explain the different types of JOINs in SQL Server.',
        answer: 'INNER JOIN: Returns records matching in both tables. LEFT JOIN: Returns all records from left table and matching from right. RIGHT JOIN: Returns all records from right table and matching from left. FULL OUTER JOIN: Returns all records from both tables. CROSS JOIN: Returns Cartesian product of both tables. SELF JOIN: Joins table with itself.',
        category: 'Queries',
        tags: ['joins', 'inner-join', 'outer-join'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Maven Interview Questions - Build Automation',
    description: 'Master Maven build tool with questions on project structure, lifecycle, dependencies, plugins, and multi-module projects.',
    domain: 'DevOps',
    technology: 'Maven',
    difficulty: 'intermediate',
    tags: ['maven', 'build-tool', 'dependencies', 'lifecycle', 'plugins'],
    questions: [
      {
        question: 'What is Maven and what are its key benefits?',
        answer: 'Maven is a build automation and dependency management tool for Java projects. Key benefits: 1) Standardized project structure, 2) Dependency management with transitive dependencies, 3) Build lifecycle management, 4) Integration with IDEs, 5) Repository system for artifact sharing, 6) Plugin ecosystem for extending functionality, 7) Multi-module project support.',
        category: 'Core Concepts',
        tags: ['maven', 'dependency-management', 'build-lifecycle'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Docker Interview Questions - Containerization Guide',
    description: 'Complete Docker containerization guide covering images, containers, Dockerfile, networking, volumes, and orchestration basics.',
    domain: 'DevOps',
    technology: 'Docker',
    difficulty: 'intermediate',
    tags: ['docker', 'containerization', 'dockerfile', 'images', 'orchestration'],
    questions: [
      {
        question: 'What is Docker and how does it differ from virtual machines?',
        answer: 'Docker is a containerization platform that packages applications with their dependencies. Differences from VMs: 1) Containers share host OS kernel (VMs have separate OS), 2) Lighter weight and faster startup, 3) Better resource utilization, 4) Application-level isolation vs hardware-level, 5) Portable across environments, 6) Container images are smaller than VM images.',
        category: 'Fundamentals',
        tags: ['containerization', 'virtual-machines', 'isolation'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Gradle Interview Questions - Build System Mastery',
    description: 'Master Gradle build system with questions on build scripts, tasks, plugins, dependency management, and multi-project builds.',
    domain: 'DevOps',
    technology: 'Gradle',
    difficulty: 'intermediate',
    tags: ['gradle', 'build-system', 'groovy', 'tasks', 'plugins'],
    questions: [
      {
        question: 'What is Gradle and how does it differ from Maven?',
        answer: 'Gradle is a flexible build automation tool using Groovy/Kotlin DSL. Differences from Maven: 1) Uses Groovy/Kotlin scripts vs XML, 2) More flexible and programmable, 3) Incremental builds and build cache, 4) Better performance, 5) Custom task creation easier, 6) Supports multiple languages, 7) Gradle Wrapper for version consistency.',
        category: 'Build Systems',
        tags: ['gradle', 'maven', 'build-automation'],
        order: 1
      }
    ],
    isPublished: true
  },
  {
    title: 'Web Services Interview Questions - API Development',
    description: 'Comprehensive web services guide covering REST, SOAP, API design, authentication, documentation, and best practices.',
    domain: 'Backend',
    technology: 'Web Services',
    difficulty: 'intermediate',
    tags: ['web-services', 'rest', 'soap', 'api', 'microservices'],
    questions: [
      {
        question: 'What is the difference between REST and SOAP web services?',
        answer: 'REST: Uses HTTP methods (GET, POST, PUT, DELETE), lightweight JSON/XML, stateless, cacheable, uniform interface. SOAP: XML-based protocol, supports WS-* standards, built-in error handling, stateful/stateless, more secure with WS-Security. REST is simpler and faster, SOAP is more robust for enterprise applications with complex requirements.',
        category: 'Web Service Types',
        tags: ['rest', 'soap', 'http', 'xml'],
        order: 1
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
