const { check } = require('express-validator');

const createPaymentValidation = [
    check('userId')
        .notEmpty().withMessage('El ID del usuario es requerido')
        .isString().withMessage('El ID del usuario debe ser una cadena'),

    check('apartmentId')
        .optional()
        .isString().withMessage('El ID del apartamento debe ser una cadena'),

    check('amount')
        .notEmpty().withMessage('El monto es requerido')
        .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),

    check('dueDate')
        .notEmpty().withMessage('La fecha de vencimiento es requerida')
        .isISO8601().withMessage('La fecha de vencimiento debe ser una fecha válida'),

    check('paidDate')
        .optional()
        .isISO8601().withMessage('La fecha de pago debe ser una fecha válida'),

    check('concept')
        .optional()
        .isLength({ max: 255 }).withMessage('El concepto no puede exceder 255 caracteres')
];

const updatePaymentValidation = [
    check('userId')
        .optional()
        .isString().withMessage('El ID del usuario debe ser una cadena'),

    check('apartmentId')
        .optional()
        .isString().withMessage('El ID del apartamento debe ser una cadena'),

    check('amount')
        .optional()
        .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),

    check('dueDate')
        .optional()
        .isISO8601().withMessage('La fecha de vencimiento debe ser una fecha válida'),

    check('paidDate')
        .optional()
        .isISO8601().withMessage('La fecha de pago debe ser una fecha válida'),

    check('concept')
        .optional()
        .isLength({ max: 255 }).withMessage('El concepto no puede exceder 255 caracteres')
];

module.exports = {
    createPaymentValidation,
    updatePaymentValidation
};
