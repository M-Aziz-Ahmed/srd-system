# Quick Fix - User Role Enum Error

## Error Message
```
User validation failed: role: `production-status` is not a valid enum value for path `role`.
```

## Quick Fix (3 Steps)

### Step 1: Run Migration
```bash
npm run migrate:users
```

### Step 2: Re-seed Database
```bash
npm run seed:dynamic
```

### Step 3: Restart Server
```bash
npm run dev
```

## Done! ✅

Your system will now:
- Accept any role (dynamic based on departments)
- Create users without enum errors
- Work with all features

## What Happened?

The old User model had hardcoded roles:
```javascript
role: { 
  type: String, 
  enum: ['admin', 'vmd', 'cad', 'commercial', 'mmc']  // ❌ Old
}
```

New model allows dynamic roles:
```javascript
role: { 
  type: String, 
  required: true  // ✅ New - any string allowed
}
```

MongoDB cached the old schema, so we need to drop and recreate.

## Alternative: Keep Existing Users

If you have important user data:

1. **Export users** (via MongoDB Compass or mongodump)
2. **Run migration**: `npm run migrate:users`
3. **Import users back**
4. **Restart**: `npm run dev`

## Verify Fix

Test user creation:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "any-department-slug",
    "isActive": true
  }'
```

Should return success! ✅

## Files Updated
- ✅ `src/models/User.js` - Removed enum
- ✅ `src/lib/migrateUsers.js` - Migration script
- ✅ `package.json` - Added migrate command

## Support
If issues persist:
1. Check MongoDB is running
2. Verify MONGODB_URI in .env
3. Clear .next folder: `rm -rf .next`
4. Restart everything

---

**Status**: Ready to fix
**Time**: < 1 minute
**Impact**: Enables dynamic user roles
