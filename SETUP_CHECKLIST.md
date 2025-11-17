# Setup Checklist - Dynamic System

Use this checklist to get your dynamic SRD system up and running.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] MongoDB connection available
- [ ] Environment variables configured in `.env`
  - [ ] `MONGODB_URI`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXTAUTH_URL`

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```
- [ ] All packages installed successfully
- [ ] No dependency errors

### 2. Seed the Database
```bash
npm run seed:dynamic
```
- [ ] 4 departments created
- [ ] 5 stages created
- [ ] 6 sample fields created
- [ ] No database connection errors

### 3. Start Development Server
```bash
npm run dev
```
- [ ] Server starts on port 3000
- [ ] No compilation errors
- [ ] Can access http://localhost:3000

## Verify Installation

### 4. Test Settings Hub
- [ ] Navigate to `/settings`
- [ ] See three configuration cards
- [ ] All cards are clickable
- [ ] Stats display correctly

### 5. Test Departments Page
- [ ] Navigate to `/departments`
- [ ] See 4 default departments (VMD, CAD, Commercial, MMC)
- [ ] Click "Add New Department"
- [ ] Modal opens correctly
- [ ] Create a test department
- [ ] New department appears in table
- [ ] Edit button works
- [ ] Delete button works (with confirmation)

### 6. Test Stages Page
- [ ] Navigate to `/stages`
- [ ] See 5 default stages
- [ ] Stages are sorted by order
- [ ] Colors display correctly
- [ ] Click "Add New Stage"
- [ ] Modal opens correctly
- [ ] Color picker works
- [ ] Department checkboxes work
- [ ] Create a test stage
- [ ] New stage appears in table
- [ ] Edit button works
- [ ] Delete button works (soft delete)

### 7. Test SRD Fields Page
- [ ] Navigate to `/srdfields`
- [ ] See 6 default fields
- [ ] Click "Add New Field"
- [ ] Modal opens correctly
- [ ] All field types available
- [ ] Department dropdown works
- [ ] Create a test field
- [ ] New field appears in table
- [ ] Edit button works
- [ ] Delete button works

### 8. Test Navigation
- [ ] Sidebar shows all config links (for admin)
- [ ] Settings link works
- [ ] Departments link works
- [ ] Stages link works
- [ ] SRD Fields link works
- [ ] All links highlight when active

## Configuration Tasks

### 9. Customize Departments
- [ ] Review default departments
- [ ] Add any missing departments
- [ ] Update descriptions
- [ ] Verify slugs are correct

### 10. Customize Stages
- [ ] Review default stages
- [ ] Adjust colors to match brand
- [ ] Set appropriate icons
- [ ] Order stages logically
- [ ] Assign to specific departments if needed

### 11. Customize Fields
- [ ] Review default fields
- [ ] Add department-specific fields
- [ ] Set required fields
- [ ] Add placeholders for guidance
- [ ] Test different field types

## Testing

### 12. Create Test SRD
- [ ] Navigate to SRD creation page
- [ ] Verify dynamic fields appear
- [ ] Fill in all fields
- [ ] Submit successfully
- [ ] View created SRD
- [ ] Verify all data saved correctly

### 13. Test Workflows
- [ ] Update SRD status
- [ ] Verify stage transitions work
- [ ] Check progress calculation
- [ ] Test department-specific views
- [ ] Verify notifications work

### 14. Test Permissions
- [ ] Login as admin
  - [ ] Can access all config pages
  - [ ] Can create/edit/delete items
- [ ] Login as department manager
  - [ ] Cannot access config pages
  - [ ] Can use dynamic fields in SRDs
- [ ] Login as regular user
  - [ ] Cannot access config pages
  - [ ] Can view SRDs

## Documentation

### 15. Review Documentation
- [ ] Read `QUICK_START_DYNAMIC.md`
- [ ] Review `DYNAMIC_SYSTEM.md`
- [ ] Check `ARCHITECTURE.md`
- [ ] Understand `CHANGES_SUMMARY.md`

