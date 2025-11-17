# Dynamic Dashboard System Documentation

## Overview

The SRD Tracking System now features **fully dynamic dashboards** that automatically adapt to your department configuration. Every department gets its own customized dashboard without any code changes.

## Key Features

### 🎯 Automatic Dashboard Generation
- Dashboards are created automatically for any department in your database
- No code changes needed to add new department dashboards
- Each dashboard shows department-specific data and fields

### 📊 Dynamic Statistics
- Real-time stats based on configured stages
- Department-specific SRD counts
- Progress tracking per stage
- Customizable metrics

### 🎨 Customizable Views
- Card view or table view for SRDs
- Color-coded stages from your configuration
- Department-specific fields display
- Responsive design

### 🔄 Dynamic Navigation
- Sidebar menu adapts to user's department
- Quick access to department-specific pages
- Admin gets full system access
- Department users see relevant links only

## How It Works

### URL Structure

```
/dashboard/[department]        - Department dashboard
/dashboard/[department]/create - Create SRD for department
```

Examples:
- `/dashboard/admin` - Admin dashboard
- `/dashboard/vmd` - VMD dashboard
- `/dashboard/cad` - CAD dashboard
- `/dashboard/quality-assurance` - QA dashboard (if configured)

### Dynamic Routing

The system uses Next.js dynamic routes with `[department]` parameter:

```javascript
// Route: /dashboard/[department]/page.jsx
// Matches: /dashboard/vmd, /dashboard/cad, /dashboard/any-dept
```

### Data Flow

```
User visits /dashboard/vmd
         ↓
System fetches department from database
         ↓
Loads department-specific:
  - SRDs
  - Stages
  - Fields
  - Statistics
         ↓
Renders customized dashboard
```

## Components

### 1. Dynamic Dashboard Page
**File**: `src/app/dashboard/[department]/page.jsx`

Features:
- Fetches department data from database
- Displays department-specific SRDs
- Shows stats for each configured stage
- Lists department fields
- Provides quick actions
- Supports card/table view toggle

### 2. Dynamic Create Page
**File**: `src/app/dashboard/[department]/create/page.jsx`

Features:
- Loads department-specific fields
- Renders appropriate input types
- Validates required fields
- Creates SRD with dynamic data
- Initializes status for all departments

### 3. Dynamic Sidebar
**File**: `src/components/layout/DynamicSidebar.js`

Features:
- Fetches departments from database
- Builds menu based on user role
- Admin sees all config pages
- Department users see their pages
- Highlights active page

### 4. Dashboard API
**File**: `src/app/api/dashboard/[department]/route.js`

Provides:
- Department information
- Statistics by stage
- Recent SRDs
- Active stages
- Department fields

## Usage

### For Administrators

#### Create a New Department Dashboard

1. **Add Department**
   ```
   Go to /departments
   Click "Add New Department"
   Enter: Name = "Quality Assurance", Slug = "qa"
   Save
   ```

2. **Configure Stages** (optional)
   ```
   Go to /stages
   Assign stages to the new department
   Or leave empty to use all stages
   ```

3. **Add Fields** (optional)
   ```
   Go to /srdfields
   Create department-specific fields
   Set department = "qa"
   ```

4. **Access Dashboard**
   ```
   Navigate to /dashboard/qa
   Dashboard is automatically available!
   ```

#### No Code Changes Required!

The dashboard is automatically:
- ✅ Created with the department
- ✅ Accessible via URL
- ✅ Populated with data
- ✅ Customized with fields
- ✅ Integrated with navigation

### For Department Users

#### Accessing Your Dashboard

1. Login with your department credentials
2. You'll see your department dashboard
3. Sidebar shows department-specific links

#### Dashboard Features

**Statistics Cards**
- Total SRDs assigned to your department
- Count by each stage (Pending, In Progress, etc.)
- Color-coded for easy identification

**Department Fields**
- Shows all fields configured for your department
- Indicates required fields with *
- Displays both global and department-specific fields

**SRD List**
- View all SRDs assigned to your department
- Switch between card and table view
- Click to view details

**Quick Actions**
- Create new SRD
- View filtered SRDs
- Access department-specific pages

## Configuration

### Department Setup

```javascript
// Example: Add a new department via API
POST /api/departments
{
  "name": "Quality Assurance",
  "slug": "qa",
  "description": "Quality control and testing"
}

// Dashboard automatically available at:
// /dashboard/qa
```

### Stage Assignment

