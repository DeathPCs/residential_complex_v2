const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const MaintenanceController = require('../controllers/MaintenanceController');
const Maintenance = require('../../database/models/Maintenance');
const prismaService = require('../../database/prismaService');

const maintenanceController = new MaintenanceController();

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Crear una nueva tarea de mantenimiento
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - area
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 description: Título de la tarea de mantenimiento
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Descripción detallada de la tarea
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 description: Prioridad de la tarea
 *               area:
 *                 type: string
 *                 enum: [common_areas, elevators, plumbing, electrical, security, parking, gardens, pool, gym, other]
 *                 description: Área donde se realiza el mantenimiento
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha programada para el mantenimiento
 *     responses:
 *       201:
 *         description: Tarea de mantenimiento creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 */

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

/**
 * @swagger
 * /api/maintenance/{id}:
 *   put:
 *     summary: Actualizar una tarea de mantenimiento
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea de mantenimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 description: Título de la tarea de mantenimiento
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Descripción detallada de la tarea
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Prioridad de la tarea
 *               area:
 *                 type: string
 *                 enum: [common_areas, elevators, plumbing, electrical, security, parking, gardens, pool, gym, other]
 *                 description: Área donde se realiza el mantenimiento
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha programada para el mantenimiento
 *               completedDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de completación del mantenimiento
 *     responses:
 *       200:
 *         description: Tarea de mantenimiento actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Tarea de mantenimiento no encontrada
 */

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

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Obtener lista de tareas de mantenimiento
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número de elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filtrar por estado
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *           enum: [common_areas, elevators, plumbing, electrical, security, parking, gardens, pool, gym, other]
 *         description: Filtrar por área
 *     responses:
 *       200:
 *         description: Lista de tareas de mantenimiento obtenida exitosamente
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
 *                         enum: [pending, in_progress, completed, cancelled]
 *                       area:
 *                         type: string
 *                         enum: [common_areas, elevators, plumbing, electrical, security, parking, gardens, pool, gym, other]
 *                       scheduledDate:
 *                         type: string
 *                         format: date-time
 *                       completedDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 */

router.get('/', auth, roleAuth(['admin', 'maintenance']), async (req, res, next) => {
	try {
		await maintenanceController.getMaintenances(req, res, next);
	} catch (error) {
		console.error('Error al obtener mantenimientos:', error);
		next({ statusCode: 500, message: 'Error al obtener mantenimientos', details: error.message, stack: error.stack });
	}
});

module.exports = router;
