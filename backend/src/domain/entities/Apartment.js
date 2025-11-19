class Apartment {
    constructor({ id, number, tower, floor, ownerId, assignedUserId, assignedRole, status, type, createdAt, updatedAt }) {
        this.id = id;
        this.number = number;
        this.tower = tower;
        this.floor = floor;
        this.ownerId = ownerId;
        this.assignedUserId = assignedUserId;
        this.assignedRole = assignedRole;
        this.status = status; // owner_occupied, rented, airbnb, vacant
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    isAvailableForRent() { return this.status === 'vacant'; }
    isOccupiedByOwner() { return this.status === 'owner_occupied'; }
    isRented() { return this.status === 'rented'; }
    isAirbnb() { return this.status === 'airbnb'; }
    isAssigned() { return this.assignedUserId !== null; }
}

module.exports = Apartment;
