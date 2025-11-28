require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 3001;

let server;

const startServer = async () => {
    try {
        server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📋 Health check: http://localhost:${PORT}/health`);
            console.log(`🏢 Sistema Conjuntos Residenciales API`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('✅ HTTP server closed');

            // Close database connections
            try {
                const prisma = require('./src/infrastructure/database/prismaClient');
                await prisma.$disconnect();
                console.log('✅ Database connections closed');
            } catch (error) {
                console.error('❌ Error closing database connections:', error);
            }

            console.log('👋 Server shut down completely');
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('❌ Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

startServer();
