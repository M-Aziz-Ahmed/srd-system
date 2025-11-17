# Fix Existing SRDs - Quick Guide

## Problem
Existing SRDs still have `admin` and `production-manager` in their status map, preventing them from showing as "Ready for Production".

## Solution

### Run the Fix Script

```bash
npm run fix:srd-status
```

This script will:
1. ✅ Find all SRDs in the database
2. ✅ Remove `admin` from status map
3. ✅ Remove `production-manager` from status map
4. ✅ Trigger recalculation of `readyForProduction`
5. ✅ Show count of fixed SRDs
6. ✅ Show count of SRDs ready for production

### Expected Output

```
Connected to MongoDB
Found 5 SRDs to check
Removed admin from SRD SRD20251113-143022-123-4567
Removed production-manager from SRD SRD20251113-143022-123-4567
Fixed SRD SRD20251113-143022-123-4567 - readyForProduction: true, progress: 100%
...

✅ Fixed 3 SRDs
✅ 2 SRDs were already correct

📊 SRDs ready for production: 3

Disconnected from MongoDB
```

## What It Does

### Before Fix
```javascript
{
  refNo: "SRD20251113-143022-123-4567",
  status: {
    vmd: "approved",
    cad: "approved",
    commercial: "approved",
    mmc: "approved",
    admin: "pending",              // ← Problem
    "production-manager": "pending" // ← Problem
  },
  progress: 67,                     // Wrong!
  readyForProduction: false         // Wrong!
}
```

### After Fix
```javascript
{
  refNo: "SRD20251113-143022-123-4567",
  status: {
    vmd: "approved",
    cad: "approved",
    commercial: "approved",
    mmc: "approved"
    // admin and production-manager removed ✅
  },
  progress: 100,                    // Correct!
  readyForProduction: true          // Correct!
}
```

## Step-by-Step

### 1. Stop the Server (if running)
```bash
# Press Ctrl+C to stop
```

### 2. Run the Fix
```bash
npm run fix:srd-status
```

### 3. Restart the Server
```bash
npm run dev
```

### 4. Verify
```bash
# Login as Production Manager
Email: production@demo.com
Password: password

# Go to dashboard
# Should see SRDs in "Ready to Start Production"
```

## Verification

### Check via API
```bash
curl http://localhost:3000/api/srd?readyForProduction=true
```

Should return SRDs with:
```json
{
  "success": true,
  "data": [
    {
      "refNo": "...",
      "readyForProduction": true,
      "progress": 100,
      "status": {
        "vmd": "approved",
        "cad": "approved",
        "commercial": "approved",
        "mmc": "approved"
      }
    }
  ]
}
```

### Check via UI
1. Login as Production Manager
2. Go to `/dashboard/production-manager`
3. Should see "Ready to Start Production" section
4. Should list approved SRDs

## For Future SRDs

New SRDs created after the code fix will automatically:
- ✅ NOT include admin in status
- ✅ NOT include production-manager in status
- ✅ Calculate progress correctly
- ✅ Show as ready when all departments approve

## Troubleshooting

### Script Shows "0 SRDs Fixed"
This means your SRDs are already correct. Check if you have any SRDs at all:
```bash
# Check MongoDB
mongo srd-system
db.srds.count()
```

### Still Not Showing in Production Dashboard
1. **Check SRD Status**:
   - Open the SRD
   - Verify all departments are "approved"
   - Check progress is 100%

2. **Check readyForProduction Flag**:
   ```bash
   # Via MongoDB
   db.srds.find({ readyForProduction: true })
   ```

3. **Check inProduction Flag**:
   ```bash
   # Should be false for ready SRDs
   db.srds.find({ readyForProduction: true, inProduction: false })
   ```

4. **Clear Browser Cache**:
   - Use incognito/private window
   - Or clear cache and reload

### Manual Fix (Alternative)

If the script doesn't work, you can fix manually via MongoDB:

```javascript
// Connect to MongoDB
mongo srd-system

// Remove admin and production-manager from all SRDs
db.srds.updateMany(
  {},
  { 
    $unset: { 
      "status.admin": "",
      "status.production-manager": ""
    }
  }
)

// Force recalculation by updating all SRDs
db.srds.find().forEach(function(doc) {
  db.srds.update(
    { _id: doc._id },
    { $set: { updatedAt: new Date() } }
  );
});
```

## Summary

**Quick Fix:**
```bash
npm run fix:srd-status
```

**What It Fixes:**
- Removes admin from status
- Removes production-manager from status
- Recalculates progress
- Updates readyForProduction flag

**Result:**
- SRDs show correctly in Production Manager dashboard
- Progress shows 100% when all departments approve
- Ready for production works as expected

---

**Status**: ✅ Fix script ready
**Time**: < 1 minute
**Safe**: Non-destructive (only removes invalid status entries)
