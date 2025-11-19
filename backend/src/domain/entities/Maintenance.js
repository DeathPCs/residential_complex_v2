class Maintenance {
    constructor({ id, title, description, area, status, priority, scheduledDate, completedDate, createdAt, updatedAt }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.area = area; // pool, gym, elevator, common_area, gardens
        this.status = status; // pending, in_progress, completed
        this.priority = priority;
        this.scheduledDate = scheduledDate;
        this.completedDate = completedDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    isPending() { return this.status === 'pending'; }
    isInProgress() { return this.status === 'in_progress'; }
    isCompleted() { return this.status === 'completed'; }
}

module.exports = Maintenance;
