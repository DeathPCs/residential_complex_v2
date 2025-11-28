const express = require('express');
const { check, param, query, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const prismaService = require('../../database/prismaService');
const AuthService = require('../../../domain/services/AuthService');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios con paginación y filtros
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Filtrar por email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de usuarios por página
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       cedula:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 */

// GET /api/users?email=...&page=...&limit=...
router.get('/', auth, roleAuth(['admin']), [
    query('email').optional().isEmail().withMessage('Email inválido'),
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser entero positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next({ statusCode: 400, message: 'Validación fallida', errors: errors.array(), params: req.query });
    }
    try {
        const { email, page = 1, limit = 10 } = req.query;
        const where = {};
        if (email) where.email = email;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            prismaService.getUsers({
                skip,
                take: parseInt(limit),
                where,
                select: { id: true, name: true, email: true, cedula: true, phone: true, role: true }
            }),
            prismaService.countUsers(where)
        ]);
        res.json({ success: true, data: users, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('Error Prisma:', error, { params: req.query });
        next({ statusCode: 500, message: 'Error al obtener usuarios', details: error.message, stack: error.stack, params: req.query });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               cedula:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 20
 *                 description: Número de cédula
 *               phone:
 *                 type: string
 *                 minLength: 7
 *                 maxLength: 15
 *                 description: Número de teléfono
 *               role:
 *                 type: string
 *                 description: Rol del usuario
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *                   description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */

// PUT /api/users/:id
router.put('/:id', auth, roleAuth(['admin']), [
    param('id').isString().withMessage('ID inválido'),
    check('name').optional().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    check('email').optional().isEmail().withMessage('Debe ser un email válido'),
    check('cedula').optional().isLength({ min: 5, max: 20 }).withMessage('La cédula debe tener entre 5 y 20 caracteres'),
    check('phone').optional().isLength({ min: 7, max: 15 }).withMessage('El teléfono debe tener entre 7 y 15 caracteres'),
    check('role').optional().isString().withMessage('Rol inválido')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next({ statusCode: 400, message: 'Validación fallida', errors: errors.array(), params: { id: req.params.id, body: req.body } });
    }
    try {
        const { id } = req.params;
        const user = await prismaService.getUserById(id);
        if (!user) return next({ statusCode: 404, message: 'Usuario no encontrado', params: { id } });
        const updated = await prismaService.updateUser(id, req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error Prisma:', error, { id: req.params.id, body: req.body });
        next({ statusCode: 500, message: 'Error al actualizar usuario', details: error.message, stack: error.stack, params: { id: req.params.id, body: req.body } });
    }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - cedula
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               cedula:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 20
 *                 description: Número de cédula
 *               phone:
 *                 type: string
 *                 minLength: 7
 *                 maxLength: 15
 *                 description: Número de teléfono
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del usuario
 *               role:
 *                 type: string
 *                 description: Rol del usuario
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   type: object
 *                   description: Usuario creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 */

// POST /api/users
router.post('/', auth, roleAuth(['admin']), [
    check('name').isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    check('email').isEmail().withMessage('Debe ser un email válido'),
    check('cedula').isLength({ min: 5, max: 20 }).withMessage('La cédula debe tener entre 5 y 20 caracteres'),
    check('phone').optional().isLength({ min: 7, max: 15 }).withMessage('El teléfono debe tener entre 7 y 15 caracteres'),
    check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    check('role').isString().withMessage('Rol inválido')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next({ statusCode: 400, message: 'Validación fallida', errors: errors.array(), params: req.body });
    }
    try {
        const authService = new AuthService();
        const { name, email, cedula, phone, password, role } = req.body;

        const result = await authService.register({ name, email, cedula, phone, password, role });

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: result.user
        });
    } catch (error) {
        console.error('Error Prisma:', error, { body: req.body });
        next({ statusCode: 500, message: 'Error al crear usuario', details: error.message, stack: error.stack, params: req.body });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */

// DELETE /api/users/:id
router.delete('/:id', auth, roleAuth(['admin']), [
    param('id').isString().withMessage('ID inválido')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next({ statusCode: 400, message: 'Validación fallida', errors: errors.array(), params: { id: req.params.id } });
    }
    try {
        const { id } = req.params;
        const user = await prismaService.getUserById(id);
        if (!user) return next({ statusCode: 404, message: 'Usuario no encontrado', params: { id } });
        await prismaService.deleteUser(id);
        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        console.error('Error Prisma:', error, { id: req.params.id });
        next({ statusCode: 500, message: 'Error al eliminar usuario', details: error.message, stack: error.stack, params: { id: req.params.id } });
    }
});

module.exports = router;
