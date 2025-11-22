# 🧪 Test Production Flow

## Step-by-Step Testing Guide

### Prerequisites
```bash
# 1. Seed production stages
npm run seed:production

# 2. Create production users
npm run seed:production-users
```

### Test Flow

#### 1. Create and Approve an SRD

**Login as VMD** (vmd@srds.com / vmd123)
- Create a new SRD
- Note the SRD Reference Number

**Login as each department and approve:**
- VMD: vmd@srds.com / vmd123
- CAD: cad@srds.com / cad123
- MMC: mmc@srds.com / mmc123
- Commercial: commercial@srds.com / commercial123

For each department:
1. Go to "My SRDs"
2. Click on the SRD
3. Change status to "Approved"
4. Add a comment (optional)
5. Click "Update Status"

#### 2. Start Production

**Login as Production Manager** (production-manager@srds.com / manager123)
1. Go to Production Manager Dashboard
2. You should see the SRD in "Ready to Start Production" section
3. Click "Start Production" button
4. You should see an alert: "Production started! SRD moved to Cutting stage."

#### 3. Test Cutting Stage

**Login as Cutting Manager** (cutting@srds.com / cutting123)
1. Go to Cutting Dashboard (should auto-redirect)
2. You should see the SRD in the "SRDs in Cutting" section
3. Click "Complete" button
4. You should see an alert: "Moved to Sewing"
5. The SRD should disappear from Cutting dashboard

#### 4. Test Sewing Stage

**Login as Sewing Manager** (sewing@srds.com / sewing123)
1. Go to Sewing Dashboard
2. You should see the SRD
3. Click "Complete" button
4. Alert: "Moved to Washing"

#### 5. Test Washing Stage

**Login as Washing Manager** (washing@srds.com / washing123)
1. Go to Washing Dashboard
2. You should see the SRD
3. Click "Complete" button
4. Alert: "Moved to Finishing"

#### 6. Test Finishing Stage

**Login as Finishing Manager** (finishing@srds.com / finishing123)
1. Go to Finishing Dashboard
2. You should see the SRD
3. Click "Complete" button
4. Alert: "Moved to Dispatch"

#### 7. Test Dispatch Stage

**Login as Dispatch Manager** (dispatch@srds.com / dispatch123)
1. Go to Dispatch Dashboard
2. You should see the SRD
3. Click "Complete" button
4. Alert: "Production completed"
5. The SRD should disappear (production complete!)

#### 8. Verify Completion

**Login as Production Manager**
1. Go to Production Manager Dashboard
2. The SRD should NOT be in "In Production" section
3. Check "Production Tracking" page
4. The SRD should show as completed

---

## Troubleshooting

### SRD not showing in Cutting after "Start Production"

**Check in browser console:**
```javascript
// Open browser DevTools (F12)
// Go to Network tab
// Click "Start Production"
// Check the PATCH request to /api/srd/{id}
// Verify the response includes:
{
  "success": true,
  "data": {
    "inProduction": true,
    "currentProductionStage": "...", // Should be Cutting stage ID
    "productionStartDate": "...",
    "productionProgress": 0
  }
}
```

**Check database directly:**
```javascript
// In MongoDB or your database tool
db.srds.findOne({ refNo: "YOUR_SRD_REF_NO" })

// Should show:
{
  "inProduction": true,
  "readyForProduction": true,
  "currentProductionStage": ObjectId("..."), // Cutting stage ID
  "productionProgress": 0,
  "productionStartDate": ISODate("...")
}
```

**Check production stages exist:**
```javascript
db.productionstages.find()

// Should return 5 stages:
// - cutting (order: 1)
// - sewing (order: 2)
// - washing (order: 3)
// - finishing (order: 4)
// - dispatch (order: 5)
```

### Production Manager can't see "Start Production" button

- Verify all 4 departments have approved the SRD
- Check `readyForProduction` is `true`
- Check `inProduction` is `false`

### Stage manager can't see SRDs

- Verify production was started by Production Manager
- Check the SRD's `currentProductionStage` matches the stage ID
- Verify `inProduction` is `true`

---

## Expected Results

✅ SRD flows through all 5 stages automatically
✅ Each stage manager sees only their assigned SRDs
✅ Progress updates as stages complete
✅ Production history is recorded
✅ Final stage completion marks production as done

## Debug Mode

Add this to your browser console to debug:
```javascript
// Check current SRD status
fetch('/api/srd?search=YOUR_REF_NO')
  .then(r => r.json())
  .then(d => console.log('SRD Status:', d.data[0]))

// Check production stages
fetch('/api/production-stages')
  .then(r => r.json())
  .then(d => console.log('Production Stages:', d.data))

// Check SRDs in Cutting
fetch('/api/production-stages')
  .then(r => r.json())
  .then(d => {
    const cuttingStage = d.data.find(s => s.name === 'cutting')
    return fetch(`/api/srd?inProduction=true&currentProductionStage=${cuttingStage._id}`)
  })
  .then(r => r.json())
  .then(d => console.log('SRDs in Cutting:', d.data))
```
