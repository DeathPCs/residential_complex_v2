const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../../../config/environment');
const CustomError = require('../../shared/errors/CustomError');
const User = require('../entities/User');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository || new UserRepository();
    }

    async register({ name, email, cedula, phone, password, role = 'tenant' }) {
        // Validar que el email no exista
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new CustomError('El email ya está registrado', 400);
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, parseInt(BCRYPT_ROUNDS));

        // Crear usuario
        const user = await this.userRepository.create({
            name,
            email,
            cedula,
            phone,
            role,
            password: hashedPassword,
            status: 'active'
        });

        // Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // No devolver el password en la respuesta
        const { password: _, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword
        };
    }

    async login({ email, password }) {
        // Buscar usuario por email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new CustomError('Credenciales inválidas', 401);
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new CustomError('Credenciales inválidas', 401);
        }

        // Verificar si el usuario está activo
        if (user.status === 'inactive') {
            throw new CustomError('Usuario desactivado', 403);
        }

        // Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // No devolver el password en la respuesta
        const { password: _, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword
        };
    }

    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new CustomError('Usuario no encontrado', 404);
        }
        
        // No devolver el password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

module.exports = AuthService;
