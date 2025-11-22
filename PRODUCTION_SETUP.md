# 🏭 Production Workflow Setup Guide

## Overview

This guide will help you set up the production workflow system with 5 production stages and their respective users.

---

## Quick Setup (2 Commands)

### Step 1: Seed Production Stages
```bash
npm run seed:production
```

This creates 5 production stages:
- ✂️ **Cutting** (Order: 1)
- 🧵 **Sewing** (Order: 2)
- 💧 **Washing** (Order: 3)
- ✨ **Finishing** (Order: 4)
- 📦 **Dispatch** (Order: 5)

### Step 2: Seed Production Users
```bash
npm run seed:production-users
```

This creates 5 users (one for each stage):

| Department | Email | Password | Role |
|------------|-------|----------|------|
| Cutting | cutting@srds.com | cutting123 | cutting |
| Sewing | sewing@srds.com | sewing123 | sewing |
| Washing | washing@srds.com | washing123 | washing |
| Finishing | finishing@srds.com | finishing123 | finishing |
| Dispatch | dispatch@srds.com | dispatch123 | dispatch |

---

## How It Works

### 1. SRD Approval Flow

```
SRD Created
    ↓
VMD Reviews → Approves/Rejects
    ↓
CAD Reviews → Approves/Rejects
    ↓
MMC Reviews → Approves/Rejects
    ↓
Commercial Reviews → Approves/Rejects
    ↓
✨ ALL 4 APPROVED ✨
    ↓
🏭 PRODUCTION STARTS AUTOMATICALLY
```

### 2. Production Flow

```
Cutting Department
    ↓ (Mark Complete)
Sewing Department
    ↓ (Mark Complete)
Washing Department
    ↓ (Mark Complete)
Finishing Department
    ↓ (Mark Complete)
Dispatch Department
    ↓ (Mark Complete)
🎉 PRODUCTION COMPLETE
```

---

## User Access

### Cutting User
- **Login:** cutting@srds.com / cutting123
- **Access:** Can see SRDs in cutting stage
- **Actions:** 
  - Mark cutting as "In Progress"
  - Mark cutting as "Complete"
  - Add notes/comments
  - Report issues

### Sewing User
- **Login:** sewing@srds.com / sewing123
- **Access:** Can see SRDs in sewing stage
- **Actions:** Same as above for sewing stage

### Washing User
- **Login:** washing@srds.com / washing123
- **Access:** Can see SRDs in washing stage
- **Actions:** Same as above for washing stage

### Finishing User
- **Login:** finishing@srds.com / finishing123
- **Access:** Can see SRDs in finishing stage
- **Actions:** Same as above for finishing stage

### Dispatch User
- **Login:** dispatch@srds.com / dispatch123
- **Access:** Can see SRDs in dispatch stage
- **Actions:** 
  - Mark dispatch as "In Progress"
  - Mark dispatch as "Complete"
  - Add shipping details
  - Confirm dispatch

---

## Admin Features

### Admin Can:
- ✅ View all production stages
- ✅ Add/Edit/Delete production stages
- ✅ Reorder production stages
- ✅ Assign users to stages
- ✅ View production analytics
- ✅ Override stage progression
- ✅ Manage all SRDs in production

---

## Production Stage Management

### Adding a New Stage

1. Admin logs in
2. Goes to "Production Stages" management
3. Clicks "Add Stage"
4. Fills in:
   - Stage Name (e.g., "Quality Check")
   - Display Name
   - Order (position in workflow)
   - Color
   - Icon
   - Description
5. Creates user for that stage
6. Stage is now part of the workflow!

### Reordering Stages

1. Admin goes to "Production Stages"
2. Drag and drop stages to reorder
3. Order is automatically saved
4. New SRDs will follow new order

### Deactivating a Stage

1. Admin edits stage
2. Sets "Active" to false
3. Stage is skipped in workflow
4. Existing SRDs in that stage complete normally

---

## Workflow Automation

### Auto-Start Production

When the 4th department approves an SRD:
```javascript
// Automatic trigger
if (vmd.approved && cad.approved && mmc.approved && commercial.approved) {
  // Start production automatically
  startProduction(srd);
  
  // SRD moves to first stage (Cutting)
  // Cutting user gets notification
  // Status changes to "In Production"
}
```

### Auto-Progress Through Stages

When a stage is marked complete:
```javascript
// Automatic progression
completeStage(srd, 'cutting');

// SRD automatically moves to next stage (Sewing)
// Sewing user gets notification
// Progress is updated
```

---

## Dashboard Views

### Cutting Dashboard
- **URL:** `/dashboard/cutting`
- **Shows:** All SRDs currently in cutting stage
- **Filters:** Pending, In Progress, Completed
- **Actions:** Start, Complete, Add Notes

### Sewing Dashboard
- **URL:** `/dashboard/sewing`
- **Shows:** All SRDs currently in sewing stage
- Similar features as cutting

### (Same for Washing, Finishing, Dispatch)

### Admin Production Overview
- **URL:** `/admin/production`
- **Shows:** All SRDs in all stages
- **Analytics:** 
  - Total SRDs in production
  - Average time per stage
  - Bottlenecks
  - Completion rates

---

## SRD Production Timeline

Each SRD shows a production timeline:

```
✅ Cutting      (Completed: 2 days)
✅ Sewing       (Completed: 3 days)
🔄 Washing      (In Progress: 1 day)
⏳ Finishing    (Pending)
⏳ Dispatch     (Pending)
```

---

## Notifications

### Users Get Notified When:
- ✅ SRD enters their stage
- ✅ Issue is reported in their stage
- ✅ Admin assigns SRD to them
- ✅ SRD is urgent/priority

---

## Reports & Analytics

### Production Reports:
- Time spent per stage
- Bottleneck identification
- Completion rates
- Issue frequency
- Average production time
- Stage efficiency

---

## Next Steps

### 1. Run Setup Commands
```bash
npm run seed:production
npm run seed:production-users
```

### 2. Test the Flow
1. Login as VMD, CAD, MMC, Commercial
2. Create and approve an SRD
3. Watch it automatically enter production
4. Login as cutting@srds.com
5. See the SRD in cutting dashboard
6. Mark it complete
7. Login as sewing@srds.com
8. See the SRD has moved to sewing
9. Continue through all stages

### 3. Customize
- Add more stages if needed
- Create additional users per stage
- Customize colors and icons
- Set up notifications

---

## Production Stages Configuration

### Current Default Stages:

| Order | Stage | Icon | Color | Description |
|-------|-------|------|-------|-------------|
| 1 | Cutting | ✂️ | Red | Fabric cutting stage |
| 2 | Sewing | 🧵 | Orange | Garment sewing and assembly |
| 3 | Washing | 💧 | Blue | Garment washing and treatment |
| 4 | Finishing | ✨ | Purple | Final finishing and quality check |
| 5 | Dispatch | 📦 | Green | Packaging and dispatch |

### You Can:
- ✅ Add more stages (e.g., Quality Check, Packaging)
- ✅ Remove stages
- ✅ Reorder stages
- ✅ Rename stages
- ✅ Change colors/icons

---

## Security

### Access Control:
- ✅ Cutting users can only see cutting stage
- ✅ Sewing users can only see sewing stage
- ✅ Each stage is isolated
- ✅ Admin can see everything
- ✅ Users cannot skip stages

---

## 🎉 You're Ready!

Your production workflow system is now set up with:
- ✅ 5 Production stages
- ✅ 5 Production users (one per stage)
- ✅ Automatic workflow progression
- ✅ Stage-specific dashboards
- ✅ Admin management interface

**Run the seed commands and start tracking production!** 🏭✨