// Estados de apartamento según el documento
const APARTMENT_STATUS = {
    OWNER_OCCUPIED: 'owner_occupied',    // Propietario reside directamente
    RENTED: 'rented',                    // Arriendo normal
    AIRBNB: 'airbnb',                    // Modo Airbnb
    VACANT: 'vacant'                     // Vacío
};

module.exports = { APARTMENT_STATUS };
