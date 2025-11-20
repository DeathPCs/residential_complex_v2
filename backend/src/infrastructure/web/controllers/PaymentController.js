const prismaService = require('../../database/prismaService');

class PaymentController {
    async createPayment(req, res, next) {
        try {
            const { userId, apartmentId, amount, concept, dueDate, paidDate } = req.body;
            const newPayment = await prismaService.createPayment({
                userId: String(userId),
                apartmentId: apartmentId ? String(apartmentId) : null,
                amount: parseFloat(amount),
                concept: concept || 'Pago de administración',
                status: paidDate ? (new Date(paidDate) <= new Date(dueDate) ? 'paid' : 'overdue') : 'pending',
                dueDate: dueDate ? new Date(dueDate) : null,
                paidDate: paidDate ? new Date(paidDate) : null
            });

            // Fetch the payment with user and apartment relations
            const paymentWithRelations = await prismaService.getPaymentById(newPayment.id);

            // Notificar al usuario sobre el pago pendiente
            try {
                const status = paidDate ? (new Date(paidDate) <= new Date(dueDate) ? 'paid' : 'overdue') : 'pending';
                const title = paidDate ? (status === 'overdue' ? 'Pago registrado con mora' : 'Pago registrado') : 'Nuevo pago pendiente';
                const message = paidDate
                    ? `${title}: Se ha registrado un pago de $${paymentWithRelations.amount.toLocaleString('es-ES')} por ${paymentWithRelations.concept}. ${status === 'overdue' ? 'Pago realizado después de la fecha de vencimiento.' : ''}`
                    : `${title}: Se ha registrado un pago pendiente de $${paymentWithRelations.amount.toLocaleString('es-ES')} por ${paymentWithRelations.concept}. Fecha límite: ${new Date(dueDate).toLocaleDateString('es-ES')}.`;
                
                await prismaService.createNotification({
                    userId: String(userId),
                    message: message,
                    type: 'payment',
                    read: false
                });
            } catch (notificationError) {
                console.error('Error creando notificación para pago:', notificationError);
                // No fallar la creación del pago por error en notificación
            }

            res.status(201).json({
                success: true,
                data: paymentWithRelations,
                message: 'Pago de administración registrado.'
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePayment(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, apartmentId, amount, concept, dueDate, paidDate } = req.body;
            const payment = await prismaService.getPaymentById(id);
            if (!payment) return res.status(404).json({ success: false, error: 'Pago no encontrado' });

            const updateData = {};
            if (userId !== undefined) updateData.userId = String(userId);
            if (apartmentId !== undefined) updateData.apartmentId = apartmentId ? String(apartmentId) : null;
            if (amount !== undefined) updateData.amount = parseFloat(amount);
            if (concept !== undefined) updateData.concept = concept;
            if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
            if (paidDate !== undefined) updateData.paidDate = paidDate ? new Date(paidDate) : null;
            // Update status based on paidDate and dueDate
            if (paidDate !== undefined || dueDate !== undefined) {
                const currentDueDate = dueDate !== undefined ? new Date(dueDate) : payment.dueDate;
                const currentPaidDate = paidDate !== undefined ? (paidDate ? new Date(paidDate) : null) : payment.paidDate;
                if (currentPaidDate) {
                    updateData.status = currentPaidDate <= currentDueDate ? 'paid' : 'overdue';
                } else {
                    updateData.status = 'pending';
                }
            }

            const updated = await prismaService.updatePayment(id, updateData);
            // Fetch the updated payment with user and apartment relations
            const paymentWithRelations = await prismaService.getPaymentById(updated.id);
            res.json({
                success: true,
                data: paymentWithRelations,
                message: 'Pago actualizado correctamente.'
            });
        } catch (error) {
            next(error);
        }
    }

    async getPayments(req, res, next) {
        try {
            const userRole = req.user.role;
            const userId = req.user.id;
            
            let where = {};
            
            // Filtrar según el rol del usuario
            if (userRole === 'admin') {
                // Admin ve todos los pagos
                // No se aplica filtro
            } else if (userRole === 'owner') {
                // Owner ve pagos de apartamentos donde es el assignedUserId con assignedRole = 'owner'
                // Primero obtener los apartamentos del owner
                const apartments = await prismaService.getApartments({
                    where: { assignedUserId: userId, assignedRole: 'owner' }
                });
                const apartmentIds = apartments.map(apt => apt.id);
                
                if (apartmentIds.length > 0) {
                    where = { apartmentId: { in: apartmentIds } };
                } else {
                    // Si no tiene apartamentos, retornar array vacío
                    where = { id: { in: [] } };
                }
            } else if (userRole === 'tenant' || userRole === 'airbnb_guest') {
                // Tenant y Airbnb Guest ven solo sus propios pagos
                where = { userId: userId };
            }
            
            const payments = await prismaService.getPayments({
                where: where,
                include: { user: { include: { apartments: true, apartmentsAssigned: true } }, apartment: true },
                orderBy: { createdAt: 'desc' }
            });

            // Fix for existing paid payments without paidDate
            payments.forEach(payment => {
                if (payment.status === 'paid' && !payment.paidDate) {
                    payment.paidDate = payment.updatedAt;
                }
            });

            res.json({
                success: true,
                data: payments,
                message: 'Pagos obtenidos correctamente.'
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePayment(req, res, next) {
        try {
            const { id } = req.params;
            const payment = await prismaService.getPaymentById(id);
            if (!payment) return res.status(404).json({ success: false, error: 'Pago no encontrado' });
            await prismaService.deletePayment(id);
            res.json({ success: true, message: 'Pago eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PaymentController;
