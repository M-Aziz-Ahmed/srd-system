# Complete Production Workflow System

## Overview

Your SRD system now has a complete production workflow with proper role restrictions and automated stage progression.

## 🎯 Key Features

### 1. Role-Based Access Control

**VMD (Visual Merchandising & Design)**
- ✅ **ONLY role that can create SRDs**
- ✅ Initiates all sample requests
- ✅ Views all SRDs
- ✅ Approves final samples

**Department Managers (CAD, Commercial, MMC)**
- ✅ View assigned SRDs
- ✅ Update department status
- ✅ Add comments and notes
- ❌ **Cannot create SRDs**

**Production Manager**
- ✅ Manages all production activities
- ✅ Starts production for approved SRDs
- ✅ Tracks progress through stages
- ✅ Completes production stages
- ✅ Reports issues
- ❌ **Cannot create SRDs**
- ❌ **Cannot approve departments**

**Admin**
- ✅ Full system access
- ✅ User management
- ✅ System configuration
- ✅ Views all data
- ❌ **Does NOT manage production** (delegated to Production Manager)

### 2. Automated Production Workflow

```
SRD Created (VMD)
      ↓
Department Approvals (Pending → In Progress → Approved)
      ↓
All Approved → Ready for Production
      ↓
Production Manager Starts Production
      ↓
Automatic Stage Progression:
  1. Fabric Sourcing (7 days)
  2. Cutting (3 days)
  3. Sewing (5 days)
  4. Quality Check (2 days)
  5. Finishing (2 days)
  6. Shipping (1 day)
      ↓
Production Complete
```

### 3. Production Stage Management

**Dynamic Stages**
- Create unlimited production stages
- Set estimated duration
- Color-coded visualization
- Automatic progress calculation

**Stage Tracking**
- Current stage indicator
- Progress percentage
- Completion history
- Notes and comments

## 📁 Files Created/Updated

### New Files
1. `src/models/ProductionManager.js` - Production manager model
2. `src/app/dashboard/production-manager/page.jsx` - Production manager dashboard
3. `src/components/ProductionControl.jsx` - Production control component
4. `src/app/api/srd/[id]/production/route.js` - Production API

### Updated Files
5. `src/components/layout/DynamicSidebar.js` - Role-based navigation
6. `src/app/dashboard/[department]/create/page.jsx` - VMD-only restriction
7. `src/app/srd/[id]/page.js` - Added production control
8. `src/app/production/page.jsx` - Access restriction
9. `src/app/production-stages/page.jsx` - Access restriction
10. `src/lib/seedDynamic.js` - Added default users

## 🚀 Quick Start

### 1. Run Migration (if needed)
```bash
npm run migrate:users
```

### 2. Seed Database
```bash
npm run seed:dynamic
```

This creates:
- 4 departments
- 5 workflow stages
- 6 production stages
- 6 sample fields
- 3 default users:
  - admin@demo.com (Admin)
  - vmd@demo.com (VMD Manager)
  - production@demo.com (Production Manager)

### 3. Start Server
```bash
npm run dev
```

### 4. Login and Test

**As VMD (vmd@demo.com / password)**
1. Create new SRD
2. Fill in details
3. Submit

**As Department Manager (cad@demo.com / password)**
1. View assigned SRDs
2. Update status
3. Add comments

**As Production Manager (production@demo.com / password)**
1. View ready SRDs
2. Start production
3. Complete stages
4. Track progress

## 📖 User Guide

### For VMD Managers

#### Create SRD
1. Login as VMD
2. Go to Dashboard
3. Click "Create SRD"
4. Fill in:
   - Title
   - Description
   - Dynamic fields
5. Submit
6. SRD created with status "Pending" for all departments

#### Monitor Progress
1. View dashboard
2. See SRD progress
3. Check department statuses
4. View when ready for production

### For Department Managers

#### Review SRD
1. Login with department credentials
2. View assigned SRDs
3. Click on SRD
4. Review details

#### Update Status
1. Open SRD
2. Go to your department tab
3. Update status:
   - Pending → In Progress
   - In Progress → Approved
   - Or Flag if issues
4. Add comments
5. Save

### For Production Manager

#### Start Production
1. Login as Production Manager
2. Go to Dashboard
3. See "Ready to Start Production" section
4. Click on SRD
5. Click "Start Production"
6. Production begins at first stage

#### Complete Stage
1. Open SRD in production
2. View current stage
3. Click "Complete Stage"
4. Enter:
   - Your name
   - Notes (optional)
5. Submit
6. Automatically moves to next stage

#### Track Progress
1. View Production Dashboard
2. See all SRDs in production
3. Monitor progress percentages
4. View stage distribution
5. Check estimated timelines

#### Report Issues
1. Open SRD
2. Click "Report Issue"
3. Stage marked as "Issue"
4. Add notes
5. Resolve and continue

## 🔧 API Endpoints

### Production Management

```javascript
// Start production
POST /api/srd/[id]/production
// Response: Starts production at first stage

// Complete current stage
PATCH /api/srd/[id]/production
{
  "action": "complete_stage",
  "completedBy": "John Doe",
  "notes": "Stage completed successfully"
}
// Response: Moves to next stage or completes production

// Update stage status
PATCH /api/srd/[id]/production
{
  "action": "update_stage",
  "status": "on-hold",
  "notes": "Waiting for materials"
}

// Get production status
GET /api/srd/[id]/production
// Response: Full production details
```

## 💡 Workflow Examples

### Example 1: Complete SRD Lifecycle

