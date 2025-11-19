const prisma = require('../../infrastructure/database/prismaClient');

class UserRepository {
    async findByEmail(email) {
        if (!email) return null;
        return await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
    }

    async findById(id) {
        if (!id) return null;
        return await prisma.user.findUnique({
            where: { id: String(id) }
        });
    }

    async create(userObj) {
        return await prisma.user.create({
            data: {
                name: userObj.name,
                email: userObj.email.toLowerCase(),
                cedula: userObj.cedula,
                phone: userObj.phone || null,
                role: userObj.role || 'tenant',
                password: userObj.password,
                status: userObj.status || 'pending'
            }
        });
    }

    async getAll() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                cedula: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async update(id, data) {
        return await prisma.user.update({
            where: { id: String(id) },
            data
        });
    }

    async delete(id) {
        return await prisma.user.delete({
            where: { id: String(id) }
        });
    }
}

module.exports = UserRepository;