# Dynamic System Documentation

## Overview

The SRD Tracking System now features a fully dynamic and customizable architecture. Administrators can configure departments, workflow stages, and custom fields without any code changes.

## Key Features

### 1. Dynamic Departments
- Create, edit, and delete departments through the UI
- Each department has a name, slug, and description
- Departments can be assigned specific fields and stages
- Access via: `/departments`

### 2. Dynamic Stages
- Configure workflow stages with custom properties:
  - Name and slug
  - Color coding for visual identification
  - Icon selection (Lucide icons)
  - Order/sequence in the workflow
  - Department-specific stages
  - Automatic vs manual stages
- Access via: `/stages`

### 3. Dynamic Fields
- Add custom fields to SRD records
- Field types supported:
  - Text
  - Number
  - Date
  - Boolean
  - Textarea
  - File Upload
  - Image Upload
- Fields can be:
  - Global (all departments)
  - Department-specific
  - Required or optional
- Access via: `/srdfields`

### 4. Settings Hub
- Central location for all system configuration
- Quick access to all dynamic management pages
- Access via: `/settings`

## Database Models

### Department Model
```javascript
{
  name: String,          // Display name
  slug: String,          // URL-friendly identifier
  description: String,   // Department description
  createdAt: Date
}
```

### Stage Model
```javascript
{
  name: String,          // Display name
  slug: String,          // URL-friendly identifier
  description: String,   // Stage description
  color: String,         // Hex color code
  icon: String,          // Lucide icon name
  order: Number,         // Display order
  isActive: Boolean,     // Active/inactive status
  departments: [ObjectId], // Applicable departments
  isAutomatic: Boolean,  // Auto-calculated stage
  rules: Map,            // Automation rules
  createdAt: Date,
  updatedAt: Date
}
```

### Field Model
```javascript
{
  name: String,          // Display name
  type: String,          // Field type
  placeholder: String,   // Placeholder text
  department: String,    // Department slug or 'global'
  isRequired: Boolean,   // Required field
  slug: String,          // URL-friendly identifier
  active: Boolean        // Soft delete flag
}
```

### SRD Model (Enhanced)
```javascript
{
  // ... existing fields ...
  
  dynamicFields: [{
    field: ObjectId,     // Reference to Field
    department: String,  // Department slug
    name: String,        // Field name
    slug: String,        // Field slug
    type: String,        // Field type
    value: Mixed,        // Field value
    isRequired: Boolean  // Required flag
  }],
  
  status: Map<String, String>, // Department -> Stage mapping
  
  // ... other fields ...
}
```

## API Endpoints

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department
- `GET /api/departments/[id]` - Get department details
- `PATCH /api/departments/[id]` - Update department
- `DELETE /api/departments/[id]` - Delete department

### Stages
- `GET /api/stages` - List all stages
- `POST /api/stages` - Create stage
- `GET /api/stages/[id]` - Get stage details
- `PATCH /api/stages/[id]` - Update stage
- `DELETE /api/stages/[id]` - Soft delete stage (sets isActive=false)

### Fields
- `GET /api/newField` - List all fields
- `POST /api/newField` - Create field
- `PATCH /api/newField?id=[id]` - Update field
- `DELETE /api/newField?id=[id]` - Soft delete field

## Setup Instructions

### 1. Database Setup

Run the seed script to populate initial data:

```bash
npm run seed:dynamic
```

This will create:
- 4 default departments (VMD, CAD, Commercial, MMC)
- 5 default stages (Pending, In Progress, Flagged, Approved, Ready for Production)
- 6 sample fields

### 2. Access the System

Navigate to the settings page to start configuring:

```
http://localhost:3000/settings
```

### 3. Create Your First Department

1. Go to `/departments`
2. Click "Add New Department"
3. Fill in:
   - Name: e.g., "Quality Assurance"
   - Slug: e.g., "qa" (auto-generated if empty)
   - Description: Brief description
4. Click "Create Department"

### 4. Create Custom Stages

1. Go to `/stages`
2. Click "Add New Stage"
3. Configure:
   - Name: e.g., "Under Review"
   - Color: Pick a color for visual identification
   - Icon: Choose a Lucide icon name
   - Order: Set the sequence number
   - Departments: Select applicable departments (or leave empty for all)
   - Active: Check to enable
4. Click "Create Stage"

