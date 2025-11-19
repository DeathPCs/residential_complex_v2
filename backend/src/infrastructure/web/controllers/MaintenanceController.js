const prismaService = require('../../database/prismaService');

class MaintenanceController {
    async createMaintenance(req, res, next) {
        try {
            const { title, description, area, priority, scheduledDate } = req.body;
            const newMaintenance = await prismaService.createMaintenance({
                title,
                description,
                area,
                status: 'pending',
                priority: priority || 'medium',
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null
            });

            // Crear notificación automática para todos los residentes
            try {
                await prismaService.createNotification({
                    title: 'Nuevo mantenimiento programado',
                    message: `Se ha programado un mantenimiento: ${title}. Área: ${area || 'General'}. Prioridad: ${priority || 'medium'}. Fecha: ${scheduledDate ? new Date(scheduledDate).toLocaleDateString() : 'Por definir'}.`,
                    type: 'maintenance',
                    recipientType: 'all'
                });
            } catch (notificationError) {
                console.error('Error creando notificación para mantenimiento:', notificationError);
                // No fallar la creación del mantenimiento por error en notificación
            }

            res.status(201).json({
                success: true,
                data: newMaintenance,
                message: 'Mantenimiento programado. Todos los residentes notificados.'
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const maintenance = await prismaService.getMaintenanceById(id);
            if (!maintenance) return res.status(404).json({ success: false, error: 'Mantenimiento no encontrado' });

            const updateData = { status };
            if (status === 'completed') {
                updateData.completedDate = new Date();
            }

            const updated = await prismaService.updateMaintenance(id, updateData);
            res.json({
                success: true,
                data: { id, status, updatedAt: updated.updatedAt },
                message: `Estado actualizado a: ${status}`
            });
        } catch (error) {
            next(error);
        }
    }

    async getMaintenances(req, res, next) {
        try {
            const maintenances = await prismaService.getMaintenances();
            res.json({ success: true, data: maintenances });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MaintenanceController;
