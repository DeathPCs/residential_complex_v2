// src/infrastructure/web/controllers/AuthController.js
const AuthService = require('../../../domain/services/AuthService');

class AuthController {
    constructor(authService) {
        // inyectar service (si no se pasa, el service crea el repo por defecto)
        this.authService = authService || new AuthService();

        // Bind para usar como callback (si hace falta)
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }

    // POST /api/auth/register
    async register(req, res, next) {
        try {
            const { name, email, cedula, phone, password, role } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Faltan campos obligatorios: name, email, password'
                });
            }

            const result = await this.authService.register({ name, email, cedula, phone, password, role });

            return res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    token: result.token,
                    user: result.user
                }
            });
        } catch (err) {
            // si service coloca status, úsalo
            const status = err.status || 500;
            return next(err); // dejar que errorHandler maneje la respuesta
        }
    }

    // POST /api/auth/login
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email y contraseña son obligatorios'
                });
            }

            const result = await this.authService.login({ email, password });

            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token: result.token,
                    user: result.user
                }
            });
        } catch (err) {
            return next(err);
        }
    }

    // GET /api/auth/profile
    async getProfile(req, res, next) {
        try {
            // middleware/auth.js debe haber agregado req.user con {id, email, role}
            const requester = req.user;
            if (!requester || !requester.id) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }

            const user = await this.authService.getUserById(requester.id);
            if (!user) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }

            return res.json({ success: true, data: user });
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = AuthController;