```javascript
// Assign stages to specific departments
POST /api/stages
{
  "name": "QA Testing",
  "slug": "qa-testing",
  "color": "#10B981",
  "icon": "CheckCircle",
  "departments": ["qa", "mmc"],  // Only for these departments
  "order": 3
}
```

### Field Configuration

```javascript
// Add department-specific fields
POST /api/newField
{
  "name": "Test Results",
  "type": "textarea",
  "department": "qa",  // Only for QA department
  "isRequired": true
}
```

## API Endpoints

### Get Dashboard Data
```
GET /api/dashboard/[department]
```

Response:
```json
{
  "success": true,
  "data": {
    "department": {
      "_id": "...",
      "name": "Quality Assurance",
      "slug": "qa",
      "description": "..."
    },
    "stats": {
      "total": 25,
      "byStage": {
        "pending": 5,
        "in-progress": 10,
        "approved": 8,
        "flagged": 2
      }
    },
    "stages": [...],
    "fields": [...],
    "recentSRDs": [...]
  }
}
```

### Get Department SRDs
```
GET /api/srd?department=[slug]
```

### Create SRD for Department
```
POST /api/srd/create
{
  "title": "...",
  "description": "...",
  "dynamicFields": [...],
  "status": {
    "qa": "pending",
    "vmd": "pending",
    ...
  }
}
```

## Customization

### Dashboard Layout

The dashboard automatically adapts to:
- Number of stages (shows up to 3 in stats)
- Department fields (displays all configured)
- User permissions (admin vs department user)

### Statistics Display

Stats are calculated dynamically:
```javascript
// Counts SRDs by stage
stats.byStage = {
  'pending': 5,
  'in-progress': 10,
  'approved': 8,
  'flagged': 2
}
```

### Color Coding

Stages use colors from configuration:
```javascript
// Stage color from database
<div style={{ backgroundColor: stage.color }} />
```

## Examples

### Example 1: Add Logistics Department

```bash
# 1. Create department
curl -X POST http://localhost:3000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Logistics",
    "slug": "logistics",
    "description": "Shipping and distribution"
  }'

# 2. Add department-specific field
curl -X POST http://localhost:3000/api/newField \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shipping Method",
    "type": "text",
    "department": "logistics",
    "isRequired": true
  }'

# 3. Access dashboard
# Navigate to: http://localhost:3000/dashboard/logistics
```

### Example 2: Customize Existing Department

```bash
# 1. Add new stage for CAD
curl -X POST http://localhost:3000/api/stages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pattern Review",
    "slug": "pattern-review",
    "color": "#8B5CF6",
    "icon": "Eye",
    "departments": ["cad"],
    "order": 2
  }'

# 2. Add CAD-specific field
curl -X POST http://localhost:3000/api/newField \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pattern File",
    "type": "file",
    "department": "cad",
    "isRequired": false
  }'

# Dashboard at /dashboard/cad automatically shows:
# - New "Pattern Review" stage in stats
# - "Pattern File" field in department fields
```

### Example 3: Multi-Department Workflow

```javascript
// Create SRD that flows through multiple departments
const srd = {
  title: "Summer Collection T-Shirt",
  description: "New design for summer line",
  status: {
    vmd: "approved",      // VMD approved
    cad: "in-progress",   // CAD working
    commercial: "pending", // Commercial waiting
    mmc: "pending",       // MMC waiting
    logistics: "pending"  // Logistics waiting
  },
  dynamicFields: [
    // VMD fields
    { field: "...", department: "vmd", value: "T-Shirt" },
    // CAD fields
    { field: "...", department: "cad", value: "2.5 meters" },
    // Logistics fields
    { field: "...", department: "logistics", value: "Air Freight" }
  ]
};

// Each department sees their status and fields in their dashboard
```

## Advanced Features

### Conditional Dashboard Elements

```javascript
// Show create button only for certain departments
const canCreate = ['vmd', 'cad', 'commercial', 'mmc', 'admin'].includes(departmentSlug);

{canCreate && (
  <Button>Create SRD</Button>
)}
```

### Department-Specific Actions

```javascript
// Admin dashboard shows system management
{departmentSlug === 'admin' && (
  <Card>
    <CardTitle>Quick Actions</CardTitle>
    <Button>Manage Departments</Button>
    <Button>Manage Stages</Button>
  </Card>
)}
```

### Dynamic Field Rendering

```javascript
// Renders appropriate input based on field type
switch (field.type) {
  case 'textarea':
    return <Textarea />;
  case 'number':
    return <Input type="number" />;
  case 'date':
    return <Input type="date" />;
  case 'boolean':
    return <Checkbox />;
  default:
    return <Input type="text" />;
}
```

