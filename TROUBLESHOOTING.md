# Troubleshooting Guide

## Common Issues and Solutions

### Stages Not Editable or Deleting

**Issue**: Clicking edit or delete on stages doesn't work or shows errors.

**Cause**: Next.js 15 requires `params` to be awaited in API routes.

**Solution**: ✅ Fixed! The stages API routes now properly handle async params.

**What was changed**:
```javascript
// Before (incorrect)
export async function PATCH(request, { params }) {
  const stage = await Stage.findById(params.id);
}

// After (correct)
export async function PATCH(request, { params }) {
  const { id } = await params;
  const stage = await Stage.findById(id);
}
```

**Files updated**:
- `src/app/api/stages/[id]/route.js` - All methods (GET, PATCH, DELETE)

---

## Other Common Issues

### Database Connection Failed

**Symptoms**:
- Pages load but show "Loading..." indefinitely
- API returns 500 errors
- Console shows MongoDB connection errors

**Solutions**:
1. Check `.env` file has correct `MONGODB_URI`
2. Verify MongoDB is running
3. Check network connectivity
4. Review firewall settings
5. Ensure MongoDB Atlas IP whitelist includes your IP

**Test connection**:
```bash
# In your project directory
node -e "require('./src/lib/db.js').default().then(() => console.log('Connected!')).catch(e => console.error(e))"
```

---

### Pages Not Loading (404 Errors)

**Symptoms**:
- `/settings`, `/departments`, or `/stages` shows 404
- Sidebar links don't work

**Solutions**:
1. Verify files exist in correct locations:
   - `src/app/settings/page.jsx`
   - `src/app/departments/page.jsx`
   - `src/app/stages/page.jsx`
2. Restart the development server
3. Clear `.next` cache: `rm -rf .next` (or `rmdir /s /q .next` on Windows)
4. Rebuild: `npm run dev`

---

### Changes Not Saving

**Symptoms**:
- Form submits but data doesn't appear
- No error messages shown
- Data disappears after refresh

**Solutions**:
1. Check browser console for errors
2. Check network tab for failed API requests
3. Verify API routes are working:
   ```bash
   # Test departments API
   curl http://localhost:3000/api/departments
   
   # Test stages API
   curl http://localhost:3000/api/stages
   ```
4. Check MongoDB connection
5. Verify data validation (required fields, unique slugs)

---

### Duplicate Slug Errors

**Symptoms**:
- Error: "E11000 duplicate key error"
- Can't create department/stage with certain names

**Solutions**:
1. Check if slug already exists in database
2. Use a different name or manually set a unique slug
3. Delete the conflicting record if it's a test entry
4. Clear database and re-seed:
   ```bash
   # Warning: This deletes all data!
   npm run seed:dynamic
   ```

---

### Fields Not Appearing in SRD Forms

**Symptoms**:
- Custom fields don't show in SRD creation/edit forms
- Fields exist in `/srdfields` but aren't visible

**Solutions**:
1. Verify field is marked as `active: true`
2. Check department assignment matches
3. Ensure field type is supported
4. Clear browser cache
5. Check SRD form component is fetching fields correctly

---

### Stages Not Showing Colors/Icons

**Symptoms**:
- Stages appear but without colors
- Icons don't display
- Default gray color shown

**Solutions**:
1. Verify color is valid hex code (e.g., `#FF0000`)
2. Check icon name is valid Lucide icon
3. Ensure stage data includes color and icon fields
4. Check CSS is loading correctly
5. Inspect element to see if styles are applied

---

### Permission Denied / Can't Access Config Pages

**Symptoms**:
- Config pages redirect to dashboard
- Sidebar doesn't show config links
- "Access Denied" messages

**Solutions**:
1. Verify you're logged in as admin user
2. Check user role in session:
   ```javascript
   // In browser console
   console.log(await fetch('/api/auth/session').then(r => r.json()))
   ```
3. Ensure admin role is set correctly in database
4. Clear session and login again
5. Check NextAuth configuration

---

### Seed Script Fails

**Symptoms**:
- `npm run seed:dynamic` shows errors
- "Cannot connect to MongoDB"
- Validation errors

**Solutions**:
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Verify models are correct
4. Check for existing data conflicts
5. Try clearing collections first:
   ```javascript
   // In MongoDB shell or Compass
   db.departments.deleteMany({})
   db.stages.deleteMany({})
   db.fields.deleteMany({})
   ```

---

### Modal Not Opening

