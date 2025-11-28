const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const prismaService = require('../../database/prismaService');

router.get('/', auth, roleAuth(['admin', 'owner', 'tenant', 'airbnb_guest']), async (req, res, next) => {
    try {
        const options = { include: { owner: true, assignedUser: true } };
        const userRole = req.user.role;
        const userId = req.user.id;
        
        // Filtrar según el rol del usuario
        if (userRole === 'admin') {
            // Admin ve todos los apartamentos
            // No se aplica filtro
        } else if (userRole === 'owner') {
            // Owner ve solo apartamentos donde es el assignedUserId con assignedRole = 'owner'
            options.where = { assignedUserId: userId, assignedRole: 'owner' };
        } else if (userRole === 'tenant') {
            // Tenant ve solo apartamentos donde es el assignedUserId con assignedRole = 'tenant'
            options.where = { assignedUserId: userId, assignedRole: 'tenant' };
        } else if (userRole === 'airbnb_guest') {
            // Airbnb Guest ve apartamentos relacionados con sus registros de Airbnb
            // Primero obtener los apartamentos de sus registros
            const airbnbGuests = await prismaService.getAirbnbGuests({
                where: {
                    guestCedula: req.user.cedula
                },
                include: { apartment: true }
            });
            const apartmentIds = airbnbGuests
                .map(guest => guest.apartmentId)
                .filter(id => id !== null);
            
            if (apartmentIds.length > 0) {
                options.where = { id: { in: apartmentIds } };
            } else {
                // Si no tiene registros, retornar array vacío
                options.where = { id: { in: [] } };
            }
        }
        
        const apartments = await prismaService.getApartments(options);
        res.json({ success: true, data: apartments });
    } catch (error) {
        console.error('Error al obtener apartamentos:', error);
        next({ statusCode: 500, message: 'Error al obtener apartamentos', details: error.message, stack: error.stack });
    }
});

/**
 * @swagger
 * /api/apartments:
 *   post:
 *     summary: Crear un nuevo apartamento
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - tower
 *               - floor
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número del apartamento
 *               tower:
 *                 type: string
 *                 description: Torre del apartamento
 *               floor:
 *                 type: integer
 *                 description: Piso del apartamento
 *               status:
 *                 type: string
 *                 enum: [vacant, owner_occupied, rented, airbnb]
 *                 default: vacant
 *                 description: Estado del apartamento
 *               type:
 *                 type: string
 *                 description: Tipo de apartamento
 *               assignedUserId:
 *                 type: string
 *                 description: ID del usuario asignado
 *               assignedRole:
 *                 type: string
 *                 enum: [owner, tenant]
 *                 description: Rol del usuario asignado
 *     responses:
 *       201:
 *         description: Apartamento creado exitosamente
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
 *                   description: Apartamento creado
 *                 message:
 *                   type: string
 *                   example: "Apartamento registrado exitosamente"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 */

router.post('/', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        const { number, tower, floor, status, type, assignedUserId, assignedRole } = req.body;
        const newApartment = await prismaService.createApartment({
            number,
            tower,
            floor: parseInt(floor),
            status: status || 'vacant',
            type,
            ownerId: req.user.id,
            assignedUserId,
            assignedRole
        });
        
        // Notificar al usuario asignado si existe
        if (assignedUserId) {
            try {
                const statusText = status === 'owner_occupied' ? 'Ocupado por propietario' : 
                                  status === 'rented' ? 'Arrendado' : 
                                  status === 'airbnb' ? 'Airbnb' : 'Vacante';
                const roleText = assignedRole === 'owner' ? 'propietario' : 
                                assignedRole === 'tenant' ? 'inquilino' : 'usuario';
                
                await prismaService.createNotification({
                    userId: String(assignedUserId),
                    message: `Apartamento asignado: Se te ha asignado el apartamento ${number} (Torre ${tower}, Piso ${floor}). Estado: ${statusText}. Rol: ${roleText}.`,
                    type: 'apartment_assignment',
                    read: false
                });
            } catch (notificationError) {
                console.error('Error creando notificación para apartamento:', notificationError);
                // Continuar sin fallar la creación del apartamento
            }
        }
        
        res.status(201).json({
            success: true,
            data: newApartment,
            message: 'Apartamento registrado exitosamente'
        });
    } catch (error) {
        console.error('Error al registrar apartamento:', error, { body: req.body });
        next({ statusCode: 500, message: 'Error al registrar apartamento', details: error.message, stack: error.stack, body: req.body });
    }
});

