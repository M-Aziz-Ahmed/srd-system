# User Management & Production Tracking - Complete Guide

## Overview

Your SRD system now includes:
1. **Complete User Management System** - Create, edit, and manage users
2. **Production Tracking System** - Track SRDs through dynamic production stages

## 🎯 New Features

### 1. User Management System

**Page**: `/users`

#### Features
- ✅ Create new users with any role
- ✅ Edit existing users
- ✅ Delete users
- ✅ Activate/deactivate users
- ✅ Search and filter users
- ✅ View user statistics
- ✅ Dynamic role assignment based on departments

#### User Fields
- **Name**: Full name of the user
- **Email**: Unique email address (login credential)
- **Password**: Secure password (hashed automatically)
- **Role**: Can be admin or any department slug
- **Department**: Optional department assignment
- **Status**: Active/Inactive

#### Statistics Displayed
- Total users
- Active users
- Inactive users
- Admin count

### 2. Production Tracking System

**Pages**: 
- `/production` - View SRDs in production
- `/production-stages` - Manage production stages

#### Features
- ✅ Dynamic production stages
- ✅ Track SRD progress through production
- ✅ Stage-based workflow
- ✅ Estimated duration per stage
- ✅ Production history tracking
- ✅ Visual progress indicators
- ✅ Color-coded stages

#### Production Stage Fields
- **Name**: Stage name (e.g., "Cutting", "Sewing")
- **Slug**: URL-friendly identifier
- **Description**: Stage description
- **Color**: Visual color coding
- **Icon**: Lucide icon name
- **Order**: Sequence in workflow
- **Estimated Duration**: Days to complete
- **Status**: Active/Inactive

## 📁 Files Created

### User Management
1. `src/app/users/page.jsx` - User management UI
2. `src/app/api/users/route.js` - User CRUD API (updated)
3. `src/app/api/users/[id]/route.js` - Individual user API
4. `src/models/User.js` - User model (updated)

### Production Tracking
5. `src/app/production/page.jsx` - Production tracking dashboard
6. `src/app/production-stages/page.jsx` - Production stages management
7. `src/app/api/production-stages/route.js` - Production stages API
8. `src/app/api/production-stages/[id]/route.js` - Individual stage API
9. `src/models/ProductionStage.js` - Production stage model
10. `src/models/SRD.js` - SRD model (updated with production fields)

### Updates
11. `src/app/settings/page.jsx` - Added new pages to settings hub
12. `src/components/layout/DynamicSidebar.js` - Added navigation links
13. `src/lib/seedDynamic.js` - Added production stages and admin user seeding

## 🚀 Quick Start

### 1. Seed the Database
```bash
npm run seed:dynamic
```

This creates:
- 4 departments
- 5 workflow stages
- 6 production stages
- 6 sample fields
- 1 admin user (admin@demo.com / password)

### 2. Access User Management
```
http://localhost:3000/users
```

### 3. Access Production Tracking
```
http://localhost:3000/production
```

### 4. Manage Production Stages
```
http://localhost:3000/production-stages
```

## 📖 Usage Guide

### User Management

#### Create a New User

1. Go to `/users`
2. Click "Add User"
3. Fill in the form:
   - Name: John Doe
   - Email: john@example.com
   - Password: securepassword
   - Role: Select from dropdown (admin or department)
   - Department: Optional (e.g., "Design Team")
   - Active: Check to enable
4. Click "Create User"

#### Edit a User

1. Find the user in the table
2. Click the "Edit" button
3. Modify fields (leave password empty to keep current)
4. Click "Update User"

#### Activate/Deactivate User

1. Find the user in the table
2. Click the activate/deactivate icon
3. User status changes immediately

#### Delete a User

1. Find the user in the table
2. Click the "Delete" button
3. Confirm deletion
4. User is permanently removed

### Production Tracking

#### Configure Production Stages

1. Go to `/production-stages`
2. Click "Add Production Stage"
3. Fill in:
   - Name: "Cutting"
   - Description: "Fabric cutting process"
   - Color: Pick a color
   - Icon: "Scissors"
   - Order: 1
   - Duration: 3 days
4. Click "Create Stage"

#### View SRDs in Production

1. Go to `/production`
2. See all SRDs currently in production
3. View current stage for each SRD
4. Monitor production progress
5. Click "View Details" to see full history

