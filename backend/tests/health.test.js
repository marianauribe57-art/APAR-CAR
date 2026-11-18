import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /api/health', () => {
  it('responde 200 con status ok', async () => {
    const respuesta = await request(app).get('/api/health');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.status).toBe('ok');
  });
});