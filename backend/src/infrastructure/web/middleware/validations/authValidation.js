const { check } = require('express-validator');
const roles = require('../../../../shared/constants/roles');

const registerValidation = [
    check('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    check('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    check('password')
        .trim()
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula'),
    
    check('cedula')
        .trim()
        .notEmpty().withMessage('La cédula es requerida')
        .isLength({ min: 8, max: 11 }).withMessage('La cédula debe tener entre 8 y 11 caracteres'),
    
    check('phone')
        .trim()
        .optional()
        .matches(/^[0-9+\-\s()]*$/).withMessage('Formato de teléfono inválido'),
    
    check('role')
        .optional()
        .isIn(Object.values(roles)).withMessage('Rol inválido')
];

const loginValidation = [
    check('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    check('password')
        .trim()
        .notEmpty().withMessage('La contraseña es requerida')
];

module.exports = {
    registerValidation,
    loginValidation
};