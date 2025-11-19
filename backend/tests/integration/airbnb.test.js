const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/infrastructure/database/models/AirbnbGuest');
const AirbnbGuest = require('../../src/infrastructure/database/models/AirbnbGuest');

describe('AirbnbGuest Endpoints', () => {
    let guestId;
    beforeAll(async () => {
        await sequelize.sync({ force: false });
    });
    afterAll(async () => {
        await sequelize.close();
    });

    it('debería registrar un huésped Airbnb', async () => {
        const res = await request(app)
            .post('/api/airbnb/register')
            .send({
                apartmentId: 'test-apartment',
                guestName: 'Juan Perez',
                guestCedula: '123456789',
                numberOfGuests: 2,
                checkInDate: '2024-06-10',
                checkOutDate: '2024-06-12'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        guestId = res.body.data.id;
    });

    it('debería hacer check-in del huésped', async () => {
        const res = await request(app)
            .post(`/api/airbnb/checkin/${guestId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('checked_in');
    });

    it('debería hacer check-out del huésped', async () => {
        const res = await request(app)
            .post(`/api/airbnb/checkout/${guestId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('checked_out');
    });

    it('debería eliminar el huésped Airbnb', async () => {
        const res = await request(app)
            .delete(`/api/airbnb/${guestId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