### 16. Team Training
- [ ] Share documentation with team
- [ ] Demonstrate configuration pages
- [ ] Explain dynamic fields
- [ ] Show how to customize workflows

## Production Preparation

### 17. Environment Setup
- [ ] Configure production MongoDB
- [ ] Set production environment variables
- [ ] Configure Pusher for real-time features
- [ ] Set up email service (if using)

### 18. Security
- [ ] Change default admin password
- [ ] Review user permissions
- [ ] Enable HTTPS
- [ ] Configure CORS if needed
- [ ] Set up rate limiting

### 19. Performance
- [ ] Enable database indexes
- [ ] Configure caching
- [ ] Optimize images
- [ ] Enable compression
- [ ] Set up CDN (optional)

### 20. Monitoring
- [ ] Set up error logging
- [ ] Configure performance monitoring
- [ ] Enable database backups
- [ ] Set up alerts
- [ ] Document recovery procedures

## Deployment

### 21. Build & Deploy
```bash
npm run build
npm start
```
- [ ] Build completes successfully
- [ ] No build errors
- [ ] Production server starts
- [ ] All pages load correctly

### 22. Post-Deployment
- [ ] Verify all features work in production
- [ ] Test with real users
- [ ] Monitor for errors
- [ ] Check performance metrics
- [ ] Gather user feedback

## Maintenance

### 23. Regular Tasks
- [ ] Review and update departments as needed
- [ ] Add new stages for evolving workflows
- [ ] Create new fields based on user requests
- [ ] Monitor system performance
- [ ] Review and optimize database queries

### 24. Backup & Recovery
- [ ] Verify automated backups are running
- [ ] Test backup restoration
- [ ] Export configuration as JSON
- [ ] Document recovery procedures
- [ ] Keep documentation updated

## Troubleshooting

### Common Issues

#### Database Connection Failed
- [ ] Check MongoDB URI in `.env`
- [ ] Verify MongoDB is running
- [ ] Check network connectivity
- [ ] Review firewall settings

#### Pages Not Loading
- [ ] Check browser console for errors
- [ ] Verify API routes are working
- [ ] Check server logs
- [ ] Clear browser cache

#### Changes Not Saving
- [ ] Check form validation
- [ ] Review API error responses
- [ ] Verify database permissions
- [ ] Check for duplicate slugs

#### Fields Not Appearing
- [ ] Verify field is marked as active
- [ ] Check department assignment
- [ ] Review field type
- [ ] Clear cache and refresh

## Success Criteria

Your dynamic system is ready when:

- ✅ All pages load without errors
- ✅ Can create/edit/delete departments
- ✅ Can create/edit/delete stages
- ✅ Can create/edit/delete fields
- ✅ Dynamic fields appear in SRD forms
- ✅ Stage colors and icons display correctly
- ✅ Navigation works smoothly
- ✅ Permissions are enforced
- ✅ Data persists correctly
- ✅ Team understands how to use the system

## Next Steps

After completing this checklist:

1. **Customize for Your Organization**
   - Add your specific departments
   - Configure your workflow stages
   - Create custom fields for your process

2. **Train Your Team**
   - Show them the configuration pages
   - Explain how to use dynamic fields
   - Document your specific workflows

3. **Iterate and Improve**
   - Gather user feedback
   - Add new features as needed
   - Optimize based on usage patterns

4. **Monitor and Maintain**
   - Keep an eye on performance
   - Update configurations as processes evolve
   - Maintain documentation

## Support Resources

- **Quick Start**: `QUICK_START_DYNAMIC.md`
- **Full Documentation**: `DYNAMIC_SYSTEM.md`
- **Architecture**: `ARCHITECTURE.md`
- **Changes**: `CHANGES_SUMMARY.md`
- **Main README**: `README.md`

## Feedback

After setup, consider:
- What worked well?
- What was confusing?
- What features are missing?
- How can the documentation be improved?

Document your feedback to help improve the system for future users.

---

**Congratulations!** 🎉

Once you've completed this checklist, your dynamic SRD system is ready to use. The system is now fully customizable without code changes, making it easy to adapt to your organization's evolving needs.
