const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const NotificationController = require('../controllers/NotificationController');

const notificationController = new NotificationController();

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

router.put('/:id/read', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
	try {
		const { id } = req.params;
		const notification = await prismaService.getNotificationById(id);
		if (!notification) return res.status(404).json({ success: false, error: 'Notificación no encontrada' });

		const updated = await prismaService.updateNotification(id, { read: true });
		res.json({
			success: true,
			data: updated,
			message: 'Notificación marcada como leída.'
		});
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

router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
	try {
		await notificationController.deleteNotification(req, res, next);
	} catch (error) {
		console.error('Error al eliminar notificación:', error, { params: req.params });
		next({ statusCode: 500, message: 'Error al eliminar notificación', details: error.message, stack: error.stack, params: req.params });
	}
});

module.exports = router;
