// Estados de mantenimiento según el documento
const MAINTENANCE_STATUS = {
    PENDING: 'pending',        // Pendiente
    IN_PROGRESS: 'in_progress', // En proceso  
    COMPLETED: 'completed'      // Finalizado
};

// Áreas de mantenimiento mencionadas en el documento
const MAINTENANCE_AREAS = {
    PARK: 'parque',
    POOL: 'piscina', 
    ELEVATOR: 'ascensor',
    COMMON_AREAS: 'zonas_comunes'
};

module.exports = { MAINTENANCE_STATUS, MAINTENANCE_AREAS };
