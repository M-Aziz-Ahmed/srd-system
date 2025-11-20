import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export class BackupScheduler {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Backup scheduler started');
    
    // Check for scheduled backups every hour
    this.interval = setInterval(async () => {
      await this.checkScheduledBackups();
    }, 60 * 60 * 1000); // 1 hour
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('Backup scheduler stopped');
  }

  async checkScheduledBackups() {
    try {
      // Connect to database
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
      }

      // Get backup settings
      const settings = await mongoose.connection.db
        .collection('backup_settings')
        .findOne({ type: 'global' });

      if (!settings || !settings.autoBackup) {
        return; // Auto backup disabled
      }

      // Check if backup is due
      const schedule = await mongoose.connection.db
        .collection('backup_schedule')
        .findOne({ type: 'next_backup' });

      if (!schedule || new Date() < new Date(schedule.scheduledFor)) {
        return; // Not time yet
      }

      console.log('Creating scheduled backup...');
      await this.createAutomaticBackup(settings);

      // Schedule next backup
      await this.scheduleNextBackup(settings.backupFrequency);

    } catch (error) {
      console.error('Error in backup scheduler:', error);
    }
  }

  async createAutomaticBackup(settings) {
    try {
      // Get all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const backupData = {};

      // Export all collections
      for (const collection of collections) {
        const collectionName = collection.name;
        const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        backupData[collectionName] = data;
      }

      // Create backup directory if it doesn't exist
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `auto-backup-${timestamp}`;
      const backupPath = path.join(backupDir, `${backupName}.json`);

      // Create backup data with metadata
      const backupData_with_metadata = {
        metadata: {
          created: new Date().toISOString(),
          version: '1.0',
          type: 'automatic',
          collections: Object.keys(backupData),
          totalRecords: Object.values(backupData).reduce((sum, data) => sum + data.length, 0)
        },
        data: backupData
      };

      // Write backup to file
      fs.writeFileSync(backupPath, JSON.stringify(backupData_with_metadata, null, 2));
      
      const stats = fs.statSync(backupPath);

      // Save backup record to database
      const backupRecord = {
        id: backupName,
        name: `${backupName}.json`,
        location: settings.backupLocation || 'local',
        size: stats.size,
        createdAt: new Date(),
        status: 'completed',
        path: backupPath,
        type: 'automatic'
      };

      await mongoose.connection.db.collection('backups').insertOne(backupRecord);

      console.log(`Automatic backup created: ${backupName}`);

      // Cleanup old backups if needed
      await this.cleanupOldBackups(settings.retentionDays || 30);

    } catch (error) {
      console.error('Error creating automatic backup:', error);
    }
  }

  async scheduleNextBackup(frequency) {
    const nextBackupTime = this.calculateNextBackupTime(frequency);
    
    await mongoose.connection.db
      .collection('backup_schedule')
      .updateOne(
        { type: 'next_backup' },
        { 
          $set: { 
            scheduledFor: nextBackupTime,
            frequency: frequency,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

    console.log(`Next backup scheduled for: ${nextBackupTime}`);
  }

  calculateNextBackupTime(frequency) {
    const now = new Date();
    
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
  }

  async cleanupOldBackups(retentionDays) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Find old automatic backups
      const oldBackups = await mongoose.connection.db
        .collection('backups')
        .find({ 
          createdAt: { $lt: cutoffDate },
          type: 'automatic'
        })
        .toArray();

      // Delete old backups
      for (const backup of oldBackups) {
        try {
          // Delete local file if it exists
          if (backup.location === 'local' && backup.path) {
            if (fs.existsSync(backup.path)) {
              fs.unlinkSync(backup.path);
            }
          }

          // Remove from database
          await mongoose.connection.db
            .collection('backups')
            .deleteOne({ id: backup.id });

          console.log(`Deleted old backup: ${backup.name}`);
        } catch (error) {
          console.error(`Error deleting backup ${backup.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }
}

// Export singleton instance
export const backupScheduler = new BackupScheduler();