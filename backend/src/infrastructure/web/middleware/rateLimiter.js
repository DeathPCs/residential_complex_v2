const rateLimit = require('express-rate-limit');

// Configuración para test: más permisiva
const isTestEnvironment = process.env.NODE_ENV === 'test';

const authLimiter = rateLimit({
    windowMs: isTestEnvironment ? 1000 : 15 * 60 * 1000, // 1 segundo en test, 15 minutos en producción
    max: isTestEnvironment ? 1000 : 5, // 1000 en test, 5 en producción
    message: {
        success: false,
        error: 'Demasiados intentos de autenticación. Por favor, intente más tarde.',
        statusCode: 429
    },
    skip: isTestEnvironment ? () => true : undefined // Skip rate limiting en tests
});

const apiLimiter = rateLimit({
    windowMs: isTestEnvironment ? 1000 : 15 * 60 * 1000, // 1 segundo en test, 15 minutos en producción
    max: isTestEnvironment ? 10000 : 100, // 10000 en test, 100 en producción
    skip: isTestEnvironment ? () => true : undefined // Skip rate limiting en tests
});

module.exports = {
    authLimiter,
    apiLimiter
};