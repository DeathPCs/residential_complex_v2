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
                const priorityText = priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja';
                const message = `Nuevo mantenimiento programado: ${title}. Área: ${area || 'General'}. Prioridad: ${priorityText}. Fecha: ${scheduledDate ? new Date(scheduledDate).toLocaleDateString('es-ES') : 'Por definir'}.`;
                
                // Obtener todos los usuarios activos (residentes, propietarios, inquilinos) para crear notificaciones individuales
                const users = await prismaService.getUsers({ 
                    where: { 
                        status: { in: ['active', 'approved'] },
                        role: { in: ['owner', 'tenant', 'resident'] }
                    }, 
                    take: 1000 
                });
                
                // Crear una notificación para cada usuario
                const notificationPromises = users.map(user => 
                    prismaService.createNotification({
                        userId: String(user.id),
                        message: message,
                        type: 'maintenance',
                        read: false
                    }).catch(err => {
                        console.error(`Error creando notificación para usuario ${user.id}:`, err);
                        return null; // Continuar aunque falle una notificación
                    })
                );
                
                await Promise.all(notificationPromises);
            } catch (notificationError) {
                console.error('Error creando notificaciones para mantenimiento:', notificationError);
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