**Symptoms**:
- Click "Add New" but nothing happens
- Edit button doesn't open modal
- Modal appears but is blank

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify modal state is managed correctly
3. Check z-index conflicts with other elements
4. Ensure modal component is rendering
5. Try refreshing the page

---

### Data Not Refreshing After Save

**Symptoms**:
- Save succeeds but table doesn't update
- Need to manually refresh page
- Old data still showing

**Solutions**:
1. Check if `fetchData()` is called after save
2. Verify API returns updated data
3. Check state update logic
4. Look for race conditions
5. Add loading states to prevent multiple saves

---

### Slow Performance

**Symptoms**:
- Pages load slowly
- API requests take long time
- UI feels sluggish

**Solutions**:
1. Check database indexes are created
2. Optimize queries (use `.lean()` for read-only)
3. Limit populated fields
4. Add pagination for large datasets
5. Enable caching
6. Check network latency to MongoDB

**Create indexes**:
```javascript
// In MongoDB shell
db.departments.createIndex({ slug: 1 })
db.stages.createIndex({ order: 1 })
db.stages.createIndex({ isActive: 1 })
```

---

## Debugging Tips

### Enable Detailed Logging

Add to your API routes:
```javascript
console.log('Request body:', body);
console.log('Database query:', query);
console.log('Result:', result);
```

### Check API Responses

Use browser DevTools Network tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (create/edit/delete)
4. Click on API request
5. Check Response tab for errors

### Verify Database State

Use MongoDB Compass or shell:
```javascript
// Check departments
db.departments.find().pretty()

// Check stages
db.stages.find().pretty()

// Check fields
db.fields.find().pretty()
```

### Test API Endpoints Directly

Use curl or Postman:
```bash
# List departments
curl http://localhost:3000/api/departments

# Create department
curl -X POST http://localhost:3000/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Dept","slug":"test"}'

# Update stage
curl -X PATCH http://localhost:3000/api/stages/[id] \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

---

## Getting Help

If you're still stuck:

1. **Check Documentation**
   - `QUICK_START_DYNAMIC.md` - Setup guide
   - `DYNAMIC_SYSTEM.md` - Full documentation
   - `ARCHITECTURE.md` - System architecture

2. **Review Code**
   - Check browser console for errors
   - Review server logs
   - Inspect network requests
   - Verify database state

3. **Common Patterns**
   - Most issues are related to:
     - Database connection
     - API route parameters (Next.js 15)
     - State management
     - Validation errors

4. **Reset and Try Again**
   ```bash
   # Clear everything and start fresh
   rm -rf .next
   npm run seed:dynamic
   npm run dev
   ```

---

## Prevention

### Best Practices

1. **Always await params in API routes** (Next.js 15)
   ```javascript
   const { id } = await params;
   ```

2. **Validate input data**
   ```javascript
   if (!body.name) {
     return NextResponse.json({ error: 'Name required' }, { status: 400 });
   }
   ```

3. **Handle errors gracefully**
   ```javascript
   try {
     // operation
   } catch (error) {
     console.error('Error:', error);
     return NextResponse.json({ error: error.message }, { status: 500 });
   }
   ```

4. **Use soft deletes**
   ```javascript
   // Don't delete, just mark inactive
   { isActive: false }
   ```

5. **Test before deploying**
   - Create test records
   - Edit and verify changes
   - Delete and verify soft delete
   - Check all API endpoints

---

## Quick Fixes

### Reset Everything
```bash
# Stop server
# Clear cache
rm -rf .next

# Re-seed database
npm run seed:dynamic

# Restart
npm run dev
```

### Fix Async Params (Next.js 15)
```javascript
// In any API route with [id]
export async function GET(request, { params }) {
  const { id } = await params;  // Add this line
  // ... rest of code
}
```

### Fix Database Connection
```javascript
// In .env
MONGODB_URI=mongodb://localhost:27017/srd-system
# or for Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/srd-system
```

---

## Status Checks

### System Health Check

Run these checks to verify everything is working:

- [ ] Server starts without errors
- [ ] Can access `/settings`
- [ ] Can access `/departments`
- [ ] Can access `/stages`
- [ ] Can access `/srdfields`
- [ ] Can create new department
- [ ] Can edit department
- [ ] Can delete department
- [ ] Can create new stage
- [ ] Can edit stage (with color/icon)
- [ ] Can delete stage
- [ ] Can create new field
- [ ] Can edit field
- [ ] Can delete field
- [ ] Sidebar navigation works
- [ ] Modal opens and closes
- [ ] Data persists after refresh

If all checks pass, your system is working correctly! ✅

---

**Last Updated**: After fixing stages edit/delete issue
**Status**: All known issues resolved
