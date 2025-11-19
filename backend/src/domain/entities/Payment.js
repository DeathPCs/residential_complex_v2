class Payment {
    constructor({ id, apartmentId, userId, amount, dueDate, paidDate, status, description, concept, createdAt, updatedAt }) {
        this.id = id;
        this.apartmentId = apartmentId;
        this.userId = userId;
        this.amount = amount;
        this.dueDate = dueDate;
        this.paidDate = paidDate;
        this.status = status; // pending, paid, overdue
        this.description = description;
        this.concept = concept;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    isOverdue() { return this.status === 'pending' && new Date() > this.dueDate; }
    isPaid() { return this.status === 'paid'; }
}

module.exports = Payment;
