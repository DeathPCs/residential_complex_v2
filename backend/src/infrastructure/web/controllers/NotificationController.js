const prismaService = require('../../database/prismaService');

class NotificationController {
    async createNotification(req, res, next) {
        try {
            const { title, message, type, recipientType, recipientId } = req.body;
            const newNotification = await prismaService.createNotification({
                title,
                message,
                type: type || 'general',
                recipientType: recipientType || 'all',
                recipientId: recipientId ? String(recipientId) : null,
                read: false
            });

            res.status(201).json({
                success: true,
                data: newNotification,
                message: 'Notificación creada correctamente.'
            });
        } catch (error) {
            next(error);
        }
    }

    async updateNotification(req, res, next) {
        try {
            const { id } = req.params;
            const { title, message, type, recipientType, recipientId } = req.body;
            const notification = await prismaService.getNotificationById(id);
            if (!notification) return res.status(404).json({ success: false, error: 'Notificación no encontrada' });

            const updateData = {};
            if (title) updateData.title = title;
            if (message) updateData.message = message;
            if (type) updateData.type = type;
            if (recipientType) updateData.recipientType = recipientType;
            if (recipientId !== undefined) updateData.recipientId = recipientId ? String(recipientId) : null;

            const updated = await prismaService.updateNotification(id, updateData);
            res.json({
                success: true,
                data: updated,
                message: 'Notificación actualizada correctamente.'
            });
        } catch (error) {
            next(error);
        }
    }

    async getNotifications(req, res, next) {
        try {
            const notifications = await prismaService.getNotifications({
                orderBy: { createdAt: 'desc' }
            });
            res.json({
                success: true,
                data: notifications,
                message: 'Notificaciones obtenidas correctamente.'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteNotification(req, res, next) {
        try {
            const { id } = req.params;
            const notification = await prismaService.getNotificationById(id);
            if (!notification) return res.status(404).json({ success: false, error: 'Notificación no encontrada' });
            await prismaService.deleteNotification(id);
            res.json({ success: true, message: 'Notificación eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NotificationController;
