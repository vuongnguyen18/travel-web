const request = require('supertest');
const app = require('../src/app');

it('health is ok', async () => {
  const r = await request(app).get('/health');
  expect(r.status).toBe(200);
  expect(r.text).toBe('ok');
});
