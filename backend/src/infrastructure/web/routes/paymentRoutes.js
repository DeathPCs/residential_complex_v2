const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validations/validate');
const { createPaymentValidation } = require('../middleware/validations/paymentValidation');
const prismaService = require('../../database/prismaService');
const PaymentController = require('../controllers/PaymentController');

const paymentController = new PaymentController();

router.get('/', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
    try {
        await paymentController.getPayments(req, res, next);
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        next({ statusCode: 500, message: 'Error al obtener pagos', details: error.message, stack: error.stack });
    }
});

router.post('/', auth, roleAuth(['admin']), createPaymentValidation, validate, async (req, res, next) => {
    try {
        await paymentController.createPayment(req, res, next);
    } catch (error) {
        console.error('Error al crear pago:', error, { body: req.body });
        next({ statusCode: 500, message: 'Error al crear pago', details: error.message, stack: error.stack, body: req.body });
    }
});

router.put('/:id/pay', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const payment = await prismaService.updatePayment(id, {
            status: 'paid',
            paidDate: new Date()
        });

        // Fetch the updated payment with user and apartment relations
        const paymentWithRelations = await prismaService.getPaymentById(payment.id);

        res.json({
            success: true,
            data: paymentWithRelations,
            message: 'Pago registrado como realizado.'
        });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        await paymentController.updatePayment(req, res, next);
    } catch (error) {
        console.error('Error al actualizar pago:', error, { params: req.params, body: req.body });
        next({ statusCode: 500, message: 'Error al actualizar pago', details: error.message, stack: error.stack, params: req.params, body: req.body });
    }
});

router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        await paymentController.deletePayment(req, res, next);
    } catch (error) {
        console.error('Error al eliminar pago:', error, { params: req.params });
        next({ statusCode: 500, message: 'Error al eliminar pago', details: error.message, stack: error.stack, params: req.params });
    }
});

module.exports = router;
