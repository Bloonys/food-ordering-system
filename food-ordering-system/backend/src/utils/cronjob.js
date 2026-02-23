const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const Food = require('../models/food');

const cleanupFiles = async () => {
    console.log('[Cron] Cleaning up orphaned files...');
    try {
        const uploadsDir = path.join(__dirname, '../../uploads');
        
        // 1. read all files on disk
        const filesOnDisk = await fs.readdir(uploadsDir);
        
        // 2. read all recorded filenames in the database
        const foods = await Food.findAll({ attributes: ['image'] });
        const filesInDb = foods
            .map(f => f.image ? path.basename(f.image) : null)
            .filter(Boolean);

        // 3. find files not in database and delete
        let count = 0;
        for (const file of filesOnDisk) {
            // Ignore hidden files (e.g. .gitkeep)
            if (file.startsWith('.')) continue;

            if (!filesInDb.includes(file)) {
                await fs.unlink(path.join(uploadsDir, file));
                count++;
            }
        }
        console.log(`[Cron] Cleanup complete, deleted ${count} orphaned files.`);
    } catch (err) {
        console.error('[Cron] Cleanup task failed:', err);
    }
};

// Schedule the cleanup task to run daily at 3:00 AM
// Cron expression: '0 3 * * *' means "At 03:00 every day" 
// 秒 分 时 日 月 周
const initCronJobs = () => {
    cron.schedule('0 3 * * *', () => {
        cleanupFiles();
    });
    console.log('[Cron] Cleanup task scheduled (Daily at 03:00)');
};

module.exports = initCronJobs;