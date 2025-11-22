# 🏭 Production Workflow System - Specification

## Overview

After an SRD is approved by all 4 departments (VMD, CAD, MMC, Commercial), it automatically enters the production workflow with configurable stages.

---

## Production Flow

```
SRD Approved by All 4 Depts
         ↓
    [Cutting] → [Sewing] → [Washing] → [Finishing] → [Dispatch]
         ↓           ↓          ↓            ↓            ↓
    Users can track, update, and manage each stage
```

---

## Features

### 1. Configurable Production Stages
- ✅ Admin can add/edit/delete stages
- ✅ Admin can reorder stages (drag & drop)
- ✅ Each stage has: name, color, icon, description
- ✅ Stages can be activated/deactivated

### 2. Stage-Specific Users
- ✅ Create users for each production stage
- ✅ Roles: cutting-manager, sewing-manager, washing-manager, etc.
- ✅ Each user can only access their stage

### 3. Automatic Workflow Trigger
- ✅ When all 4 depts approve → SRD moves to first production stage
- ✅ Status changes to "In Production"
- ✅ Production progress tracking starts

### 4. Stage Management
- ✅ Mark stage as "In Progress"
- ✅ Mark stage as "Completed"
- ✅ Add notes/comments per stage
- ✅ Report issues/problems
- ✅ Track time spent per stage

### 5. Production Dashboard
- ✅ View all SRDs in current stage
- ✅ See pending, in-progress, completed items
- ✅ Track overall production progress
- ✅ View production timeline

### 6. Admin Controls
- ✅ Manage production stages
- ✅ Assign users to stages
- ✅ View production analytics
- ✅ Override stage progression if needed

---

## Database Models

### ProductionStage
```javascript
{
  name: 'cutting',
  displayName: 'Cutting',
  order: 1,
  isActive: true,
  description: 'Fabric cutting stage',
  color: '#ef4444',
  icon: '✂️'
}
```

### ProductionProgress
```javascript
{
  srdId: ObjectId,
  currentStage: 'cutting',
  stages: [
    {
      stageName: 'cutting',
      status: 'in-progress',
      startedAt: Date,
      completedAt: null,
      assignedTo: ObjectId,
      notes: 'Started cutting process',
      issues: []
    }
  ]
}
```

### User (Extended)
```javascript
{
  role: 'cutting-manager',
  department: 'production',
  productionStage: 'cutting'
}
```

---

## API Endpoints

### Production Stages
- `GET /api/production/stages` - List all stages
- `POST /api/production/stages` - Create stage (admin)
- `PUT /api/production/stages/:id` - Update stage (admin)
- `DELETE /api/production/stages/:id` - Delete stage (admin)
- `PUT /api/production/stages/reorder` - Reorder stages (admin)

### Production Progress
- `GET /api/production/progress/:srdId` - Get SRD production progress
- `POST /api/production/start/:srdId` - Start production (auto-triggered)
- `PUT /api/production/stage/:srdId/start` - Start current stage
- `PUT /api/production/stage/:srdId/complete` - Complete current stage
- `POST /api/production/stage/:srdId/issue` - Report issue
- `PUT /api/production/stage/:srdId/note` - Add note

### Production Dashboard
- `GET /api/production/dashboard/:stage` - Get stage dashboard data
- `GET /api/production/analytics` - Get production analytics (admin)

---

## UI Components

### 1. Admin - Production Stages Management
- `/admin/production-stages`
- List all stages with drag-to-reorder
- Add/Edit/Delete stages
- Assign users to stages

### 2. Production Dashboard (Per Stage)
- `/dashboard/production/cutting`
- `/dashboard/production/sewing`
- etc.
- Shows SRDs in current stage
- Update status, add notes, report issues

### 3. SRD Detail - Production Tab
- Shows production timeline
- Current stage and progress
- History of all stages
- Issues and notes

### 4. Production Manager Dashboard
- `/dashboard/production-manager`
- Overview of all production stages
- Analytics and reports
- Can manage all stages

---

## User Roles

### Production Stage Roles:
- `cutting` - Cutting department user
- `sewing` - Sewing department user
- `washing` - Washing department user
- `finishing` - Finishing department user
- `dispatch` - Dispatch department user

### Note:
- Each production stage is treated as a separate department
- Users are assigned to specific stages
- Admin can oversee all production stages

---

## Workflow Logic

### 1. Approval Trigger
```javascript
// When 4th department approves
if (allDepartmentsApproved(srd)) {
  await startProduction(srd);
}
```

### 2. Start Production
```javascript
async function startProduction(srd) {
  // Get first active stage
  const firstStage = await ProductionStage.findOne({ isActive: true }).sort({ order: 1 });
  
  // Create production progress
  await ProductionProgress.create({
    srdId: srd._id,
    currentStage: firstStage.name,
    stages: allStages.map(stage => ({
      stageName: stage.name,
      status: 'pending'
    }))
  });
  
  // Update SRD
  srd.inProduction = true;
  srd.currentProductionStage = firstStage._id;
  await srd.save();
}
```

### 3. Complete Stage
```javascript
async function completeStage(srdId, stageName) {
  const progress = await ProductionProgress.findOne({ srdId });
  
  // Mark current stage complete
  const stageIndex = progress.stages.findIndex(s => s.stageName === stageName);
  progress.stages[stageIndex].status = 'completed';
  progress.stages[stageIndex].completedAt = new Date();
  
  // Move to next stage
  const nextStage = await getNextStage(stageName);
  if (nextStage) {
    progress.currentStage = nextStage.name;
    progress.stages[stageIndex + 1].status = 'in-progress';
    progress.stages[stageIndex + 1].startedAt = new Date();
  } else {
    // All stages complete
    progress.completedAt = new Date();
    srd.inProduction = false;
    srd.productionEndDate = new Date();
  }
  
  await progress.save();
}
```

---

## Implementation Plan

### Phase 1: Database & Models ✅
- [x] ProductionStage model
- [x] ProductionProgress model
- [x] Seed default stages

### Phase 2: API Endpoints
- [ ] Production stages CRUD
- [ ] Production progress tracking
- [ ] Stage completion logic
- [ ] Auto-trigger on approval

### Phase 3: Admin UI
- [ ] Production stages management
- [ ] User assignment to stages
- [ ] Stage reordering

### Phase 4: Production Dashboards
- [ ] Stage-specific dashboards
- [ ] Production manager dashboard
- [ ] SRD production timeline view

### Phase 5: Integration
- [ ] Hook into approval workflow
- [ ] Notifications for stage changes
- [ ] Production analytics

---

## Next Steps

Run this to seed default production stages:
```bash
npm run seed:production
```

Then I'll implement the API endpoints and UI components.

---

This is a comprehensive production workflow system that will transform your SRD tracking into a full production management solution! 🏭✨