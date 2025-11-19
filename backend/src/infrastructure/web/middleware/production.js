const compression = require('compression');
const rateLimit = require('express-rate-limit');

const productionMiddleware = (app) => {
    // Compresión GZIP
    app.use(compression());

    // Rate Limiting más estricto en producción
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100 // límite por IP
    });
    app.use('/api/', limiter);

    // Configuraciones de seguridad
    app.set('trust proxy', 1); // Confiar en el primer proxy
    app.disable('x-powered-by'); // Ocultar que usamos Express
    
    // Caché para respuestas estáticas
    const cacheTime = 86400000; // 1 día
    app.use(express.static('public', {
        maxAge: cacheTime
    }));

    // Headers de seguridad adicionales
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
};

module.exports = productionMiddleware;