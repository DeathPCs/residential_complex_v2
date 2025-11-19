const prismaService = require('../../database/prismaService');

class DamageReportController {
    async createReport(req, res, next) {
        try {
            const { apartmentId, title, description, priority, images } = req.body;
            const reportedBy = req.user ? req.user.id : null;

            console.log('Creating damage report with data:', {
                apartmentId,
                title,
                description,
                priority,
                reportedBy,
                images
            });

            if (!apartmentId || !reportedBy || !title) {
                return res.status(400).json({
                    success: false,
                    error: 'apartmentId, title y usuario autenticado son requeridos'
                });
            }

            // Verificar que el apartamento existe
            const apartment = await prismaService.getApartmentById(apartmentId);
            if (!apartment) {
                return res.status(400).json({
                    success: false,
                    error: 'El apartamento especificado no existe'
                });
            }

            const newReport = await prismaService.createDamageReport({
                apartmentId: String(apartmentId),
                reportedBy: String(reportedBy),
                title,
                description: description || '',
                priority: priority || 'low',
                status: 'reported',
                images: images || []
            });

            console.log('Damage report created successfully:', newReport);
            res.status(201).json({ success: true, data: newReport });
        } catch (error) {
            console.error('Error creating damage report:', error);
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const report = await prismaService.getDamageReportById(id);
            if (!report) return res.status(404).json({ success: false, error: 'Reporte no encontrado' });

            const updated = await prismaService.updateDamageReport(id, { status });
            res.json({
                success: true,
                data: { id, status, updatedAt: updated.updatedAt },
                message: `Estado actualizado a: ${status}`
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyReports(req, res, next) {
        try {
            const reportedBy = req.user ? req.user.id : null;
            const reports = await prismaService.getDamageReports({
                where: { reportedBy: String(reportedBy) },
                include: { apartment: true, reporter: true }
            });
            res.json({ success: true, data: reports });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DamageReportController;
