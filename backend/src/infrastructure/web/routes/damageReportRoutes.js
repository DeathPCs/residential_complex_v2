const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const DamageReportController = require('../controllers/DamageReportController');
const DamageReport = require('../../database/models/DamageReport');
const prismaService = require('../../database/prismaService');

const damageReportController = new DamageReportController();

router.post('/', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
	try {
		await damageReportController.createReport(req, res, next);
	} catch (error) {
		console.error('Error al crear reporte de daño:', error, { body: req.body });
		next({ statusCode: 500, message: 'Error al crear reporte de daño', details: error.message, stack: error.stack, body: req.body });
	}
});
router.get('/', auth, roleAuth(['admin']), [
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser entero positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next({ statusCode: 400, message: 'Validación fallida', errors: errors.array(), params: req.query });
    }
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const [reports, total] = await Promise.all([
            prismaService.getDamageReports({
                skip,
                take: parseInt(limit),
                include: { apartment: true, reporter: true }
            }),
            prismaService.countDamageReports()
        ]);
        res.json({ success: true, data: reports, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('Error al obtener reportes de daño:', error, { params: req.query });
        next({ statusCode: 500, message: 'Error al obtener reportes de daño', details: error.message, stack: error.stack, params: req.query });
    }
});
router.get('/my-reports', auth, async (req, res, next) => {
	try {
		await damageReportController.getMyReports(req, res, next);
	} catch (error) {
		console.error('Error al obtener reportes de daño:', error);
		next({ statusCode: 500, message: 'Error al obtener reportes de daño', details: error.message, stack: error.stack });
	}
});
router.put('/:id', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, description, priority } = req.body;
		const report = await prismaService.getDamageReportById(id);
		if (!report) return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
		// Check if user owns the report or is admin
		if (req.user.role !== 'admin' && report.reportedBy !== req.user.id) {
			return res.status(403).json({ success: false, error: 'No autorizado para editar este reporte' });
		}
		const updated = await prismaService.updateDamageReport(id, { title, description, priority });
		res.json({ success: true, data: updated });
	} catch (error) {
		next(error);
	}
});
router.put('/:id/status', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		await damageReportController.updateStatus(req, res, next);
	} catch (error) {
		console.error('Error al actualizar estado de reporte de daño:', error, { params: req.params, body: req.body });
		next({ statusCode: 500, message: 'Error al actualizar estado de reporte de daño', details: error.message, stack: error.stack, params: req.params, body: req.body });
	}
});
router.delete('/:id', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
	try {
		const { id } = req.params;
		const report = await prismaService.getDamageReportById(id);
		if (!report) return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
		// Check if user owns the report or is admin
		if (req.user.role !== 'admin' && report.reportedBy !== req.user.id) {
			return res.status(403).json({ success: false, error: 'No autorizado para eliminar este reporte' });
		}
		await prismaService.deleteDamageReport(id);
		res.json({ success: true, message: 'Reporte eliminado correctamente' });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
