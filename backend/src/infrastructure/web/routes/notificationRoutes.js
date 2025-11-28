const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const NotificationController = require('../controllers/NotificationController');

const notificationController = new NotificationController();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener notificaciones del usuario autenticado
 *     tags: [Notifications]
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
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de lectura
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success, maintenance, payment, security]
 *         description: Filtrar por tipo de notificación
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas exitosamente
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
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [info, warning, error, success, maintenance, payment, security]
 *                       read:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       userId:
 *                         type: string
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

router.get('/', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
	try {
		await notificationController.getNotifications(req, res, next);
	} catch (error) {
		console.error('Error al obtener notificaciones:', error, { user: req.user });
		next({ statusCode: 500, message: 'Error al obtener notificaciones', details: error.message, stack: error.stack, user: req.user });
	}
});

router.post('/', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		await notificationController.createNotification(req, res, next);
	} catch (error) {
		console.error('Error al crear notificación:', error, { body: req.body });
		next({ statusCode: 500, message: 'Error al crear notificación', details: error.message, stack: error.stack, body: req.body });
	}
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída exitosamente
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
 *                   example: "Notificación marcada como leída"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Notificación no encontrada
 */

router.put('/:id/read', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
	try {
		await notificationController.markAsRead(req, res, next);
	} catch (error) {
		console.error('Error al marcar notificación como leída:', error, { params: req.params });
		next({ statusCode: 500, message: 'Error al marcar notificación como leída', details: error.message, stack: error.stack, params: req.params });
	}
});

router.put('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		await notificationController.updateNotification(req, res, next);
	} catch (error) {
		console.error('Error al actualizar notificación:', error, { params: req.params, body: req.body });
		next({ statusCode: 500, message: 'Error al actualizar notificación', details: error.message, stack: error.stack, params: req.params, body: req.body });
	}
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Eliminar una notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación a eliminar
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
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
 *                   example: "Notificación eliminada correctamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Notificación no encontrada
 */

router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		await notificationController.deleteNotification(req, res, next);
	} catch (error) {
		console.error('Error al eliminar notificación:', error, { params: req.params });
		next({ statusCode: 500, message: 'Error al eliminar notificación', details: error.message, stack: error.stack, params: req.params });
	}
});

module.exports = router;
