const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuthController = require('../controllers/AuthController');
const { registerValidation, loginValidation } = require('../middleware/validations/authValidation');
const validate = require('../middleware/validations/validate');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - cedula
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *               cedula:
 *                 type: string
 *                 description: Número de cédula
 *               phone:
 *                 type: string
 *                 description: Número de teléfono (opcional)
 *               role:
 *                 type: string
 *                 enum: [admin, owner, tenant, airbnb_guest, security]
 *                 description: Rol del usuario (opcional, por defecto tenant)
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El email ya está registrado
 */

const authController = new AuthController();

router.post('/register', registerValidation, validate, authController.register.bind(authController));
router.post('/login', loginValidation, validate, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }

        const result = await authController.authService.login({ email, password });

        res.json({
            success: true,
            data: result,
            message: 'Login exitoso'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Información del usuario autenticado
 *                 message:
 *                   type: string
 *                   example: "Usuario autenticado"
 *       401:
 *         description: No autorizado - Token inválido o expirado
 */

router.get('/me', auth, async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: req.user,
            message: 'Usuario autenticado'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
