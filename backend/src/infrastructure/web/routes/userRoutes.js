const express = require('express');
const { check, param, query, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const prismaService = require('../../database/prismaService');
const AuthService = require('../../../domain/services/AuthService');

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
