class DamageReport {
    constructor({ id, apartmentId, reportedBy, title, description, priority, status, images, createdAt, updatedAt }) {
        this.id = id;
        this.apartmentId = apartmentId;
        this.reportedBy = reportedBy;
        this.title = title;
        this.description = description;
        this.priority = priority; // low, medium, high, urgent
        this.status = status; // reported, acknowledged, in_progress, resolved
        this.images = images || [];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    addImage(imageUrl) {
        this.images.push(imageUrl);
    }
}

module.exports = DamageReport;