#### Move SRD to Production

When an SRD is approved by all departments:
1. SRD automatically marked as `readyForProduction: true`
2. Admin can move it to production
3. Set `inProduction: true`
4. Assign first production stage
5. Track progress through stages

## 🔧 API Endpoints

### User Management

```javascript
// Get all users
GET /api/users

// Create user
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "vmd",
  "department": "Design",
  "isActive": true
}

// Get user by ID
GET /api/users/[id]

// Update user
PATCH /api/users/[id]
{
  "name": "John Updated",
  "isActive": false
}

// Delete user
DELETE /api/users/[id]
```

### Production Stages

```javascript
// Get all production stages
GET /api/production-stages

// Create production stage
POST /api/production-stages
{
  "name": "Cutting",
  "slug": "cutting",
  "description": "Fabric cutting process",
  "color": "#8B5CF6",
  "icon": "Scissors",
  "order": 1,
  "estimatedDuration": 3,
  "isActive": true
}

// Get stage by ID
GET /api/production-stages/[id]

// Update stage
PATCH /api/production-stages/[id]

// Delete stage (soft delete)
DELETE /api/production-stages/[id]
```

### SRD Production Tracking

```javascript
// Get SRDs in production
GET /api/srd?inProduction=true

// Update SRD production status
PATCH /api/srd/[id]
{
  "inProduction": true,
  "productionStartDate": "2025-11-13",
  "currentProductionStage": "stage_id",
  "productionProgress": 25,
  "productionHistory": [{
    "stage": "stage_id",
    "stageName": "Cutting",
    "startDate": "2025-11-13",
    "status": "completed",
    "completedBy": "John Doe",
    "notes": "Completed successfully"
  }]
}
```

## 💡 Examples

### Example 1: Create Department Manager

```javascript
// Via API
POST /api/users
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure123",
  "role": "cad",  // CAD department
  "department": "CAD Team",
  "isActive": true
}

// Jane can now:
// - Login with jane@example.com
// - Access CAD dashboard
// - Manage CAD SRDs
```

### Example 2: Setup Production Workflow

```javascript
// 1. Create production stages
const stages = [
  { name: "Fabric Sourcing", order: 0, duration: 7 },
  { name: "Cutting", order: 1, duration: 3 },
  { name: "Sewing", order: 2, duration: 5 },
  { name: "Quality Check", order: 3, duration: 2 },
  { name: "Finishing", order: 4, duration: 2 },
  { name: "Shipping", order: 5, duration: 1 }
];

// 2. When SRD approved, move to production
PATCH /api/srd/[id]
{
  "inProduction": true,
  "productionStartDate": new Date(),
  "currentProductionStage": stages[0]._id,
  "productionProgress": 0
}

// 3. Update as stages complete
PATCH /api/srd/[id]
{
  "currentProductionStage": stages[1]._id,
  "productionProgress": 20,
  "productionHistory": [
    {
      "stage": stages[0]._id,
      "stageName": "Fabric Sourcing",
      "startDate": "2025-11-13",
      "endDate": "2025-11-20",
      "status": "completed",
      "completedBy": "John Doe"
    }
  ]
}
```

### Example 3: Track Production Progress

```javascript
// Get production overview
GET /api/production-stages
// Returns all stages with estimated durations

// Get SRDs in each stage
GET /api/srd?inProduction=true
// Filter by currentProductionStage

// Calculate overall progress
const totalStages = 6;
const completedStages = srd.productionHistory.length;
const progress = (completedStages / totalStages) * 100;
```

## 🎨 UI Features

### User Management UI

**Search & Filter**
- Search by name, email, or role
- Real-time filtering
- Clear visual indicators

**User Cards**
- Avatar with initials
- Name and email display
- Role badge with color coding
- Status badge (Active/Inactive)
- Created date
- Quick actions (Edit, Activate/Deactivate, Delete)

**Statistics Dashboard**
- Total users count
- Active users count
- Inactive users count
- Admin users count

### Production Tracking UI

**Production Dashboard**
- Total SRDs in production
- Average production progress
- Active production stages count
- Ready for production count

**Stage Overview**
- Visual stage cards
- Color-coded stages
- SRD count per stage
- Estimated duration display

**SRD Production Cards**
- Current stage indicator
- Progress bar
- Start date
- Completed stages count
- Quick link to details

