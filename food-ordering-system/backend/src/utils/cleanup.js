const fs = require('fs').promises;
const path = require('path');
const Food = require('../models/food'); 

//script: clean up the unuse files in the uploads folder
//command: node src/utils/cleanup.js
const cleanupOrphanedFiles = async () => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // 1. get all files on disk
    const filesOnDisk = await fs.readdir(uploadsDir);

    // 2. get all recorded filenames in the database
    const foods = await Food.findAll({ attributes: ['image'] });
    const filesInDb = foods
      .map(f => f.image ? path.basename(f.image) : null)
      .filter(name => name !== null);

    console.log(`Disk file count: ${filesOnDisk.length}, DB record count: ${filesInDb.length}`);

    // 3. find files not in database
    const orphanedFiles = filesOnDisk.filter(file => !filesInDb.includes(file));

    // 4. perform deletion
    for (const file of orphanedFiles) {
      const filePath = path.join(uploadsDir, file);
      // Prevent accidental deletion of hidden files like .gitkeep
      if (file.startsWith('.')) continue;

      await fs.unlink(filePath);
      console.log(`Cleaned up orphaned file: ${file}`);
    }

    console.log('--- Cleanup complete ---');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

// Execute cleanup
cleanupOrphanedFiles();