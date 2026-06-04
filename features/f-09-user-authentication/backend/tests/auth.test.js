const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); // Assuming server.js exports the app
const db = require('../db');

chai.use(chaiHttp);
const expect = chai.expect;

const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'password123';

// Helper to clear test data
const clearTestData = async () => {
  try {
    await db.query('DELETE FROM users WHERE username = $1', [TEST_USERNAME]);
  } catch (err) {
    console.error('Error clearing test data:', err);
  }
};

describe('Auth API', () => {
  beforeEach(async () => {
    await clearTestData();
  });

  after(async () => {
    await clearTestData();
    // Close the DB pool if necessary, though usually not needed for tests ending
  });

  it('should register a new user', async () => {
    const res = await chai.request(app)
      .post('/api/auth/register')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('username', TEST_USERNAME);
    expect(res.body).to.have.property('token');
  });

  it('should not register a user that already exists', async () => {
    // First, register the user
    await chai.request(app)
      .post('/api/auth/register')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    // Try to register again
    const res = await chai.request(app)
      .post('/api/auth/register')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('msg', 'User already exists');
  });

  it('should login an existing user', async () => {
    // First, register the user
    await chai.request(app)
      .post('/api/auth/register')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    // Then, login
    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('username', TEST_USERNAME);
    expect(res.body).to.have.property('token');
    expect(res).to.have.cookie('token');
  });

  it('should return an error for invalid login credentials', async () => {
    // Register user first so the DB entry exists
    await chai.request(app)
      .post('/api/auth/register')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    // Try to login with wrong password
    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({ username: TEST_USERNAME, password: 'wrongpassword' });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('msg', 'Invalid credentials');
  });

  it('should protect a route and require a valid token', async () => {
    // Register and login to get a token
    const loginRes = await chai.request(app)
      .post('/api/auth/login')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    const token = loginRes.body.token;

    // Access protected route with token
    const res = await chai.request(app)
      .get('/api/auth/user')
      .set('Cookie', `token=${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('username', TEST_USERNAME);
  });

  it('should return 401 for protected route without token', async () => {
    const res = await chai.request(app)
      .get('/api/auth/user');

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('msg', 'No token, authorization denied');
  });

  it('should allow logout and clear the token cookie', async () => {
    // Register and login to get a token
    const loginRes = await chai.request(app)
      .post('/api/auth/login')
      .send({ username: TEST_USERNAME, password: TEST_PASSWORD });

    // Logout
    const res = await chai.request(app)
      .post('/api/auth/logout')
      .set('Cookie', loginRes.headers['set-cookie'][0]); // Ensure cookie is sent

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('msg', 'Logged out successfully');
    // The cookie should be cleared, but checking the response header for 'set-cookie' with max-age=0 is more reliable
    const logoutCookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
    expect(logoutCookie).to.include('Expires=Thu, 01 Jan 1970'); // Indicates cookie cleared
  });
});
