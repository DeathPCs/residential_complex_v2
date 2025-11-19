const request = require('supertest');
const app = require('../../src/app');

describe('Endpoints de Usuario', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Autenticación como admin para pruebas
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@residential.com', password: 'AdminPassword123' });
    token = res.body.token;
  });

  it('GET /api/users - debe devolver usuarios paginados', async () => {
    const res = await request(app)
      .get('/api/users?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/auth/register - debe registrar un usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Test1234',
        cedula: '12345678',
        role: 'tenant'
      });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
    userId = res.body.data?.id;
  });

  it('PUT /api/users/:id - debe actualizar el usuario', async () => {
    if (!userId) return;
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated User', status: 'active' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated User');
  });

  it('DELETE /api/users/:id - debe eliminar el usuario', async () => {
    if (!userId) return;
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Usuario eliminado');
  });
});
