const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const AirbnbController = require('../controllers/AirbnbController');
const prismaService = require('../../database/prismaService');

const airbnbController = new AirbnbController();

router.post('/guests', auth, roleAuth(['admin']), airbnbController.registerGuest.bind(airbnbController));
router.put('/guests/:id/checkin', auth, roleAuth(['admin', 'security']), airbnbController.checkInGuest.bind(airbnbController));
router.put('/guests/:id/checkout', auth, roleAuth(['admin', 'security']), airbnbController.checkOutGuest.bind(airbnbController));
router.put('/guests/:id', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { apartmentId, guestName, guestCedula, numberOfGuests, checkInDate, checkOutDate } = req.body;
        const guest = await prismaService.getAirbnbGuestById(id);
        if (!guest) return res.status(404).json({ success: false, error: 'Huésped no encontrado' });
        const updated = await prismaService.updateAirbnbGuest(id, {
            apartmentId: apartmentId || guest.apartmentId,
            guestName: guestName || guest.guestName,
            guestCedula: guestCedula || guest.guestCedula,
            numberOfGuests: numberOfGuests || guest.numberOfGuests,
            checkInDate: checkInDate ? new Date(checkInDate) : guest.checkInDate,
            checkOutDate: checkOutDate ? new Date(checkOutDate) : guest.checkOutDate
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});
router.get('/guests/active', auth, roleAuth(['admin', 'security']), airbnbController.getActiveGuests.bind(airbnbController));
router.get('/guests', auth, roleAuth(['admin', 'owner', 'airbnb_guest']), airbnbController.getAllGuests.bind(airbnbController));
router.delete('/guests/:id', auth, roleAuth(['admin']), airbnbController.deleteGuest.bind(airbnbController));

module.exports = router;
