const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const AirbnbController = require('../controllers/AirbnbController');
const prismaService = require('../../database/prismaService');

const airbnbController = new AirbnbController();

/**
 * @swagger
 * /api/airbnb/guests:
 *   post:
 *     summary: Registrar un nuevo huésped de Airbnb
 *     tags: [Airbnb]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apartmentId
 *               - guestName
 *               - guestCedula
 *               - numberOfGuests
 *               - checkInDate
 *               - checkOutDate
 *             properties:
 *               apartmentId:
 *                 type: string
 *                 description: ID del apartamento
 *               guestName:
 *                 type: string
 *                 description: Nombre del huésped
 *               guestCedula:
 *                 type: string
 *                 description: Cédula del huésped
 *               numberOfGuests:
 *                 type: integer
 *                 minimum: 1
 *                 description: Número de huéspedes
 *               checkInDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de check-in
 *               checkOutDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de check-out
 *     responses:
 *       201:
 *         description: Huésped registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 */

router.post('/guests', auth, roleAuth(['admin']), airbnbController.registerGuest.bind(airbnbController));

/**
 * @swagger
 * /api/airbnb/guests/{id}/checkin:
 *   put:
 *     summary: Realizar check-in de un huésped de Airbnb
 *     tags: [Airbnb]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del huésped
 *     responses:
 *       200:
 *         description: Check-in realizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Huésped no encontrado
 */

router.put('/guests/:id/checkin', auth, roleAuth(['admin', 'security']), airbnbController.checkInGuest.bind(airbnbController));
router.put('/guests/:id/checkout', auth, roleAuth(['admin', 'security']), airbnbController.checkOutGuest.bind(airbnbController));

/**
 * @swagger
 * /api/airbnb/guests/{id}:
 *   put:
 *     summary: Actualizar información de un huésped de Airbnb
 *     tags: [Airbnb]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del huésped
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apartmentId:
 *                 type: string
 *                 description: ID del apartamento
 *               guestName:
 *                 type: string
 *                 description: Nombre del huésped
 *               guestCedula:
 *                 type: string
 *                 description: Cédula del huésped
 *               numberOfGuests:
 *                 type: integer
 *                 minimum: 1
 *                 description: Número de huéspedes
 *               checkInDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de check-in
 *               checkOutDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de check-out
 *     responses:
 *       200:
 *         description: Huésped actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Huésped no encontrado
 */

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

/**
 * @swagger
 * /api/airbnb/guests/active:
 *   get:
 *     summary: Obtener lista de huéspedes activos de Airbnb
 *     tags: [Airbnb]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de huéspedes activos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       guestName:
 *                         type: string
 *                       guestCedula:
 *                         type: string
 *                       numberOfGuests:
 *                         type: integer
 *                       checkInDate:
 *                         type: string
 *                         format: date-time
 *                       checkOutDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [pending, checked_in, checked_out]
 *                       apartment:
 *                         type: object
 *                         properties:
 *                           number:
 *                             type: string
 *                           tower:
 *                             type: string
 *                           floor:
 *                             type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 */

router.get('/guests/active', auth, roleAuth(['admin', 'security']), airbnbController.getActiveGuests.bind(airbnbController));
/**
 * @swagger
 * /api/airbnb/guests:
 *   get:
 *     summary: Obtener lista de todos los huéspedes de Airbnb
 *     tags: [Airbnb]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de huéspedes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       guestName:
 *                         type: string
 *                       guestCedula:
 *                         type: string
 *                       numberOfGuests:
 *                         type: integer
 *                       checkInDate:
 *                         type: string
 *                         format: date-time
 *                       checkOutDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [pending, checked_in, checked_out]
 *                       apartment:
 *                         type: object
 *                         properties:
 *                           number:
 *                             type: string
 *                           tower:
 *                             type: string
 *                           floor:
 *                             type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 */

router.get('/guests', auth, roleAuth(['admin', 'owner', 'airbnb_guest']), airbnbController.getAllGuests.bind(airbnbController));
router.delete('/guests/:id', auth, roleAuth(['admin']), airbnbController.deleteGuest.bind(airbnbController));

module.exports = router;
