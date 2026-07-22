const request = require('supertest');
const app = require('../src/app');

describe('system endpoints', () => {
  test('GET /health reports a live process', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  test('GET /health/ready reports unavailable without MongoDB', async () => {
    const response = await request(app).get('/health/ready').expect(503);

    expect(response.body).toMatchObject({
      status: 'not_ready',
      database: 'disconnected',
    });
  });

  test('GET /openapi.json returns a valid OpenAPI document', async () => {
    const response = await request(app).get('/openapi.json').expect(200);

    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths['/api/rooms']).toBeDefined();
    expect(response.body.paths['/api/messages/{messageId}']).toBeDefined();
  });

  test('GET /api/config exposes safe runtime configuration', async () => {
    const response = await request(app).get('/api/config').expect(200);

    expect(response.body.data).toEqual({ authEnabled: true });
  });

  test('GET /api-docs/ serves Swagger UI', async () => {
    const response = await request(app).get('/api-docs/').expect(200);

    expect(response.text).toContain('swagger-ui');
    expect(response.text).toContain('Real-Time Chat API');
  });

  test('unknown routes return the standard error shape', async () => {
    const response = await request(app).get('/does-not-exist').expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Route not found',
    });
  });
});

describe('request validation', () => {
  test('guest login rejects an invalid username before database access', async () => {
    const response = await request(app)
      .post('/api/auth/guest')
      .send({ username: '!' })
      .expect(400);

    expect(response.body.message).toBe('Validation Error');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'username' }),
      ])
    );
  });

  test('room creation rejects an empty name before database access', async () => {
    const response = await request(app)
      .post('/api/rooms')
      .send({ name: '' })
      .expect(400);

    expect(response.body.message).toBe('Validation Error');
  });

  test('message lookup rejects malformed room IDs', async () => {
    const response = await request(app)
      .get('/api/messages/not-an-object-id')
      .expect(400);

    expect(response.body.errors[0]).toMatchObject({
      field: 'roomId',
      message: 'Invalid Room ID',
    });
  });

  test('message updates require valid IDs and non-empty content', async () => {
    const response = await request(app)
      .put('/api/messages/not-an-object-id')
      .send({ content: '' })
      .expect(400);

    expect(response.body.errors).toHaveLength(2);
  });
});