### 5. Add Custom Fields

1. Go to `/srdfields`
2. Click "Add New Field"
3. Configure:
   - Field Name: e.g., "Fabric Type"
   - Field Type: Select from dropdown
   - Department: Choose department or "global"
   - Placeholder: Optional hint text
   - Required: Check if mandatory
4. Click "Save"

## Usage Examples

### Example 1: Adding a New Department

```javascript
// Via API
POST /api/departments
{
  "name": "Logistics",
  "slug": "logistics",
  "description": "Shipping and distribution management"
}
```

### Example 2: Creating a Custom Stage

```javascript
// Via API
POST /api/stages
{
  "name": "Awaiting Samples",
  "slug": "awaiting-samples",
  "description": "Waiting for physical samples to arrive",
  "color": "#F59E0B",
  "icon": "Package",
  "order": 2,
  "isActive": true,
  "departments": ["commercial", "mmc"],
  "isAutomatic": false
}
```

### Example 3: Adding a Custom Field

```javascript
// Via API
POST /api/newField
{
  "name": "Sustainability Rating",
  "type": "number",
  "placeholder": "1-10 scale",
  "department": "global",
  "isRequired": false,
  "slug": "sustainability-rating"
}
```

## Best Practices

### Department Management
- Use clear, descriptive names
- Keep slugs short and URL-friendly
- Document department responsibilities in descriptions
- Don't delete departments with active SRDs

### Stage Configuration
- Use distinct colors for easy visual identification
- Order stages logically in the workflow
- Mark system-calculated stages as "automatic"
- Use meaningful icon names from Lucide

### Field Design
- Keep field names concise but descriptive
- Use appropriate field types for data validation
- Set fields as required only when necessary
- Use placeholders to guide users
- Group related fields by department

### Workflow Design
1. Map your current process
2. Create departments for each team
3. Define stages for each department's workflow
4. Add fields needed at each stage
5. Test with sample SRDs
6. Iterate based on feedback

## Migration Guide

### From Hardcoded to Dynamic

If you have existing hardcoded departments/stages:

1. **Backup your data**
   ```bash
   mongodump --db srd-system
   ```

2. **Run the seed script**
   ```bash
   npm run seed:dynamic
   ```

3. **Migrate existing SRDs**
   - Update SRD status fields to use new stage slugs
   - Map old department fields to new dynamic fields
   - Update department references

4. **Update UI components**
   - Replace hardcoded department lists with API calls
   - Use dynamic stage colors and icons
   - Render dynamic fields in forms

## Troubleshooting

### Issue: Stages not appearing
- Check if `isActive` is set to `true`
- Verify the stage order is set correctly
- Ensure departments are properly assigned

### Issue: Fields not saving
- Verify field type is valid
- Check if department slug exists
- Ensure required fields are filled

### Issue: Department deletion fails
- Check if department has associated SRDs
- Verify no fields reference the department
- Check for stage associations

## Advanced Features

### Automatic Stages

Stages marked as `isAutomatic: true` are system-controlled:

```javascript
{
  name: "Ready for Production",
  isAutomatic: true,
  rules: {
    condition: "all_departments_approved"
  }
}
```

### Conditional Fields

Fields can be shown/hidden based on conditions:

```javascript
{
  name: "Rush Fee",
  type: "number",
  department: "commercial",
  conditions: {
    showWhen: {
      field: "priority",
      equals: "High"
    }
  }
}
```

### Stage Transitions

Define allowed transitions between stages:

```javascript
{
  name: "In Progress",
  allowedTransitions: ["Flagged", "Approved", "Pending"]
}
```

## Future Enhancements

- [ ] Field validation rules (min/max, regex)
- [ ] Conditional field visibility
- [ ] Stage transition rules and permissions
- [ ] Field dependencies
- [ ] Custom field types (dropdown, multi-select)
- [ ] Field groups and sections
- [ ] Import/export configurations
- [ ] Version control for configurations
- [ ] Audit log for configuration changes
- [ ] Role-based field permissions

## Support

For questions or issues:
1. Check this documentation
2. Review the API endpoints
3. Check browser console for errors
4. Verify database connections
5. Review server logs

## Contributing

When adding new dynamic features:
1. Update the relevant model
2. Create/update API endpoints
3. Build UI components
4. Update this documentation
5. Add seed data examples
6. Write tests
