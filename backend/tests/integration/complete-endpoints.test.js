const request = require('supertest');
const app = require('../../src/app');

describe('API Endpoints - Complete Test Suite', () => {
    let authToken;
    let userId;

    // Test data
    const testUser = {
        name: 'Juan Pérez',
        email: 'juan.perez@test.com',
        password: 'Test123!',
        cedula: '12345678',
        phone: '3001234567',
        role: 'admin'
    };

    const testUser2 = {
        name: 'María García',
        email: 'maria.garcia@test.com',
        password: 'Test456!',
        cedula: '87654321',
        phone: '3009876543',
        role: 'tenant'
    };

    describe('🔐 Authentication Endpoints', () => {
        describe('POST /api/auth/register', () => {
            it('should register a new user successfully', async () => {
                const res = await request(app)
                    .post('/api/auth/register')
                    .send(testUser);

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('token');
                expect(res.body.data.user).toHaveProperty('email', testUser.email);
                expect(res.body.data.user).toHaveProperty('name', testUser.name);
                expect(res.body.data.user).not.toHaveProperty('password');
                
                authToken = res.body.data.token;
                userId = res.body.data.user.id;
            });

            it('should validate required fields', async () => {
                const res = await request(app)
                    .post('/api/auth/register')
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });

            it('should not register user with existing email', async () => {
                const res = await request(app)
                    .post('/api/auth/register')
                    .send(testUser);

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });

            it('should validate email format', async () => {
                const res = await request(app)
                    .post('/api/auth/register')
                    .send({
                        ...testUser2,
                        email: 'invalid-email'
                    });

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });

            it('should validate password strength', async () => {
                const res = await request(app)
                    .post('/api/auth/register')
                    .send({
                        ...testUser2,
                        email: 'weak@test.com',
                        password: '123'
                    });

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });
        });

        describe('POST /api/auth/login', () => {
            it('should login successfully with valid credentials', async () => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: testUser.email,
                        password: testUser.password
                    });

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('token');
                expect(res.body.data.user).toHaveProperty('email', testUser.email);
            });

            it('should fail with invalid email', async () => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: 'nonexistent@test.com',
                        password: testUser.password
                    });

                expect(res.statusCode).toBe(401);
                expect(res.body).toHaveProperty('success', false);
            });

            it('should fail with invalid password', async () => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: testUser.email,
                        password: 'wrongpassword'
                    });

                expect(res.statusCode).toBe(401);
                expect(res.body).toHaveProperty('success', false);
            });

            it('should validate required fields', async () => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });
        });
    });

    describe('🏠 Airbnb Endpoints', () => {
        describe('POST /api/airbnb/guests', () => {
            it('should register a new Airbnb guest', async () => {
                const guestData = {
                    apartmentId: 101,
                    guestName: 'Carlos Mendoza',
                    guestCedula: '98765432',
                    numberOfGuests: 2,
                    checkInDate: '2025-09-20',
                    checkOutDate: '2025-09-25'
                };

                const res = await request(app)
                    .post('/api/airbnb/guests')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(guestData);

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('guestName', guestData.guestName);
                expect(res.body.data).toHaveProperty('status', 'pending');
                expect(res.body.data).toHaveProperty('notifications');
                expect(Array.isArray(res.body.data.notifications)).toBe(true);
            });

            it('should validate required fields', async () => {
                const res = await request(app)
                    .post('/api/airbnb/guests')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });
        });

        describe('PUT /api/airbnb/guests/:id/checkin', () => {
            it('should perform check-in for a guest', async () => {
                const guestId = 123;
                
                const res = await request(app)
                    .put(`/api/airbnb/guests/${guestId}/checkin`)
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('status', 'checked_in');
                expect(res.body.data).toHaveProperty('timestamp');
            });
        });

        describe('GET /api/airbnb/guests/active', () => {
            it('should get active guests for security control', async () => {
                const res = await request(app)
                    .get('/api/airbnb/guests/active')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(Array.isArray(res.body.data)).toBe(true);
            });
        });
    });

    describe('🔧 Maintenance Endpoints', () => {
        describe('POST /api/maintenance', () => {
            it('should create a new maintenance request', async () => {
                const maintenanceData = {
                    title: 'Limpieza de piscina',
                    description: 'Mantenimiento semanal de la piscina del conjunto',
                    area: 'piscina',
                    scheduledDate: '2025-09-25'
                };

                const res = await request(app)
                    .post('/api/maintenance')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(maintenanceData);

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('title', maintenanceData.title);
                expect(res.body.data).toHaveProperty('status', 'pending');
                expect(res.body.data).toHaveProperty('notifications');
            });

            it('should validate required fields', async () => {
                const res = await request(app)
                    .post('/api/maintenance')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });
        });

        describe('GET /api/maintenance', () => {
            it('should get all maintenance requests', async () => {
                const res = await request(app)
                    .get('/api/maintenance')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(Array.isArray(res.body.data)).toBe(true);
            });
        });

        describe('PUT /api/maintenance/:id/status', () => {
            it('should update maintenance status', async () => {
                const maintenanceId = 123;
                
                const res = await request(app)
                    .put(`/api/maintenance/${maintenanceId}/status`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ status: 'in_progress' });

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('status', 'in_progress');
            });
        });
    });

    describe('⚠️ Damage Report Endpoints', () => {
        describe('POST /api/damage-reports', () => {
            it('should create a new damage report', async () => {
                const reportData = {
                    apartmentId: 101,
                    title: 'Fuga en baño principal',
                    description: 'Se presenta una fuga de agua en el baño principal del apartamento'
                };

                const res = await request(app)
                    .post('/api/damage-reports')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(reportData);

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('title', reportData.title);
                expect(res.body.data).toHaveProperty('status', 'reported');
                expect(res.body.data).toHaveProperty('notifications');
            });

            it('should validate required fields', async () => {
                const res = await request(app)
                    .post('/api/damage-reports')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('success', false);
            });
        });

        describe('GET /api/damage-reports/my-reports', () => {
            it('should get user damage reports', async () => {
                const res = await request(app)
                    .get('/api/damage-reports/my-reports')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(Array.isArray(res.body.data)).toBe(true);
            });
        });
    });

    describe('📬 Notification Endpoints', () => {
        describe('GET /api/notifications', () => {
            it('should get user notifications', async () => {
                const res = await request(app)
                    .get('/api/notifications')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(Array.isArray(res.body.data)).toBe(true);
            });
        });

        describe('POST /api/notifications', () => {
            it('should send a general notification', async () => {
                const notificationData = {
                    title: 'Aviso general',
                    message: 'Reunión de propietarios el próximo viernes a las 7 PM',
                    type: 'general'
                };

                const res = await request(app)
                    .post('/api/notifications')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(notificationData);

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('title', notificationData.title);
            });
        });
    });

    describe('💰 Payment Endpoints', () => {
        describe('POST /api/payments', () => {
            it('should register a new monthly payment', async () => {
                const paymentData = {
                    apartmentId: 101,
                    amount: 150000,
                    description: 'Mensualidad Octubre 2025',
                    dueDate: '2025-10-05'
                };

                const res = await request(app)
                    .post('/api/payments')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(paymentData);

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('amount', paymentData.amount);
                expect(res.body.data).toHaveProperty('status', 'pending');
            });
        });

        describe('PUT /api/payments/:id/pay', () => {
            it('should mark payment as paid', async () => {
                const paymentId = 123;
                
                const res = await request(app)
                    .put(`/api/payments/${paymentId}/pay`)
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body.data).toHaveProperty('status', 'paid');
            });
        });
    });

    describe('🏢 Health and Status Endpoints', () => {
        describe('GET /health', () => {
            it('should return system health status', async () => {
                const res = await request(app).get('/health');

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('status', 'OK');
                expect(res.body).toHaveProperty('message');
                expect(res.body).toHaveProperty('version');
                expect(res.body).toHaveProperty('features');
                expect(res.body).toHaveProperty('apiEndpoints');
            });
        });

        describe('GET /api/test', () => {
            it('should return API test status', async () => {
                const res = await request(app).get('/api/test');

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('success', true);
                expect(res.body).toHaveProperty('message');
                expect(res.body).toHaveProperty('data');
                expect(res.body.data).toHaveProperty('features');
            });
        });

        describe('GET /', () => {
            it('should return welcome message', async () => {
                const res = await request(app).get('/');

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('message');
                expect(res.body).toHaveProperty('version');
                expect(res.body).toHaveProperty('features');
                expect(Array.isArray(res.body.features)).toBe(true);
            });
        });
    });

    describe('🔒 Authentication Middleware Tests', () => {
        it('should reject requests without authentication token', async () => {
            const res = await request(app)
                .get('/api/notifications');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should reject requests with invalid token', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    describe('❌ Error Handling', () => {
        it('should handle 404 for non-existent routes', async () => {
            const res = await request(app).get('/api/non-existent-route');

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('suggestions');
        });

        it('should handle invalid JSON in request body', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Content-Type', 'application/json')
                .send('invalid json');

            expect(res.statusCode).toBe(400);
        });
    });
});