/**
 * @swagger
 * /api/apartments/{id}:
 *   put:
 *     summary: Actualizar un apartamento por ID
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del apartamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número del apartamento
 *               tower:
 *                 type: string
 *                 description: Torre del apartamento
 *               floor:
 *                 type: integer
 *                 description: Piso del apartamento
 *               status:
 *                 type: string
 *                 enum: [vacant, owner_occupied, rented, airbnb]
 *                 description: Estado del apartamento
 *               type:
 *                 type: string
 *                 description: Tipo de apartamento
 *               assignedUserId:
 *                 type: string
 *                 description: ID del usuario asignado
 *               assignedRole:
 *                 type: string
 *                 enum: [owner, tenant]
 *                 description: Rol del usuario asignado
 *     responses:
 *       200:
 *         description: Apartamento actualizado exitosamente
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
 *                   description: Apartamento actualizado
 *                 message:
 *                   type: string
 *                   example: "Apartamento actualizado exitosamente"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Apartamento no encontrado
 */

router.put('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { number, tower, floor, status, type, assignedUserId, assignedRole } = req.body;

        const apartment = await prismaService.getApartmentById(id);
        if (!apartment) return res.status(404).json({ success: false, error: 'Apartamento no encontrado' });

        const previousAssignedUserId = apartment.assignedUserId;
        const previousStatus = apartment.status;

        const updatedApartment = await prismaService.updateApartment(id, {
            number,
            tower,
            floor: parseInt(floor),
            status,
            type,
            assignedUserId,
            assignedRole
        });

        // Notificar si cambió el usuario asignado
        if (assignedUserId && assignedUserId !== previousAssignedUserId) {
            try {
                const statusText = status === 'owner_occupied' ? 'Ocupado por propietario' : 
                                  status === 'rented' ? 'Arrendado' : 
                                  status === 'airbnb' ? 'Airbnb' : 'Vacante';
                const roleText = assignedRole === 'owner' ? 'propietario' : 
                                assignedRole === 'tenant' ? 'inquilino' : 'usuario';
                
                await prismaService.createNotification({
                    userId: String(assignedUserId),
                    message: `Apartamento asignado: Se te ha asignado el apartamento ${number || apartment.number} (Torre ${tower || apartment.tower}, Piso ${floor || apartment.floor}). Estado: ${statusText}. Rol: ${roleText}.`,
                    type: 'apartment_assignment',
                    read: false
                });
            } catch (notificationError) {
                console.error('Error creando notificación para asignación de apartamento:', notificationError);
            }
        }
        
        // Notificar si cambió el estado del apartamento y hay un usuario asignado
        if (status && status !== previousStatus && assignedUserId) {
            try {
                const statusText = status === 'owner_occupied' ? 'Ocupado por propietario' : 
                                  status === 'rented' ? 'Arrendado' : 
                                  status === 'airbnb' ? 'Airbnb' : 'Vacante';
                const previousStatusText = previousStatus === 'owner_occupied' ? 'Ocupado por propietario' : 
                                          previousStatus === 'rented' ? 'Arrendado' : 
                                          previousStatus === 'airbnb' ? 'Airbnb' : 'Vacante';
                
                await prismaService.createNotification({
                    userId: String(assignedUserId),
                    message: `Cambio de estado en apartamento: El apartamento ${number || apartment.number} (Torre ${tower || apartment.tower}) cambió de estado de "${previousStatusText}" a "${statusText}".`,
                    type: 'apartment_update',
                    read: false
                });
            } catch (notificationError) {
                console.error('Error creando notificación para cambio de estado:', notificationError);
            }
        }

        res.json({
            success: true,
            data: updatedApartment,
            message: 'Apartamento actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar apartamento:', error, { id: req.params.id, body: req.body });
        next({ statusCode: 500, message: 'Error al actualizar apartamento', details: error.message, stack: error.stack, params: { id: req.params.id, body: req.body } });
    }
});

/**
 * @swagger
 * /api/apartments/{id}:
 *   delete:
 *     summary: Eliminar un apartamento por ID
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del apartamento a eliminar
 *     responses:
 *       200:
 *         description: Apartamento eliminado exitosamente
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
 *                   example: "Apartamento eliminado exitosamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Apartamento no encontrado
 */

router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
    try {
        const { id } = req.params;

        const apartment = await prismaService.getApartmentById(id);
        if (!apartment) return res.status(404).json({ success: false, error: 'Apartamento no encontrado' });

        await prismaService.deleteApartment(id);

        res.json({
            success: true,
            message: 'Apartamento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar apartamento:', error, { id: req.params.id });
        next({ statusCode: 500, message: 'Error al eliminar apartamento', details: error.message, stack: error.stack, params: { id: req.params.id } });
    }
});

module.exports = router;
