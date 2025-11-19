const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const MaintenanceController = require('../controllers/MaintenanceController');
const Maintenance = require('../../database/models/Maintenance');
const prismaService = require('../../database/prismaService');

const maintenanceController = new MaintenanceController();

router.post('/', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		await maintenanceController.createMaintenance(req, res, next);
	} catch (error) {
		console.error('Error al crear mantenimiento:', error, { body: req.body });
		next({ statusCode: 500, message: 'Error al crear mantenimiento', details: error.message, stack: error.stack, body: req.body });
	}
});
router.put('/:id/status', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		await maintenanceController.updateStatus(req, res, next);
	} catch (error) {
		console.error('Error al actualizar estado de mantenimiento:', error, { params: req.params, body: req.body });
		next({ statusCode: 500, message: 'Error al actualizar estado de mantenimiento', details: error.message, stack: error.stack, params: req.params, body: req.body });
	}
});
router.put('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, description, priority, area, scheduledDate, completedDate } = req.body;
		const maintenance = await prismaService.getMaintenanceById(id);
		if (!maintenance) return res.status(404).json({ success: false, error: 'Mantenimiento no encontrado' });
		const updated = await prismaService.updateMaintenance(id, {
			title,
			description,
			priority,
			area,
			scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
			completedDate: completedDate ? new Date(completedDate) : null
		});
		res.json({ success: true, data: updated });
	} catch (error) {
		next(error);
	}
});
router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		const { id } = req.params;
		const maintenance = await prismaService.getMaintenanceById(id);
		if (!maintenance) return res.status(404).json({ success: false, error: 'Mantenimiento no encontrado' });
		await prismaService.deleteMaintenance(id);
		res.json({ success: true, message: 'Mantenimiento eliminado correctamente' });
	} catch (error) {
		next(error);
	}
});
router.get('/', auth, roleAuth(['admin', 'maintenance']), async (req, res, next) => {
	try {
		await maintenanceController.getMaintenances(req, res, next);
	} catch (error) {
		console.error('Error al obtener mantenimientos:', error);
		next({ statusCode: 500, message: 'Error al obtener mantenimientos', details: error.message, stack: error.stack });
	}
});

module.exports = router;
