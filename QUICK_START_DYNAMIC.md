# Quick Start Guide - Dynamic System

## What's New?

Your SRD Tracking System is now fully dynamic! You can customize:
- ✅ Departments
- ✅ Workflow Stages  
- ✅ Custom Fields

All through the UI - no code changes needed!

## Getting Started in 5 Minutes

### Step 1: Seed the Database (First Time Only)

```bash
npm run seed:dynamic
```

This creates:
- 4 default departments (VMD, CAD, Commercial, MMC)
- 5 workflow stages (Pending, In Progress, Flagged, Approved, Ready for Production)
- 6 sample fields

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Access the Settings Hub

Navigate to: `http://localhost:3000/settings`

You'll see three main configuration areas:
- **Departments** - Manage organizational units
- **Stages** - Configure workflow stages
- **SRD Fields** - Add custom fields to records

### Step 4: Try It Out!

#### Create a New Department

1. Click on "Departments"
2. Click "Add New Department"
3. Fill in:
   - Name: "Quality Assurance"
   - Slug: "qa" (or leave empty for auto-generation)
   - Description: "Quality control and testing"
4. Click "Create Department"

#### Create a Custom Stage

1. Click on "Stages"
2. Click "Add New Stage"
3. Fill in:
   - Name: "Under Review"
   - Color: Pick orange (#F59E0B)
   - Icon: "Eye"
   - Order: 2
4. Click "Create Stage"

#### Add a Custom Field

1. Click on "SRD Fields"
2. Click "Add New Field"
3. Fill in:
   - Field Name: "Fabric Type"
   - Field Type: "Text"
   - Department: "CAD"
   - Placeholder: "e.g., Cotton, Polyester"
4. Click "Save"

## Navigation

### Admin Users
Access all configuration pages from the sidebar:
- Settings (hub page)
- Departments
- Stages
- SRD Fields

### Regular Users
Regular users see their department-specific views and can't access configuration pages.

## Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Settings Hub | `/settings` | Central configuration dashboard |
| Departments | `/departments` | Manage departments |
| Stages | `/stages` | Configure workflow stages |
| SRD Fields | `/srdfields` | Add custom fields |

## Common Tasks

### Adding a New Workflow Stage

1. Go to `/stages`
2. Click "Add New Stage"
3. Set the order number (determines sequence)
4. Choose a color for visual identification
5. Select applicable departments (or leave empty for all)
6. Save

### Making a Field Required

1. Go to `/srdfields`
2. Find the field and click "Edit"
3. Check the "Required" checkbox
4. Save

### Deactivating a Stage

1. Go to `/stages`
2. Find the stage and click "Edit"
3. Uncheck "Active"
4. Save

The stage will be hidden but existing SRDs using it remain unchanged.

## Tips

- **Slugs**: Auto-generated from names if left empty
- **Colors**: Use hex codes for consistent branding
- **Icons**: Use Lucide icon names (e.g., "CheckCircle", "Clock", "Flag")
- **Order**: Lower numbers appear first in lists
- **Departments**: Assign stages to specific departments for targeted workflows

## What's Dynamic?

### ✅ Fully Dynamic
- Department creation/editing
- Stage configuration
- Field management
- Colors and icons
- Field types and validation

### 🔄 Partially Dynamic
- User roles (still uses predefined roles)
- Permissions (tied to roles)
- Dashboard layouts

### ❌ Not Dynamic (Yet)
- Authentication methods
- Email templates
- Notification rules

## Next Steps

1. **Customize Your Workflow**
   - Map your current process to stages
   - Add department-specific fields
   - Configure stage colors for your brand

2. **Train Your Team**
   - Show them the new configuration pages
   - Explain how to use custom fields
   - Document your specific workflow

3. **Iterate**
   - Start simple
   - Add complexity as needed
   - Get feedback from users

## Troubleshooting

### Can't see the Settings page?
- Make sure you're logged in as an admin user
- Check the sidebar for the Settings link

### Changes not appearing?
- Refresh the page
- Check if the item is marked as "Active"
- Verify the database connection

### Field not showing in SRD form?
- Ensure the field is marked as "Active"
- Check the department assignment
- Verify the field type is supported

## Need Help?

- Check `DYNAMIC_SYSTEM.md` for detailed documentation
- Review the API endpoints in the documentation
- Check browser console for errors
- Verify MongoDB connection

## Example Workflow

Here's a complete example of setting up a new department workflow:

1. **Create Department**: "Packaging Design" (slug: packaging)
2. **Create Stages**:
   - "Design Draft" (order: 0, color: blue)
   - "Client Review" (order: 1, color: yellow)
   - "Final Approval" (order: 2, color: green)
3. **Add Fields**:
   - "Package Type" (text, required)
   - "Dimensions" (text)
   - "Material" (text)
   - "Print Colors" (number)
4. **Test**: Create a test SRD and verify all fields appear

That's it! Your system is now customized for packaging design workflows.
