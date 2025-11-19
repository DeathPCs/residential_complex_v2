const express = require('express');
const router = express.Router();

router.post('/contracts', (req, res) => {
    const { apartmentId, tenantId, startDate, endDate } = req.body;
    
    res.status(201).json({
        success: true,
        data: { apartmentId, tenantId, startDate, endDate, status: 'active' },
        message: 'Contrato de arriendo registrado.'
    });
});

module.exports = router;
