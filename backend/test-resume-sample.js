/**
 * Test script for Resume Parsing functionality
 * Run this after starting the backend server
 */

const testResumeText = `
JOHN DOE
Software Engineer
Email: john.doe@email.com | Phone: +1-555-0123 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5+ years of expertise in JavaScript, React, Node.js, and cloud technologies.
Passionate about building scalable web applications and mentoring junior developers.

TECHNICAL SKILLS
- Programming Languages: JavaScript, TypeScript, Python, Java
- Frontend: React, Next.js, Vue.js, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express.js, NestJS, Django
- Databases: MongoDB, PostgreSQL, MySQL, Redis
- Tools & DevOps: Git, Docker, Kubernetes, AWS, CI/CD, Jenkins
- Other: RESTful APIs, GraphQL, Microservices, Agile/Scrum

WORK EXPERIENCE

Senior Software Engineer | Tech Innovations Inc. | Jan 2021 - Present | San Francisco, CA
- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored team of 5 junior developers
- Technologies: React, Node.js, MongoDB, AWS, Docker

Software Engineer | StartUp Labs | Jun 2019 - Dec 2020 | San Francisco, CA
- Developed responsive web applications using React and TypeScript
- Built RESTful APIs with Node.js and Express
- Implemented authentication and authorization systems
- Technologies: React, Node.js, Express, PostgreSQL

Junior Developer | WebDev Solutions | Jan 2018 - May 2019 | San Francisco, CA
- Collaborated on frontend development projects
- Maintained and improved existing codebases
- Technologies: JavaScript, HTML, CSS, jQuery

PROJECTS

E-Commerce Platform
- Built full-stack e-commerce platform with React and Node.js
- Integrated payment gateway and real-time inventory management
- Technologies: React, Node.js, MongoDB, Stripe API, Socket.io
- Achievements: Handled 10K+ transactions in first month

Task Management System
- Developed collaborative task management application
- Implemented real-time updates and team collaboration features
- Technologies: Next.js, NestJS, PostgreSQL, Redis
- Achievements: Improved team productivity by 40%

EDUCATION

Bachelor of Science in Computer Science | University of California, Berkeley | 2017
- GPA: 3.8/4.0
- Major: Computer Science

CERTIFICATIONS

AWS Certified Solutions Architect | Amazon Web Services | 2022
Certified Kubernetes Administrator (CKA) | Cloud Native Computing Foundation | 2021
`;

console.log('📄 Sample Resume Text for Testing:');
console.log('=====================================\n');
console.log(testResumeText);
console.log('\n=====================================');
console.log('✅ This resume text can be used to test the AI parsing functionality');
console.log('💡 Upload a PDF with similar content to test the complete flow');
