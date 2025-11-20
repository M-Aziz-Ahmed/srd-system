# Backup Management System

A comprehensive backup solution for your SRD tracking system with support for local storage, Google Drive integration, and automated scheduling.

## Features

### ✅ **Backup Creation**
- **Local Backups**: Store backups on server's local storage
- **Google Drive Integration**: Upload backups to Google Drive (configurable)
- **Manual Backups**: Create backups on-demand through admin portal
- **Automatic Backups**: Schedule regular backups (hourly, daily, weekly, monthly)

### ✅ **Backup Management**
- **Upload & Restore**: Upload backup files and restore from them
- **Download**: Download backup files for external storage
- **Delete**: Remove old or unwanted backups
- **Cleanup**: Automatically remove old backups based on retention policy

### ✅ **Configuration Options**
- **Retention Period**: 7 days to 1 year
- **Backup Frequency**: Hourly, daily, weekly, monthly
- **Storage Location**: Local or Google Drive
- **Auto-backup Toggle**: Enable/disable automatic backups

## Getting Started

### 1. Access Backup Management

Navigate to the backup management page through:
- **Admin Dashboard** → "Backup Management" button
- **Settings** → "Backup Management" card
- Direct URL: `/settings/backup`

### 2. Create Your First Backup

#### Manual Backup (Recommended for first time)
1. Go to backup management page
2. Click "Create Local Backup" or "Backup to Google Drive"
3. Wait for the backup to complete
4. Backup will appear in the history section

#### Command Line Backup
```bash
npm run backup:create
```

### 3. Configure Automatic Backups

1. In the backup management page, scroll to "Backup Settings"
2. Configure:
   - **Retention Period**: How long to keep backups
   - **Backup Frequency**: How often to create backups
   - **Default Location**: Where to store backups
   - **Enable Automatic Backups**: Toggle auto-backup on/off

### 4. Start Backup Scheduler (Production)

For automatic backups to work, start the backup scheduler:

```bash
# In production
npm run backup:scheduler

# Or set environment variable
ENABLE_BACKUP_SCHEDULER=true npm start
```

## Backup File Format

Backups are stored as JSON files with the following structure:

```json
{
  "metadata": {
    "created": "2024-01-01T00:00:00.000Z",
    "version": "1.0",
    "type": "manual|automatic|uploaded",
    "collections": ["users", "srds", "departments", ...],
    "totalRecords": 1234
  },
  "data": {
    "users": [...],
    "srds": [...],
    "departments": [...],
    // ... all collections
  }
}
```

## Google Drive Integration

### Setup (Optional)

1. Create a Google Cloud Project
2. Enable Google Drive API
3. Create service account credentials
4. Set environment variables:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/service-account.json
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id
   ```

### Configuration

In backup settings:
- Set "Default Location" to "Google Drive"
- Enable Google Drive in settings
- Backups will automatically upload to your configured Google Drive folder

## Backup Operations

### Creating Backups

#### Through Admin Portal
1. **Local Backup**: Stores on server, good for quick access
2. **Google Drive Backup**: Uploads to cloud, good for off-site storage

#### Command Line
```bash
# Create manual backup
npm run backup:create

# Start automatic backup scheduler
npm run backup:scheduler
```

### Restoring Backups

⚠️ **Warning**: Restoring will overwrite current data!

1. Select backup from history
2. Click restore button (↻)
3. Confirm the operation
4. System will:
   - Create a pre-restore backup of current data
   - Clear existing collections
   - Import backup data
   - Refresh the application

### Uploading Backups

1. Click "Upload Backup" in the admin portal
2. Select a `.json` backup file
3. File will be validated and added to backup history
4. Can then be used for restoration

### Downloading Backups

1. Click download button (⬇) next to any backup
2. File will download to your computer
3. Can be used for external storage or sharing

## Backup Types

- **Manual**: Created through admin portal
- **Automatic**: Created by scheduler
- **Uploaded**: Uploaded through admin portal
- **Pre-restore**: Created before restoration (kept longer)

## Retention & Cleanup

### Automatic Cleanup
- Runs when creating automatic backups
- Removes backups older than retention period
- Keeps pre-restore backups longer for safety

### Manual Cleanup
1. Click "Cleanup Old" button in admin portal
2. Removes backups older than configured retention period
3. Shows count of deleted backups

## Monitoring & Troubleshooting

### Backup Status
- **Completed**: Backup created successfully
- **Failed**: Backup creation failed
- **In Progress**: Backup currently being created

### Common Issues

#### Backup Creation Fails
- Check disk space on server
- Verify database connection
- Check file permissions in backup directory

#### Google Drive Upload Fails
- Verify service account credentials
- Check Google Drive API quotas
- Ensure folder permissions are correct

#### Restoration Fails
- Verify backup file format
- Check database connection
- Ensure sufficient disk space

### Logs
Check server logs for detailed error messages:
```bash
# View backup scheduler logs
tail -f logs/backup-scheduler.log

# View application logs
npm run dev  # Development
npm start    # Production
```

## Security Considerations

### Access Control
- Only admin users can access backup management
- All backup operations require admin authentication
- API endpoints are protected with role-based access

### Data Protection
- Backups contain sensitive data - store securely
- Use HTTPS for Google Drive uploads
- Consider encrypting backup files for additional security

### Best Practices
1. **Regular Testing**: Periodically test backup restoration
2. **Multiple Locations**: Store backups in multiple locations
3. **Version Control**: Keep multiple backup versions
4. **Documentation**: Document your backup procedures
5. **Monitoring**: Monitor backup success/failure

## API Endpoints

### Backup Management
- `POST /api/backup/create` - Create new backup
- `GET /api/backup/list` - List all backups
- `GET /api/backup/download/[id]` - Download backup
- `DELETE /api/backup/delete/[id]` - Delete backup
- `POST /api/backup/restore/[id]` - Restore backup
- `POST /api/backup/upload` - Upload backup file
- `POST /api/backup/cleanup` - Cleanup old backups

### Settings
- `GET /api/backup/settings` - Get backup settings
- `PUT /api/backup/settings` - Update backup settings

## Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/your-database

# Optional - Google Drive Integration
GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/service-account.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Optional - Backup Scheduler
ENABLE_BACKUP_SCHEDULER=true
```

## File Structure

```
src/
├── app/
│   ├── api/backup/
│   │   ├── create/route.js
│   │   ├── list/route.js
│   │   ├── download/[id]/route.js
│   │   ├── delete/[id]/route.js
│   │   ├── restore/[id]/route.js
│   │   ├── upload/route.js
│   │   ├── cleanup/route.js
│   │   └── settings/route.js
│   └── settings/backup/page.jsx
├── lib/
│   ├── backupScheduler.js
│   ├── startBackupScheduler.js
│   └── createBackup.js
└── backups/  # Created automatically
    ├── backup-2024-01-01T00-00-00-000Z.json
    └── ...
```

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Test with manual backup first
4. Verify database connectivity
5. Check file permissions

---

**Remember**: Always test your backup and restore procedures in a development environment before relying on them in production!