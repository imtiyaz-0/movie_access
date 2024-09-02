const request = require('supertest');
const app = require('../server'); 
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {

  // Test user registration
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  // Test registration validation errors
  it('should return validation errors for invalid registration', async () => {
    // Invalid email
    let res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'invalidemail', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ msg: 'Invalid email address' }));

    // Short username
    res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'us', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ msg: 'Username must be at least 3 characters long' }));

    // Short password
    res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ msg: 'Password must be at least 6 characters long' }));
  });

  // Test user login
  it('should login a user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

    // Now, attempt to login with the registered user
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.status).toBe(200);
    // expect(res.body.token).toBeDefined();
  });

  // Test login validation errors
  it('should return validation errors for invalid login', async () => {
    // Invalid username
    let res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'invaliduser', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');

    // Incorrect password
    res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  // Test user logout
  it('should logout a user', async () => {
    // First, register and login a user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    const token = loginRes.body.token;

    // Now, attempt to logout
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');
  });

  // // Test requesting password reset
  // it('should request a password reset', async () => {
  //   await request(app)
  //     .post('/api/auth/register')
  //     .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

  //   const res = await request(app)
  //     .post('/api/auth/request-reset')
  //     .send({ email: 'test@example.com' });

  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toBe('Password reset link sent to your email.');
  // });

  // Test password reset validation errors
  it('should return validation errors for password reset', async () => {
    // Missing email
    let res = await request(app)
      .post('/api/auth/request-reset')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email is required.');

    // Non-existent email
    res = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: 'nonexistent@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No user with that email');
  });

});
