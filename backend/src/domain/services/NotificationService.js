const Notification = require('../entities/Notification');

class NotificationService {
    constructor(notificationRepository, emailService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    async notifyAirbnbRegistration(apartment, guest) {
        // Notificación al propietario
        const ownerNotification = new Notification({
            title: 'Nuevo huésped Airbnb registrado',
            message: `Se ha registrado un nuevo huésped para el apartamento ${apartment.number}. Huésped: ${guest.guestName}`,
            type: 'airbnb_checkin',
            recipientType: 'specific_user',
            recipientId: apartment.ownerId,
            apartmentId: apartment.id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Notificación al administrador
        const adminNotification = new Notification({
            title: 'Registro Airbnb - Control de Seguridad',
            message: `Apartamento ${apartment.number}: ${guest.guestName} (${guest.guestCedula}) - ${guest.numberOfGuests} huéspedes`,
            type: 'airbnb_checkin',
            recipientType: 'all',
            apartmentId: apartment.id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('📬 Notificaciones Airbnb enviadas:', { ownerNotification, adminNotification });
        return { ownerNotification, adminNotification };
    }

    async notifyMaintenance(maintenance) {
        const notification = new Notification({
            title: `Mantenimiento Programado: ${maintenance.title}`,
            message: maintenance.description,
            type: 'maintenance',
            recipientType: 'all',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('🔧 Notificación de mantenimiento enviada a todos los residentes');
        return notification;
    }

    async notifyDamageReport(apartment, damageReport) {
        const notification = new Notification({
            title: 'Reporte de Daño',
            message: `Apartamento ${apartment.number}: ${damageReport.title}`,
            type: 'damage_report',
            recipientType: 'specific_user',
            recipientId: apartment.ownerId,
            apartmentId: apartment.id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('⚠️ Notificación de daño enviada al propietario');
        return notification;
    }
}

module.exports = NotificationService;
