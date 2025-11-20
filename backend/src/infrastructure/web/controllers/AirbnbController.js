const prismaService = require('../../database/prismaService');

class AirbnbController {
    async registerGuest(req, res, next) {
        try {
            const { apartmentId, guestName, guestCedula, numberOfGuests, checkInDate, checkOutDate } = req.body;
            const newGuest = await prismaService.createAirbnbGuest({
                apartmentId: apartmentId || null,
                guestName,
                guestCedula,
                numberOfGuests,
                checkInDate: new Date(checkInDate),
                checkOutDate: new Date(checkOutDate),
                status: 'pending'
            });
            
            // Notificar al propietario del apartamento si existe
            if (apartmentId) {
                const apartment = await prismaService.getApartmentById(apartmentId);
                if (apartment && apartment.assignedUserId) {
                    try {
                        await prismaService.createNotification({
                            userId: String(apartment.assignedUserId),
                            message: `Nuevo huésped Airbnb registrado: ${guestName} (${guestCedula}) para el apartamento ${apartment.number}. Ingreso: ${new Date(checkInDate).toLocaleDateString('es-ES')}, Salida: ${new Date(checkOutDate).toLocaleDateString('es-ES')}.`,
                            type: 'airbnb_registration',
                            read: false
                        });
                    } catch (notificationError) {
                        console.error('Error creando notificación:', notificationError);
                        // Continuar sin fallar el registro del huésped
                    }
                }
            }
            
            res.status(201).json({
                success: true,
                data: newGuest,
                message: 'Huésped Airbnb registrado exitosamente. Sistema notificó automáticamente.'
            });
        } catch (error) {
            next(error);
        }
    }

    async checkInGuest(req, res, next) {
        try {
            const { id } = req.params;
            const guest = await prismaService.getAirbnbGuestById(id);
            if (!guest) return res.status(404).json({ success: false, error: 'Huésped no encontrado' });

            const updatedGuest = await prismaService.updateAirbnbGuest(id, {
                status: 'checked_in'
            });

            // Notificar al propietario del apartamento
            if (guest.apartmentId) {
                const apartment = await prismaService.getApartmentById(guest.apartmentId);
                if (apartment && apartment.assignedUserId) {
                    try {
                        await prismaService.createNotification({
                            userId: String(apartment.assignedUserId),
                            message: `Ingreso de huésped Airbnb realizado: El huésped ${guest.guestName} ha realizado el ingreso en el apartamento ${apartment.number}.`,
                            type: 'airbnb_checkin',
                            read: false
                        });
                    } catch (notificationError) {
                        console.error('Error creando notificación:', notificationError);
                        // Continuar sin fallar el ingreso
                    }
                }
            }

            res.json({
                success: true,
                data: updatedGuest,
                message: 'Check-in realizado por portería. Notificación enviada si aplica.'
            });
        } catch (error) {
            next(error);
        }
    }

    async checkOutGuest(req, res, next) {
        try {
            const { id } = req.params;
            const guest = await prismaService.getAirbnbGuestById(id);
            if (!guest) return res.status(404).json({ success: false, error: 'Huésped no encontrado' });
            
            const updatedGuest = await prismaService.updateAirbnbGuest(id, {
                status: 'checked_out'
            });
            
            res.json({
                success: true,
                data: updatedGuest,
                message: 'Check-out realizado por portería. Notificación automática enviada.'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteGuest(req, res, next) {
        try {
            const { id } = req.params;
            const guest = await prismaService.getAirbnbGuestById(id);
            if (!guest) return res.status(404).json({ success: false, error: 'Huésped no encontrado' });
            
            await prismaService.deleteAirbnbGuest(id);
            res.json({ success: true, message: 'Huésped eliminado correctamente.' });
        } catch (error) {
            next(error);
        }
    }

    async getActiveGuests(req, res, next) {
        try {
            const now = new Date();
            const activeGuests = await prismaService.getAirbnbGuests({
                where: {
                    status: 'checked_in',
                    checkInDate: { lte: now },
                    checkOutDate: { gt: now }
                },
                include: {
                    apartment: true
                }
            });
            res.json({
                success: true,
                data: activeGuests,
                message: 'Huéspedes activos para control de seguridad.'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllGuests(req, res, next) {
        try {
            const options = {
                include: {
                    apartment: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            };
            
            const userRole = req.user.role;
            const userId = req.user.id;
            
            // Filtrar según el rol del usuario
            if (userRole === 'admin') {
                // Admin ve todos los huéspedes
                // No se aplica filtro
            } else if (userRole === 'owner') {
                // Owner ve huéspedes de apartamentos donde es el assignedUserId con assignedRole = 'owner'
                options.where = {
                    apartment: {
                        assignedUserId: userId,
                        assignedRole: 'owner'
                    }
                };
            } else if (userRole === 'airbnb_guest') {
                // Airbnb Guest ve solo sus propios registros (por cédula)
                options.where = {
                    guestCedula: req.user.cedula
                };
            }
            
            const guests = await prismaService.getAirbnbGuests(options);
            res.json({
                success: true,
                data: guests,
                message: 'Lista completa de huéspedes Airbnb.'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AirbnbController;
