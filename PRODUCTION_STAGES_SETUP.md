# 🏭 Production Stages Setup Guide

## Quick Setup

To enable the production workflow system, run these commands:

```bash
# 1. Seed production stages (Cutting, Sewing, Washing, Finishing, Dispatch)
npm run seed:production

# 2. Create production stage users
npm run seed:production-users
```

## Production Stage Users

After running the seed commands, you'll have these users:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Cutting Manager | cutting@srds.com | cutting123 | Cutting Dashboard |
| Sewing Manager | sewing@srds.com | sewing123 | Sewing Dashboard |
| Washing Manager | washing@srds.com | washing123 | Washing Dashboard |
| Finishing Manager | finishing@srds.com | finishing123 | Finishing Dashboard |
| Dispatch Manager | dispatch@srds.com | dispatch123 | Dispatch Dashboard |

## How It Works

### 1. SRD Approval Flow
- VMD, CAD, MMC, and Commercial departments review and approve SRDs
- When all 4 departments approve → `readyForProduction` = true

### 2. Start Production
- Production Manager sees approved SRDs in "Ready to Start Production"
- Clicks "Start Production" button
- SRD moves to first stage (Cutting) with `inProduction` = true

### 3. Production Stages Flow
```
Cutting → Sewing → Washing → Finishing → Dispatch
```

Each stage manager:
- Sees SRDs assigned to their stage
- Can view SRD details
- Clicks "Complete" to move to next stage
- Progress automatically updates

### 4. Completion
- After Dispatch completes → `inProduction` = false
- Production is complete!

## Accessing Dashboards

### Production Manager
- URL: `/dashboard/production-manager`
- Can see all SRDs ready for production
- Can start production
- Can view all production stages

### Stage Managers
- Cutting: `/dashboard/cutting`
- Sewing: `/dashboard/sewing`
- Washing: `/dashboard/washing`
- Finishing: `/dashboard/finishing`
- Dispatch: `/dashboard/dispatch`

## Features

✅ **Beautiful UI** - Color-coded stages with modern design
✅ **Real-time Tracking** - See SRDs in each stage
✅ **Progress Monitoring** - Track completion percentage
✅ **Stage Completion** - One-click to move to next stage
✅ **Production History** - Full audit trail of stage transitions
✅ **Responsive Design** - Works on all devices

## Troubleshooting

### SRDs not appearing in Cutting?

1. **Check if production stages are seeded:**
   ```bash
   npm run seed:production
   ```

2. **Verify SRD is ready for production:**
   - All 4 departments must approve
   - Check `readyForProduction` = true

3. **Ensure production was started:**
   - Production Manager must click "Start Production"
   - Check `inProduction` = true
   - Check `currentProductionStage` is set to Cutting stage ID

4. **Check database:**
   - Production stages exist in `productionstages` collection
   - SRD has `currentProductionStage` field populated

### Can't login as production user?

Run the seed command:
```bash
npm run seed:production-users
```

## API Endpoints

- `GET /api/production-stages` - List all production stages
- `GET /api/srd?inProduction=true&currentProductionStage={stageId}` - Get SRDs in a stage
- `POST /api/srd/{id}/production/complete-stage` - Complete current stage
- `PATCH /api/srd/{id}` - Update SRD (start production)

## Next Steps

1. Run the seed commands above
2. Login as Production Manager (production-manager@srds.com)
3. Approve an SRD from all 4 departments
4. Start production from Production Manager dashboard
5. Login as Cutting Manager to see the SRD
6. Complete stages one by one

---

**Need help?** Check the console logs for detailed information about what's happening at each step.
