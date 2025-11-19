require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database Configuration
    DB_DIALECT: process.env.DB_DIALECT || 'postgres',
    DATABASE_URL: isProduction ? process.env.DATABASE_URL : undefined,
    DB_HOST: isProduction ? undefined : process.env.DB_HOST || 'localhost',
    DB_PORT: isProduction ? undefined : process.env.DB_PORT || 5432,
    DB_NAME: isProduction ? undefined : process.env.DB_NAME || 'residential_complex',
    DB_USER: isProduction ? undefined : process.env.DB_USER || 'postgres',
    DB_PASS: isProduction ? undefined : process.env.DB_PASS || '',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'residential-complex-super-secret-key-2024',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

    // Email Configuration
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,

    // File Upload
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10485760,
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

    // Security
    BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 12,

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
