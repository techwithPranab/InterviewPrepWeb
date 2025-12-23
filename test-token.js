const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_here';

// Create a test token for admin user
const token = jwt.sign(
  {
    userId: '507f1f77bcf86cd799439011', // dummy ObjectId
    email: 'admin@mockinterview.com',
    role: 'admin'
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Test JWT Token:', token);