## 🔒 Security

### User Management
- Passwords automatically hashed with bcrypt
- Passwords never returned in API responses
- Email uniqueness enforced
- Role-based access control
- Admin-only access to user management

### Production Tracking
- Only authorized users can update production status
- Production history immutable once created
- Audit trail for all changes
- Stage transitions validated

## 📊 Data Models

### User Model
```javascript
{
  email: String (unique, required),
  name: String (required),
  password: String (hashed, required),
  role: String (required),
  department: String (optional),
  isActive: Boolean (default: true),
  createdAt: Date,
  lastLogin: Date
}
```

### Production Stage Model
```javascript
{
  name: String (required),
  slug: String (unique, required),
  description: String,
  color: String (default: '#6B7280'),
  icon: String (default: 'Package'),
  order: Number (default: 0),
  isActive: Boolean (default: true),
  estimatedDuration: Number (days),
  requirements: [{
    name: String,
    description: String,
    isRequired: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### SRD Production Fields
```javascript
{
  // ... existing SRD fields ...
  
  inProduction: Boolean,
  productionStartDate: Date,
  productionEndDate: Date,
  currentProductionStage: ObjectId (ref: ProductionStage),
  productionProgress: Number (0-100),
  productionHistory: [{
    stage: ObjectId (ref: ProductionStage),
    stageName: String,
    startDate: Date,
    endDate: Date,
    completedBy: String,
    notes: String,
    status: String (in-progress, completed, on-hold, issue)
  }]
}
```

## 🎯 Workflow

### Complete SRD Lifecycle

```
1. SRD Created (VMD)
   ↓
2. Department Approvals (VMD, CAD, Commercial, MMC)
   ↓
3. All Approved → readyForProduction: true
   ↓
4. Move to Production → inProduction: true
   ↓
5. Production Stages:
   - Fabric Sourcing (7 days)
   - Cutting (3 days)
   - Sewing (5 days)
   - Quality Check (2 days)
   - Finishing (2 days)
   - Shipping (1 days)
   ↓
6. Production Complete → productionEndDate set
   ↓
7. Shipped to Customer
```

## 🔄 Integration

### With Existing System

**Departments**
- Users can be assigned to any department
- Role field uses department slugs
- Dynamic role creation based on departments

**Stages**
- Workflow stages (approval process)
- Production stages (manufacturing process)
- Both fully dynamic and customizable

**SRDs**
- Approval workflow uses department stages
- Production workflow uses production stages
- Seamless transition between phases

## 📈 Benefits

### User Management
- ✅ Self-service user creation
- ✅ No code changes for new users
- ✅ Dynamic role assignment
- ✅ Easy user activation/deactivation
- ✅ Comprehensive user overview

### Production Tracking
- ✅ Visual production monitoring
- ✅ Stage-based progress tracking
- ✅ Estimated timelines
- ✅ Production history
- ✅ Bottleneck identification
- ✅ Performance metrics

## 🎓 Best Practices

### User Management
1. Use descriptive names
2. Assign appropriate roles
3. Deactivate instead of delete when possible
4. Regular password updates
5. Monitor user activity

### Production Tracking
1. Define clear stage boundaries
2. Set realistic duration estimates
3. Update progress regularly
4. Document stage transitions
5. Track issues and delays
6. Review and optimize workflow

## 🚀 Future Enhancements

Potential additions:
- [ ] User permissions matrix
- [ ] User groups/teams
- [ ] Production stage dependencies
- [ ] Automated stage transitions
- [ ] Production alerts and notifications
- [ ] Stage-specific requirements checklist
- [ ] Production analytics dashboard
- [ ] Export production reports
- [ ] Mobile production tracking
- [ ] Real-time production updates

## 📝 Summary

Your SRD system now includes:

**User Management**
- Complete CRUD operations
- Dynamic role assignment
- Search and filtering
- User statistics
- Activation/deactivation

**Production Tracking**
- Dynamic production stages
- Progress monitoring
- Stage-based workflow
- Production history
- Visual dashboards

**All Features**
- ✅ No code changes needed
- ✅ Fully dynamic
- ✅ Customizable workflows
- ✅ Real-time updates
- ✅ Comprehensive tracking

---

**Status**: ✅ Complete and Operational
**Documentation**: Comprehensive
**Ready for**: Production Use
