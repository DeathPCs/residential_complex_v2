const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const DamageReportController = require('../controllers/DamageReportController');
const DamageReport = require('../../database/models/DamageReport');
const prismaService = require('../../database/prismaService');

const damageReportController = new DamageReportController();

/**
 * @swagger
 * /api/damage-reports:
 *   post:
 *     summary: Crear un nuevo reporte de daño
 *     tags: [Damage Reports]
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
 *               - title
 *               - description
 *             properties:
 *               apartmentId:
 *                 type: string
 *                 description: ID del apartamento donde se reporta el daño
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 description: Título del reporte de daño
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Descripción detallada del daño
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 description: Prioridad del reporte
 *     responses:
 *       201:
 *         description: Reporte de daño creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 */

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

/**
 * @swagger
 * /api/damage-reports/my-reports:
 *   get:
 *     summary: Obtener reportes de daño del usuario autenticado
 *     tags: [Damage Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes de daño del usuario obtenidos exitosamente
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
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, urgent]
 *                       status:
 *                         type: string
 *                         enum: [pending, in_progress, resolved, closed]
 *                       reportedAt:
 *                         type: string
 *                         format: date-time
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
 */

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

/**
 * @swagger
 * /api/damage-reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte de daño
 *     tags: [Damage Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte de daño a eliminar
 *     responses:
 *       200:
 *         description: Reporte de daño eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reporte eliminado correctamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para eliminar este reporte
 *       404:
 *         description: Reporte no encontrado
 */

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
