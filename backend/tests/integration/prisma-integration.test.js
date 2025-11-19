// Tests robustos de integración para el backend con Prisma
const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/infrastructure/database/prismaClient');

describe('🧪 Backend Integration Tests with Prisma', () => {
    let authToken;
    let testUserId;
    let testApartmentId;

    beforeAll(async () => {
        // Limpiar base de datos antes de comenzar
        await prisma.payment.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.damageReport.deleteMany();
        await prisma.maintenance.deleteMany();
        await prisma.airbnbGuest.deleteMany();
        await prisma.apartment.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('👤 Authentication & User Management', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    cedula: '12345678',
                    phone: '3001234567',
                    password: 'password123',
                    role: 'tenant'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
            
            authToken = res.body.data.token;
            testUserId = res.body.data.user.id;
        });

        it('should not register duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'test@example.com',
                    cedula: '87654321',
                    password: 'password123',
                    role: 'tenant'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should login successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });

        it('should get user list with authentication', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('🏢 Apartment Management', () => {
        it('should create a new apartment', async () => {
            const res = await request(app)
                .post('/api/apartments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    number: '101',
                    tower: 'A',
                    floor: 1,
                    type: 'residential',
                    status: 'occupied'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('number', '101');
            
            testApartmentId = res.body.data.id;
        });

        it('should get all apartments', async () => {
            const res = await request(app)
                .get('/api/apartments')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('🏠 Airbnb Guest Management', () => {
        let guestId;

        it('should register a new Airbnb guest', async () => {
            const res = await request(app)
                .post('/api/airbnb/guests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    apartmentId: testApartmentId,
                    guestName: 'John Doe',
                    guestCedula: '11223344',
                    numberOfGuests: 2,
                    checkInDate: new Date().toISOString(),
                    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString()
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('guestName', 'John Doe');
            expect(res.body.data).toHaveProperty('status', 'pending');
            
            guestId = res.body.data.id;
        });

        it('should check-in a guest', async () => {
            const res = await request(app)
                .put(`/api/airbnb/guests/${guestId}/checkin`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('status', 'checked_in');
        });

        it('should get active guests', async () => {
            const res = await request(app)
                .get('/api/airbnb/guests/active')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('🔧 Maintenance Management', () => {
        let maintenanceId;

        it('should create a maintenance request', async () => {
            const res = await request(app)
                .post('/api/maintenance')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Pool Cleaning',
                    description: 'Monthly pool maintenance',
                    area: 'Common Areas',
                    scheduledDate: new Date(Date.now() + 86400000).toISOString()
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('title', 'Pool Cleaning');
            expect(res.body.data).toHaveProperty('status', 'pending');
            
            maintenanceId = res.body.data.id;
        });

        it('should update maintenance status', async () => {
            const res = await request(app)
                .put(`/api/maintenance/${maintenanceId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'in_progress' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('status', 'in_progress');
        });

        it('should get all maintenance requests', async () => {
            const res = await request(app)
                .get('/api/maintenance')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('⚠️ Damage Report Management', () => {
        let reportId;

        it('should create a damage report', async () => {
            const res = await request(app)
                .post('/api/damage-reports')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    apartmentId: testApartmentId,
                    title: 'Broken Window',
                    description: 'Window in living room is cracked',
                    priority: 'high',
                    images: []
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('title', 'Broken Window');
            expect(res.body.data).toHaveProperty('status', 'reported');
            
            reportId = res.body.data.id;
        });

        it('should get user damage reports', async () => {
            const res = await request(app)
                .get('/api/damage-reports/my-reports')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('🔔 Notification Management', () => {
        it('should get user notifications', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should create a notification (admin)', async () => {
            // First create an admin user
            const adminRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    cedula: '99887766',
                    password: 'admin123',
                    role: 'admin'
                });

            const adminToken = adminRes.body.data.token;

            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    userId: testUserId,
                    message: 'Test notification message',
                    type: 'general'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('message', 'Test notification message');
        });
    });

    describe('💰 Payment Management', () => {
        let paymentId;

        it('should create a payment record (admin)', async () => {
            const adminRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@example.com',
                    password: 'admin123'
                });

            const adminToken = adminRes.body.data.token;

            const res = await request(app)
                .post('/api/payments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    userId: testUserId,
                    amount: 150000,
                    concept: 'Monthly administration fee',
                    dueDate: new Date(Date.now() + 86400000 * 30).toISOString()
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('amount', 150000);
            expect(res.body.data).toHaveProperty('status', 'pending');
            
            paymentId = res.body.data.id;
        });

        it('should mark payment as paid', async () => {
            const res = await request(app)
                .put(`/api/payments/${paymentId}/pay`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('status', 'paid');
        });
    });

    describe('🔒 Authorization & Security', () => {
        it('should reject requests without token', async () => {
            const res = await request(app).get('/api/apartments');
            expect(res.statusCode).toBe(401);
        });

        it('should reject invalid token', async () => {
            const res = await request(app)
                .get('/api/apartments')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });

        it('should validate required fields on registration', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'incomplete@example.com'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('📊 Data Validation', () => {
        it('should validate email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    cedula: '11111111',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should handle special characters in names', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: "María José O'Connor",
                    email: 'maria@example.com',
                    cedula: '22334455',
                    password: 'password123',
                    role: 'tenant'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.user).toHaveProperty('name', "María José O'Connor");
        });
    });
});
