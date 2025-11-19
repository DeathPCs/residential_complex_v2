class User {
    constructor({ id, name, email, cedula, phone, role, password, isActive = true, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.cedula = cedula;
        this.phone = phone;
        this.role = role; // admin, owner, tenant, airbnb_guest, security
        this.password = password;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    isAdmin() { return this.role === 'admin'; }
    isOwner() { return this.role === 'owner'; }
    isTenant() { return this.role === 'tenant'; }
    isAirbnbGuest() { return this.role === 'airbnb_guest'; }
}

module.exports = User;
