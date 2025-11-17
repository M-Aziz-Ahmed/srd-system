# Fix User Role Enum Error

## Problem
Error: `User validation failed: role: 'production-status' is not a valid enum value for path 'role'`

## Cause
MongoDB has cached the old User schema with enum constraints on the role field.

## Solution

### Option 1: Run Migration Script (Recommended)

```bash
npm run migrate:users
```

This will:
- Drop the users collection
- Remove old schema constraints
- Allow dynamic roles

**Note**: This will delete all existing users. Re-run seed after:
```bash
npm run seed:dynamic
```

### Option 2: Manual MongoDB Fix

If you want to keep existing users:

```javascript
// In MongoDB shell or Compass
use srd-system

// Remove the validator
db.runCommand({
  collMod: "users",
  validator: {},
  validationLevel: "off"
})

// Or drop and recreate
db.users.drop()
```

Then restart your app:
```bash
npm run dev
```

### Option 3: Clear Node Cache

Sometimes the issue is cached models:

```bash
# Stop the server
# Delete .next folder
rm -rf .next

# Restart
npm run dev
```

## Verification

After fixing, test user creation:

```bash
# Via API
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "vmd",
    "isActive": true
  }'
```

Or via UI:
1. Go to http://localhost:3000/users
2. Click "Add User"
3. Fill in the form
4. Should work without enum error

## Prevention

The User model has been updated to:
- Remove enum constraint
- Allow any string as role
- Support dynamic department-based roles

## Status
✅ Model updated
✅ Migration script created
✅ Ready to use
