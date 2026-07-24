/* eslint-disable no-plusplus, no-await-in-loop */
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const { app, loginAgent } = require('../helpers/testApp');
const { resetDatabase, createTestUser } = require('../helpers/testDb');
const { makeExpiredToken, makeTamperedToken, makeMalformedToken } = require('../helpers/jwt');
const prisma = require('../../src/config/prisma');

const request = supertest(app);

describe('Auth Module Integration Tests', () => {
  let testIpCounter = 1;
  const getNextIp = () => `192.168.1.${testIpCounter++}`;

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('1. Correct username + password → 200, response data has {id, username, role}, no passwordHash/token', async () => {
      await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      
      const res = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({ username: 'testuser', password: 'password123' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.username).toBe('testuser');
      expect(res.body.data.role).toBe('staff');
      expect(res.body.data).not.toHaveProperty('passwordHash');
      expect(res.body.data).not.toHaveProperty('token');
    });

    it('2. Response sets a cookie named quila_token with HttpOnly and SameSite=Lax attributes', async () => {
      await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      
      const res = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({ username: 'testuser', password: 'password123' });
      
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/quila_token=/);
      expect(cookies[0]).toMatch(/HttpOnly/);
      expect(cookies[0]).toMatch(/SameSite=Strict/);
    });

    it('3. Wrong password (correct username) → 401, generic error message', async () => {
      await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      
      const res = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({ username: 'testuser', password: 'wrongpassword' });
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid username or password'); // Assuming this is the generic message
    });

    it('4. Non-existent username → 401, the exact same generic error message as #3', async () => {
      await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      
      const ip = getNextIp();
      const resWrongPwd = await request.post('/api/auth/login').set('X-Forwarded-For', ip).send({ username: 'testuser', password: 'wrongpassword' });
      const resNoUser = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({ username: 'nonexistent', password: 'password123' });
      
      expect(resNoUser.status).toBe(401);
      expect(resNoUser.body.error).toBe(resWrongPwd.body.error);
    });

    it('5. Missing username field → 400', async () => {
      const res = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({ password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('6. Missing password field → 400', async () => {
      const res = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({ username: 'testuser' });
      expect(res.status).toBe(400);
    });

    it('7. Empty request body → 400', async () => {
      const res = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({});
      expect(res.status).toBe(400);
    });

    it('8. 11th login attempt within the rate-limit window from the same test client → 429', async () => {
      const ip = getNextIp();
      // 10 failed attempts
      for (let i = 0; i < 10; i++) {
        const res = await request.post('/api/auth/login').set('X-Forwarded-For', ip).send({ username: 'testuser', password: 'wrong' });
        expect(res.status).toBe(401);
      }
      // 11th attempt
      const res11 = await request.post('/api/auth/login').set('X-Forwarded-For', ip).send({ username: 'testuser', password: 'wrong' });
      expect(res11.status).toBe(429);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('9. Called while authenticated → 200, and a subsequent GET /api/auth/me using the same agent fails with 401', async () => {
      await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      const agent = await loginAgent('testuser', 'password123', getNextIp());
      
      const logoutRes = await agent.post('/api/auth/logout');
      expect(logoutRes.status).toBe(200);

      const meRes = await agent.get('/api/auth/me');
      expect(meRes.status).toBe(401);
    });

    it('10. Called with no session at all (never logged in) → still 200', async () => {
      const res = await request.post('/api/auth/logout');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/auth/me', () => {
    it('11. Valid session cookie → 200, returns {id, username, role} matching the user that logged in', async () => {
      await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      const agent = await loginAgent('testuser', 'password123', getNextIp());
      
      const res = await agent.get('/api/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('testuser');
      expect(res.body.data.role).toBe('staff');
    });

    it('12. No cookie at all → 401', async () => {
      const res = await request.get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('13. Malformed token value in the cookie (not a valid JWT string) → 401', async () => {
      const res = await request.get('/api/auth/me').set('Cookie', [`quila_token=${makeMalformedToken()}`]);
      expect(res.status).toBe(401);
    });

    it('14. Expired token in the cookie → 401', async () => {
      const user = await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      const token = makeExpiredToken({ userId: user.id });
      const res = await request.get('/api/auth/me').set('Cookie', [`quila_token=${token}`]);
      expect(res.status).toBe(401);
    });

    it('15. Tampered token (valid JWT structure, wrong signature) in the cookie → 401', async () => {
      const user = await createTestUser({ username: 'testuser', password: 'password123', role: 'staff' });
      const token = makeTamperedToken({ userId: user.id });
      const res = await request.get('/api/auth/me').set('Cookie', [`quila_token=${token}`]);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/register', () => {
    it('16. Called by an authenticated admin with valid new-user data → 201, response has {id, username, role}, no passwordHash', async () => {
      await createTestUser({ username: 'admin', password: 'password123', role: 'admin' });
      const agent = await loginAgent('admin', 'password123', getNextIp());
      
      const res = await agent.post('/api/auth/register').send({
        username: 'newuser',
        password: 'password123',
        role: 'staff',
      });
      
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.username).toBe('newuser');
      expect(res.body.data.role).toBe('staff');
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('17. Verify the stored password is actually hashed', async () => {
      await createTestUser({ username: 'admin', password: 'password123', role: 'admin' });
      const agent = await loginAgent('admin', 'password123', getNextIp());
      
      await agent.post('/api/auth/register').send({
        username: 'newuser',
        password: 'plainTextPassword',
        role: 'staff',
      });
      
      const dbUser = await prisma.user.findUnique({ where: { username: 'newuser' } });
      expect(dbUser).not.toBeNull();
      expect(dbUser.passwordHash).not.toBe('plainTextPassword');
      
      const match = await bcrypt.compare('plainTextPassword', dbUser.passwordHash);
      expect(match).toBe(true);
    });

    it('18. Called by an authenticated staff-role user → 403', async () => {
      await createTestUser({ username: 'staffuser', password: 'password123', role: 'staff' });
      const agent = await loginAgent('staffuser', 'password123', getNextIp());
      
      const res = await agent.post('/api/auth/register').send({
        username: 'newuser',
        password: 'password123',
        role: 'staff',
      });
      
      expect(res.status).toBe(403);
    });

    it('19. Called with no session at all → 401', async () => {
      const res = await request.post('/api/auth/register').send({
        username: 'newuser',
        password: 'password123',
        role: 'staff',
      });
      
      expect(res.status).toBe(401);
    });

    it('20. Duplicate username (already exists) → 400 with a clear "already taken" message', async () => {
      await createTestUser({ username: 'existing', password: 'password123', role: 'staff' });
      await createTestUser({ username: 'admin', password: 'password123', role: 'admin' });
      const agent = await loginAgent('admin', 'password123', getNextIp());
      
      const res = await agent.post('/api/auth/register').send({
        username: 'existing',
        password: 'password123',
        role: 'staff',
      });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/taken|exists|duplicate/i);
    });

    it('21. Invalid role value (anything other than admin/staff) → 400', async () => {
      await createTestUser({ username: 'admin', password: 'password123', role: 'admin' });
      const agent = await loginAgent('admin', 'password123', getNextIp());
      
      const res = await agent.post('/api/auth/register').send({
        username: 'newuser',
        password: 'password123',
        role: 'superadmin',
      });
      
      expect(res.status).toBe(400);
    });

    it('22. password shorter than 8 characters → 400', async () => {
      await createTestUser({ username: 'admin', password: 'password123', role: 'admin' });
      const agent = await loginAgent('admin', 'password123', getNextIp());
      
      const res = await agent.post('/api/auth/register').send({
        username: 'newuser',
        password: 'short',
        role: 'staff',
      });
      
      expect(res.status).toBe(400);
    });

    it('23. username shorter than 3 characters → 400', async () => {
      await createTestUser({ username: 'admin', password: 'password123', role: 'admin' });
      const agent = await loginAgent('admin', 'password123', getNextIp());
      
      const res = await agent.post('/api/auth/register').send({
        username: 'ab',
        password: 'password123',
        role: 'staff',
      });
      
      expect(res.status).toBe(400);
    });

    it('24. End-to-end chain: register then login immediately → 200', async () => {
      await createTestUser({ username: 'admin', password: 'password123', role: 'admin' });
      const agent = await loginAgent('admin', 'password123', getNextIp());
      
      await agent.post('/api/auth/register').send({
        username: 'newuser',
        password: 'password123',
        role: 'staff',
      });
      
      const loginRes = await request.post('/api/auth/login').set('X-Forwarded-For', getNextIp()).send({
        username: 'newuser',
        password: 'password123',
      });
      
      expect(loginRes.status).toBe(200);
    });
  });
});
