const fs = require('fs').promises;
const path = require('path');
const logger = require('../logging/logger');

class BackupService {
    constructor() {
        this.backupDir = path.join(process.cwd(), 'data-backup');
    }

    async createBackup() {
        try {
            // Crear directorio de backup si no existe
            await fs.mkdir(this.backupDir, { recursive: true });

            // Leer directorio de datos
            const dataDir = path.join(process.cwd(), 'data');
            const files = await fs.readdir(dataDir);

            // Crear backup de cada archivo
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            for (const file of files) {
                const sourceFile = path.join(dataDir, file);
                const backupFile = path.join(this.backupDir, `${path.parse(file).name}-${timestamp}${path.parse(file).ext}`);
                
                await fs.copyFile(sourceFile, backupFile);
                logger.info(`Backup created for ${file}`);
            }

            // Limpiar backups antiguos (mantener últimos 7 días)
            await this.cleanOldBackups();

            return true;
        } catch (error) {
            logger.error('Backup creation failed:', error);
            throw error;
        }
    }

    async cleanOldBackups() {
        const files = await fs.readdir(this.backupDir);
        const now = new Date();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        for (const file of files) {
            const filePath = path.join(this.backupDir, file);
            const stats = await fs.stat(filePath);

            if (stats.mtime < sevenDaysAgo) {
                await fs.unlink(filePath);
                logger.info(`Deleted old backup: ${file}`);
            }
        }
    }
}

module.exports = new BackupService();