```javascript
// 1. VMD creates SRD
POST /api/srd/create
{
  "title": "Summer T-Shirt",
  "description": "New design",
  "createdBy": { name: "VMD Manager", role: "vmd" }
}
// Status: All departments = "pending"

// 2. Departments approve
PATCH /api/srd/[id]/department/cad
{ "status": "approved" }

PATCH /api/srd/[id]/department/commercial
{ "status": "approved" }

PATCH /api/srd/[id]/department/mmc
{ "status": "approved" }

PATCH /api/srd/[id]/department/vmd
{ "status": "approved" }
// Result: readyForProduction = true

// 3. Production Manager starts production
POST /api/srd/[id]/production
// Result: inProduction = true, currentStage = "Fabric Sourcing"

// 4. Complete stages
PATCH /api/srd/[id]/production
{ "action": "complete_stage", "completedBy": "Production Team" }
// Moves through: Cutting → Sewing → Quality Check → Finishing → Shipping

// 5. Production complete
// Result: productionProgress = 100%, productionEndDate set
```

### Example 2: Handle Production Issue

```javascript
// During production, issue found
PATCH /api/srd/[id]/production
{
  "action": "update_stage",
  "status": "issue",
  "notes": "Fabric quality issue, waiting for replacement"
}

// After resolution
PATCH /api/srd/[id]/production
{
  "action": "update_stage",
  "status": "in-progress",
  "notes": "Issue resolved, continuing production"
}

// Complete stage
PATCH /api/srd/[id]/production
{
  "action": "complete_stage",
  "completedBy": "Production Manager",
  "notes": "Completed with replacement fabric"
}
```

## 🎨 UI Features

### Production Manager Dashboard
- Ready for production count
- In production count
- Average progress
- Stage distribution
- Quick actions

### Production Control Component
- Current stage display
- Progress bar
- Stage completion
- Issue reporting
- Production history
- Timeline view

### SRD Detail Page
- Department status overview
- Production control (for Production Manager)
- Stage history
- Comments and notes
- Audit trail

## 🔒 Security & Permissions

### Access Control Matrix

| Feature | VMD | Dept Manager | Production Manager | Admin |
|---------|-----|--------------|-------------------|-------|
| Create SRD | ✅ | ❌ | ❌ | ❌ |
| View SRDs | ✅ | ✅ (assigned) | ✅ (all) | ✅ (all) |
| Approve Dept | ✅ | ✅ (own) | ❌ | ✅ |
| Start Production | ❌ | ❌ | ✅ | ✅ |
| Complete Stages | ❌ | ❌ | ✅ | ✅ |
| Manage Stages | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |

### Route Protection

```javascript
// VMD-only routes
/dashboard/vmd/create - Only VMD can access

// Production Manager routes
/dashboard/production-manager - Only Production Manager
/production - Production Manager + Admin
/production-stages - Production Manager + Admin

// Department routes
/dashboard/[department] - Department members only

// Admin routes
/users - Admin only
/settings - Admin only
```

## 📊 Data Models

### SRD Production Fields
```javascript
{
  // Approval workflow
  status: Map<department, status>,
  progress: Number (0-100),
  readyForProduction: Boolean,
  
  // Production tracking
  inProduction: Boolean,
  productionStartDate: Date,
  productionEndDate: Date,
  currentProductionStage: ObjectId,
  productionProgress: Number (0-100),
  productionHistory: [{
    stage: ObjectId,
    stageName: String,
    startDate: Date,
    endDate: Date,
    completedBy: String,
    notes: String,
    status: String (in-progress, completed, on-hold, issue)
  }]
}
```

## 🎯 Best Practices

### For VMD
1. Create detailed SRD descriptions
2. Fill all required fields
3. Monitor department progress
4. Review before production

### For Department Managers
1. Review SRDs promptly
2. Update status regularly
3. Add detailed comments
4. Flag issues immediately

### For Production Manager
1. Start production when ready
2. Complete stages on time
3. Document issues
4. Track progress daily
5. Communicate delays

## 🚀 Advanced Features

### Automatic Progress Calculation
```javascript
// Department approval progress
progress = (approvedDepts / totalDepts) * 100

// Production progress
productionProgress = (completedStages / totalStages) * 100
```

### Stage Auto-Progression
```javascript
// When stage completed:
1. Mark current stage as completed
2. Find next stage by order
3. Create new history entry
4. Update current stage
5. Calculate progress
6. Add audit entry
```

### Production History Tracking
```javascript
// Each stage records:
- Stage name
- Start date
- End date
- Completed by
- Notes
- Status
```

## 📈 Metrics & Reporting

### Available Metrics
- Total SRDs in production
- Average production progress
- SRDs per stage
- Stage completion times
- Issue frequency
- Production throughput

### Dashboard Views
- Ready for production
- Currently in production
- Completed production
- Stage distribution
- Progress trends

## 🔄 Integration Points

### With Existing System
- Seamless transition from approval to production
- Automatic status updates
- Unified audit trail
- Consistent user experience

### Future Enhancements
- [ ] Production scheduling
- [ ] Resource allocation
- [ ] Automated notifications
- [ ] Production reports
- [ ] Performance analytics
- [ ] Mobile app for production floor

## 📝 Summary

Your SRD system now has:

**Complete Role Separation**
- ✅ VMD creates SRDs
- ✅ Departments approve
- ✅ Production Manager handles production
- ✅ Admin manages system

**Automated Workflow**
- ✅ Automatic stage progression
- ✅ Progress calculation
- ✅ Status tracking
- ✅ History recording

**Production Management**
- ✅ Dynamic stages
- ✅ Stage completion
- ✅ Issue tracking
- ✅ Timeline view

**Security**
- ✅ Role-based access
- ✅ Route protection
- ✅ Permission checks
- ✅ Audit trail

---

**Status**: ✅ Complete and Operational
**Ready for**: Production Use
**Documentation**: Comprehensive
