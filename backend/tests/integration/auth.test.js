const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/infrastructure/database/connection');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    describe('POST /api/auth/register', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Test123!',
                    cedula: '12345678',
                    phone: '3001234567'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('errors');
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });
});