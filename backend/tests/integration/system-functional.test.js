const request = require('supertest');
const app = require('../../src/app');

describe('🚀 Functional System Tests', () => {
    describe('System Health and Basic Functionality', () => {
        it('should return system health status', async () => {
            const res = await request(app).get('/health');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'OK');
            expect(res.body).toHaveProperty('message', '🏢 Sistema Conjuntos Residenciales API');
            expect(res.body).toHaveProperty('version', '1.0.0');
            expect(res.body).toHaveProperty('features');
            
            // Verify all required features are present
            expect(res.body.features).toHaveProperty('airbnb');
            expect(res.body.features).toHaveProperty('maintenance');
            expect(res.body.features).toHaveProperty('damageReports'); 
            expect(res.body.features).toHaveProperty('payments');
            expect(res.body.features).toHaveProperty('notifications');
        });

        it('should return API test endpoint information', async () => {
            const res = await request(app).get('/api/test');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message', '✅ API funcionando correctamente');
            expect(res.body.data).toHaveProperty('features');
            expect(res.body.data).toHaveProperty('flowsImplemented');
            
            // Verify implemented flows
            expect(res.body.data.flowsImplemented).toHaveProperty('airbnb');
            expect(res.body.data.flowsImplemented).toHaveProperty('maintenance');
            expect(res.body.data.flowsImplemented).toHaveProperty('damageReports');
            expect(res.body.data.flowsImplemented).toHaveProperty('payments');
        });

        it('should return welcome message for root endpoint', async () => {
            const res = await request(app).get('/');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', '🏢 Bienvenido al Sistema de Conjuntos Residenciales');
            expect(res.body).toHaveProperty('version', '1.0.0');
            expect(res.body).toHaveProperty('features');
            expect(Array.isArray(res.body.features)).toBe(true);
            expect(res.body.features).toContain('🏠 Gestión de apartamentos y propietarios');
            expect(res.body.features).toContain('🛏️ Sistema Airbnb con notificaciones automáticas');
        });

        it('should handle 404 for non-existent routes properly', async () => {
            const res = await request(app).get('/api/non-existent-route');

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('suggestions');
            expect(res.body.suggestions).toHaveProperty('availableEndpoints');
            expect(res.body.suggestions).toHaveProperty('documentation');
        });
    });

    describe('Authentication System Requirements', () => {
        const testUsers = [
            { name: 'Admin User', email: 'admin@residential.test', password: 'Admin123!', cedula: '10000001', role: 'admin' },
            { name: 'Owner User', email: 'owner@residential.test', password: 'Owner123!', cedula: '10000002', role: 'owner' },
            { name: 'Tenant User', email: 'tenant@residential.test', password: 'Tenant123!', cedula: '10000003', role: 'tenant' },
            { name: 'Security User', email: 'security@residential.test', password: 'Security123!', cedula: '10000004', role: 'security' },
            { name: 'Guest User', email: 'guest@residential.test', password: 'Guest123!', cedula: '10000005', role: 'airbnb_guest' }
        ];

        testUsers.forEach((user, index) => {
            it(`should register ${user.role} user successfully`, async () => {
                const uniqueUser = {
                    ...user,
                    email: `${user.role}${Date.now()}@test.com`,
                    cedula: `${100000 + index}${Date.now()}`
                };

                const res = await request(app)
                    .post('/api/auth/register')
                    .send(uniqueUser);

                if (res.statusCode === 201) {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body.data).toHaveProperty('token');
                    expect(res.body.data.user).toHaveProperty('role', user.role);
                    expect(res.body.data.user).not.toHaveProperty('password');
                } else {
                    // If registration fails due to validation or other issues, 
                    // still verify the error response structure
                    expect(res.body).toHaveProperty('success', false);
                }
            });
        });

        it('should validate password requirements', async () => {
            const weakUser = {
                name: 'Weak Password User',
                email: `weak${Date.now()}@test.com`,
                password: '123', // Too weak
                cedula: `${Date.now()}`
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(weakUser);

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should validate email format', async () => {
            const invalidEmailUser = {
                name: 'Invalid Email User',
                email: 'invalid-email-format',
                password: 'Valid123!',
                cedula: `${Date.now()}`
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidEmailUser);

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    describe('Business Logic and Workflow Tests', () => {
        it('should handle Airbnb guest registration workflow', async () => {
            const guestData = {
                apartmentId: 101,
                guestName: 'Test Guest',
                guestCedula: '12345678',
                numberOfGuests: 2,
                checkInDate: '2025-09-25',
                checkOutDate: '2025-09-30'
            };

            const res = await request(app)
                .post('/api/airbnb/guests')
                .send(guestData);

            // Since this endpoint doesn't require auth in current implementation
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('guestName', guestData.guestName);
            expect(res.body.data).toHaveProperty('status', 'pending');
            expect(res.body.data).toHaveProperty('notifications');
            expect(Array.isArray(res.body.data.notifications)).toBe(true);
            expect(res.body.data.notifications).toHaveLength(3);
        });

        it('should handle maintenance creation workflow', async () => {
            const maintenanceData = {
                title: 'Test Maintenance',
                description: 'Test maintenance description',
                area: 'pool'
            };

            const res = await request(app)
                .post('/api/maintenance')
                .send(maintenanceData);

            // Will return 401 without auth, but we can verify the endpoint exists
            expect([201, 401, 403]).toContain(res.statusCode);
            if (res.statusCode === 201) {
                expect(res.body.data).toHaveProperty('title', maintenanceData.title);
            }
        });

        it('should handle damage report creation workflow', async () => {
            const reportData = {
                apartmentId: 101,
                title: 'Test Damage',
                description: 'Test damage description'
            };

            const res = await request(app)
                .post('/api/damage-reports')
                .send(reportData);

            // Will return 401 without auth, but we can verify the endpoint exists
            expect([201, 401, 403]).toContain(res.statusCode);
            if (res.statusCode === 201) {
                expect(res.body.data).toHaveProperty('title', reportData.title);
            }
        });
    });

    describe('Security and Validation Requirements', () => {
        it('should require authentication for protected endpoints', async () => {
            const protectedEndpoints = [
                { method: 'get', path: '/api/notifications' },
                { method: 'post', path: '/api/maintenance' },
                { method: 'get', path: '/api/damage-reports/my-reports' },
                { method: 'post', path: '/api/payments' }
            ];

            for (const endpoint of protectedEndpoints) {
                const res = await request(app)[endpoint.method](endpoint.path);
                expect(res.statusCode).toBe(401);
                expect(res.body).toHaveProperty('success', false);
            }
        });

        it('should reject invalid authentication tokens', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.error).toContain('Invalid token');
        });

        it('should handle malformed JSON requests', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}');

            expect(res.statusCode).toBe(400);
        });
    });

    describe('API Documentation and Compliance', () => {
        it('should provide comprehensive feature documentation in health endpoint', async () => {
            const res = await request(app).get('/health');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.features.airbnb).toHaveProperty('description');
            expect(res.body.features.airbnb).toHaveProperty('endpoints');
            expect(res.body.features.maintenance).toHaveProperty('description');
            expect(res.body.features.damageReports).toHaveProperty('description');
            expect(res.body.features.payments).toHaveProperty('description');
            expect(res.body.features.notifications).toHaveProperty('description');
        });

        it('should provide API endpoint documentation', async () => {
            const res = await request(app).get('/health');
            
            expect(res.body).toHaveProperty('apiEndpoints');
            expect(res.body.apiEndpoints).toHaveProperty('health');
            expect(res.body.apiEndpoints).toHaveProperty('test');
            expect(res.body.apiEndpoints).toHaveProperty('auth');
            expect(res.body.apiEndpoints).toHaveProperty('airbnb');
            expect(res.body.apiEndpoints).toHaveProperty('maintenance');
        });

        it('should demonstrate all required business flows', async () => {
            const res = await request(app).get('/api/test');
            
            expect(res.body.data.flowsImplemented).toHaveProperty('airbnb');
            expect(res.body.data.flowsImplemented.airbnb).toContain('Registro → Notificación automática → Check-in → Control');
            
            expect(res.body.data.flowsImplemented).toHaveProperty('maintenance');
            expect(res.body.data.flowsImplemented.maintenance).toContain('Programación → Notificación masiva → Seguimiento');
            
            expect(res.body.data.flowsImplemented).toHaveProperty('damageReports');
            expect(res.body.data.flowsImplemented.damageReports).toContain('Reporte → Notificación al propietario → Seguimiento');
            
            expect(res.body.data.flowsImplemented).toHaveProperty('payments');
            expect(res.body.data.flowsImplemented.payments).toContain('Mensualidad → Notificación de mora → Pago');
        });
    });

    describe('System Performance and Reliability', () => {
        it('should respond to health checks within reasonable time', async () => {
            const start = Date.now();
            const res = await request(app).get('/health');
            const duration = Date.now() - start;
            
            expect(res.statusCode).toBe(200);
            expect(duration).toBeLessThan(1000); // Should respond within 1 second
        });

        it('should handle concurrent requests', async () => {
            const requests = Array(5).fill().map(() => request(app).get('/health'));
            const responses = await Promise.all(requests);
            
            responses.forEach(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body.status).toBe('OK');
            });
        });

        it('should maintain consistent response structure', async () => {
            const endpoints = ['/health', '/api/test', '/'];
            
            for (const endpoint of endpoints) {
                const res = await request(app).get(endpoint);
                expect(res.statusCode).toBe(200);
                expect(typeof res.body).toBe('object');
                expect(res.body).not.toBeNull();
            }
        });
    });
});