class Notification {
    constructor({ id, title, message, type, recipientType, recipientId, apartmentId, isRead = false, createdAt, updatedAt }) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type; // general, maintenance, payment, airbnb_checkin, damage_report
        this.recipientType = recipientType; // all, owners, tenants, specific_user
        this.recipientId = recipientId;
        this.apartmentId = apartmentId;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    markAsRead() {
        this.isRead = true;
        this.updatedAt = new Date();
    }
}

module.exports = Notification;
