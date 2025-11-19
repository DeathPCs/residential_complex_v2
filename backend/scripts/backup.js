const backupService = require('../src/infrastructure/services/BackupService');
const logger = require('../src/infrastructure/logging/logger');

async function runBackup() {
    try {
        await backupService.createBackup();
        logger.info('Backup completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Backup failed:', error);
        process.exit(1);
    }
}

runBackup();