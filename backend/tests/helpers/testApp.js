const supertest = require('supertest');
const app = require('../../src/app');

async function loginAgent(username, password, ip = '127.0.0.1') {
  const agent = supertest.agent(app);
  await agent
    .post('/api/auth/login')
    .set('X-Forwarded-For', ip)
    .send({ username, password })
    .expect(200);
  return agent;
}

module.exports = {
  app,
  loginAgent,
};
