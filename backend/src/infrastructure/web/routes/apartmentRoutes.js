const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const prismaService = require('../../database/prismaService');

router.get('/', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
    try {
        const options = { include: { owner: true, assignedUser: true } };
        if (req.user.role === 'owner') {
            options.where = { assignedUserId: req.user.id, assignedRole: 'owner' };
        }
        const apartments = await prismaService.getApartments(options);
        res.json({ success: true, data: apartments });
    } catch (error) {
        console.error('Error al obtener apartamentos:', error);
        next({ statusCode: 500, message: 'Error al obtener apartamentos', details: error.message, stack: error.stack });
    }
});

router.post('/', auth, roleAuth(['admin', 'owner']), async (req, res, next) => {
    try {
        const { number, tower, floor, status, type, assignedUserId, assignedRole } = req.body;
        const newApartment = await prismaService.createApartment({
            number,
            tower,
            floor: parseInt(floor),
            status: status || 'vacant',
            type,
            ownerId: req.user.id,
            assignedUserId,
            assignedRole
        });
        res.status(201).json({
            success: true,
            data: newApartment,
            message: 'Apartamento registrado exitosamente'
        });
    } catch (error) {
        console.error('Error al registrar apartamento:', error, { body: req.body });
        next({ statusCode: 500, message: 'Error al registrar apartamento', details: error.message, stack: error.stack, body: req.body });
    }
});

router.put('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { number, tower, floor, status, type, assignedUserId, assignedRole } = req.body;

        const apartment = await prismaService.getApartmentById(id);
        if (!apartment) return res.status(404).json({ success: false, error: 'Apartamento no encontrado' });

        const updatedApartment = await prismaService.updateApartment(id, {
            number,
            tower,
            floor: parseInt(floor),
            status,
            type,
            assignedUserId,
            assignedRole
        });

        res.json({
            success: true,
            data: updatedApartment,
            message: 'Apartamento actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar apartamento:', error, { id: req.params.id, body: req.body });
        next({ statusCode: 500, message: 'Error al actualizar apartamento', details: error.message, stack: error.stack, params: { id: req.params.id, body: req.body } });
    }
});

router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        const { id } = req.params;

        const apartment = await prismaService.getApartmentById(id);
        if (!apartment) return res.status(404).json({ success: false, error: 'Apartamento no encontrado' });

        await prismaService.deleteApartment(id);

        res.json({
            success: true,
            message: 'Apartamento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar apartamento:', error, { id: req.params.id });
        next({ statusCode: 500, message: 'Error al eliminar apartamento', details: error.message, stack: error.stack, params: { id: req.params.id } });
    }
});

module.exports = router;
