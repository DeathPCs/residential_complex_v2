const { Sequelize } = require('sequelize');
const env = require('../../../config/environment');

let sequelize;
if (env.NODE_ENV === 'production' && env.DATABASE_URL) {
    sequelize = new Sequelize(env.DATABASE_URL, {
        dialect: env.DB_DIALECT,
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
            underscoredAll: true
        }
    });
} else {
    sequelize = new Sequelize({
        dialect: env.DB_DIALECT,
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASS,
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
            underscoredAll: true
        }
    });
}

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida correctamente.');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    testConnection
};