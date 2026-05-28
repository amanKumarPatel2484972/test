const request = require('supertest');
const app = require('../server');
const pool = require('../db');

// Mock JWT secret for testing
process.env.JWT_SECRET = 'testsecret';

describe('Auth API Endpoints', () => {
  let userId;
  let userEmail = 'test@example.com';
  let userPassword = 'password123';
  let username = 'testuser';

  beforeAll(async () => {
    // Ensure table exists (jest.setup.js should handle this, but good for isolation)
    await pool.query(
      'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
    );
  });

  afterAll(async () => {
    // Clean up after tests
    await pool.query('DELETE FROM users WHERE email = $1', [userEmail]);
    await pool.end();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: username,
        email: userEmail,
        password: userPassword,
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered and logged in successfully');
    expect(res.body).toHaveProperty('userId');
    userId = res.body.userId;

    // Check if user exists in DB
    const userDbRes = await pool.query('SELECT * FROM users WHERE email = $1', [userEmail]);
    expect(userDbRes.rows.length).toBe(1);
    expect(userDbRes.rows[0].username).toBe(username);
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged in successfully');
    expect(res.body).toHaveProperty('userId', userId);
    expect(res.header['set-cookie']).toBeDefined(); // Checks if cookie is set
    expect(res.header['set-cookie'][0]).toContain('token=');
  });

  it('should return 401 for invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password: 'wrongpassword',
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should access a protected route when logged in', async () => {
    // First, log in to get a token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/protected')
      .set('Cookie', `token=${token}`); // Send token via cookie

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Welcome user');
  });

  it('should return 401 for protected route without token', async () => {
    const res = await request(app).get('/api/auth/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Not authorized, no token');
  });

  it('should logout the user', async () => {
    // First, log in to get a token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      });
    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `token=${token}`); // Send token to be cleared

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out successfully');
    expect(res.header['set-cookie']).toBeDefined();
    expect(res.header['set-cookie'][0]).toContain('token=; Max-Age=0'); // Check for cookie clearing
  });
});