## Performance Optimization

### Data Fetching

```javascript
// Parallel fetching for better performance
const [deptData, srdData, stagesData, fieldsData] = await Promise.all([
  fetch('/api/departments'),
  fetch('/api/srd?department=...'),
  fetch('/api/stages'),
  fetch('/api/newField')
]);
```

### Caching Strategy

```javascript
// Client-side caching with React state
const [departments, setDepartments] = useState([]);
const [stages, setStages] = useState([]);

// Fetch once, use multiple times
useEffect(() => {
  fetchData();
}, []);
```

## Security

### Access Control

```javascript
// Verify user has access to department
if (!session || session.user.role !== departmentSlug) {
  router.push('/login');
  return;
}
```

### Department Validation

```javascript
// Ensure department exists before showing dashboard
const dept = departments.find(d => d.slug === departmentSlug);
if (!dept && departmentSlug !== 'admin') {
  router.push('/dashboard/admin');
  return;
}
```

## Troubleshooting

### Dashboard Not Loading

**Issue**: Dashboard shows loading spinner indefinitely

**Solutions**:
1. Check department exists in database
2. Verify MongoDB connection
3. Check browser console for errors
4. Ensure API endpoints are accessible

### Stats Not Showing

**Issue**: Statistics cards show 0 or incorrect numbers

**Solutions**:
1. Verify SRDs have status field
2. Check stage slugs match database
3. Ensure department slug is correct
4. Review SRD status structure

### Fields Not Appearing

**Issue**: Department fields don't show in dashboard

**Solutions**:
1. Check fields are marked as active
2. Verify department assignment
3. Ensure field department matches dashboard
4. Check global fields are included

### Create Page Errors

**Issue**: Can't create SRD from department dashboard

**Solutions**:
1. Verify all required fields are filled
2. Check field validation
3. Ensure departments are loaded
4. Review API response for errors

## Best Practices

### Department Naming

- Use clear, descriptive names
- Keep slugs short and URL-friendly
- Use lowercase with hyphens for slugs
- Avoid special characters

### Stage Configuration

- Assign stages to specific departments when needed
- Use distinct colors for visual clarity
- Order stages logically
- Keep stage names concise

### Field Design

- Group related fields by department
- Use appropriate field types
- Set required only when necessary
- Provide helpful placeholders

### Dashboard Customization

- Start with default layout
- Add department-specific sections as needed
- Keep statistics relevant
- Maintain consistent design

## Migration from Static Dashboards

### Step 1: Identify Departments

List all current departments:
- VMD
- CAD
- Commercial
- MMC
- Any custom departments

### Step 2: Create Department Records

```bash
# For each department
npm run seed:dynamic  # Creates default departments

# Or manually via API
POST /api/departments
```

### Step 3: Configure Stages

```bash
# Assign stages to departments
# Or leave empty for all departments
```

### Step 4: Migrate Fields

```bash
# Convert hardcoded fields to dynamic fields
POST /api/newField
```

### Step 5: Update Routes

```bash
# Old: /dashboard/vmd
# New: /dashboard/vmd (same URL, dynamic backend)

# Old: /dashboard/custom-dept (404)
# New: /dashboard/custom-dept (works automatically!)
```

### Step 6: Test

1. Access each department dashboard
2. Verify stats display correctly
3. Test SRD creation
4. Check field rendering
5. Validate permissions

## Future Enhancements

Potential additions:
- [ ] Dashboard widgets (drag-and-drop)
- [ ] Custom chart types
- [ ] Export dashboard data
- [ ] Dashboard templates
- [ ] Real-time updates
- [ ] Department-specific themes
- [ ] Custom KPIs
- [ ] Dashboard sharing
- [ ] Mobile app views
- [ ] Dashboard analytics

## Summary

The dynamic dashboard system provides:

- **Flexibility**: Add departments without code changes
- **Scalability**: Handles unlimited departments
- **Customization**: Each department gets tailored view
- **Maintainability**: Single codebase for all dashboards
- **Performance**: Optimized data fetching
- **Security**: Role-based access control

Every department automatically gets:
- ✅ Dedicated dashboard
- ✅ Custom statistics
- ✅ Department fields display
- ✅ SRD creation page
- ✅ Filtered SRD views
- ✅ Navigation integration

**No code changes required!** Just configure departments, stages, and fields through the UI.

---

**Status**: ✅ Fully Implemented and Operational
**Documentation**: Complete
**Testing**: Ready for use
