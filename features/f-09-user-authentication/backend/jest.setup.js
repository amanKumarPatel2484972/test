const request = require('supertest');
const app = require('./server'); // Import your Express app
const pool = require('./db');

// Mock or setup database for tests
beforeAll(async () => {
  // Ensure database tables exist (simplified for example)
  await pool.query(
    'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  );
  console.log('Users table ensured for tests.');
});

afterAll(async () => {
  // Clean up database after tests
  await pool.query('DROP TABLE IF EXISTS users');
  console.log('Users table dropped after tests.');
  await pool.end(); // Close the pool
});

// You can export app for use in tests
module.exports = { app, pool };
