class AirbnbGuest {
    constructor({ id, relationId, guestName, guestCedula, numberOfGuests, checkInDate, checkOutDate, status, createdAt, updatedAt }) {
        this.id = id;
        this.relationId = relationId;
        this.guestName = guestName;
        this.guestCedula = guestCedula;
        this.numberOfGuests = numberOfGuests;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = status; // pending, checked_in, checked_out
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    isCurrentlyStaying() {
        const now = new Date();
        return this.status === 'checked_in' && 
               this.checkInDate <= now && 
               this.checkOutDate > now;
    }
}

module.exports = AirbnbGuest;
