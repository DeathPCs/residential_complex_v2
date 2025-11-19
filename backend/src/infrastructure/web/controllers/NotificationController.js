const prismaService = require('../../database/prismaService');

class NotificationController {
    async createNotification(req, res, next) {
        try {
            const { message, type, userId } = req.body;
            
            if (!userId || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'userId y message son requeridos'
                });
            }
            
            const newNotification = await prismaService.createNotification({
                userId: String(userId),
                message: message,
                type: type || 'general',
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
            const { message, type, userId, read } = req.body;
            const notification = await prismaService.getNotificationById(id);
            if (!notification) return res.status(404).json({ success: false, error: 'Notificación no encontrada' });

            const updateData = {};
            if (message !== undefined) updateData.message = message;
            if (type !== undefined) updateData.type = type;
            if (userId !== undefined) updateData.userId = String(userId);
            if (read !== undefined) updateData.read = Boolean(read);

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
            const userId = req.user ? req.user.id : null;
            const userRole = req.user ? req.user.role : null;
            
            let where = {};
            
            // Los administradores pueden ver todas las notificaciones
            if (userRole === 'admin') {
                where = {};
            } 
            // Todos los demás usuarios (owner, tenant, airbnb_guest, security) solo ven sus propias notificaciones
            // Las notificaciones ya están creadas para el usuario correcto según el contexto
            // (ej: reportes de daño notifican al assignedUserId del apartamento, pagos notifican al userId del pago, etc.)
            else {
                where = { userId: String(userId) };
            }
            
            const notifications = await prismaService.getNotifications({
                where: where,
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

    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user ? req.user.id : null;
            const userRole = req.user ? req.user.role : null;
            
            const notification = await prismaService.getNotificationById(id);
            if (!notification) {
                return res.status(404).json({ success: false, error: 'Notificación no encontrada' });
            }
            
            // Verificar que el usuario solo puede marcar sus propias notificaciones como leídas (excepto admin)
            if (userRole !== 'admin' && notification.userId !== String(userId)) {
                return res.status(403).json({ success: false, error: 'No tienes permiso para marcar esta notificación como leída' });
            }
            
            const updated = await prismaService.updateNotification(id, { read: true });
            res.json({
                success: true,
                data: updated,
                message: 'Notificación marcada como leída.'
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
