# 🚀 Quick Start - Production Workflow

## Setup (One-Time)

```bash
# Run these two commands:
npm run seed:production
npm run seed:production-users
```

Done! ✅

---

## Usage

### 1️⃣ Approve SRD (All 4 Departments)

Login as each department and approve the SRD:
- VMD → CAD → MMC → Commercial

When all 4 approve → SRD is ready for production

---

### 2️⃣ Start Production

**Login:** production-manager@srds.com / manager123

1. Go to Production Manager Dashboard
2. See SRD in "Ready to Start Production" section
3. Click **"Start Production"** button
4. ✅ SRD moves to Cutting!

---

### 3️⃣ Process Through Stages

**Cutting** (cutting@srds.com / cutting123)
- See SRD in dashboard
- Click **"Complete"**
- ✅ Moves to Sewing

**Sewing** (sewing@srds.com / sewing123)
- See SRD in dashboard
- Click **"Complete"**
- ✅ Moves to Washing

**Washing** (washing@srds.com / washing123)
- See SRD in dashboard
- Click **"Complete"**
- ✅ Moves to Finishing

**Finishing** (finishing@srds.com / finishing123)
- See SRD in dashboard
- Click **"Complete"**
- ✅ Moves to Dispatch

**Dispatch** (dispatch@srds.com / dispatch123)
- See SRD in dashboard
- Click **"Complete"**
- ✅ Production Complete! 🎉

---

## Visual Flow

```
┌─────────────────────────────────────────────────┐
│  VMD + CAD + MMC + Commercial = All Approved    │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Production Manager: "Start Production"         │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  ✂️  CUTTING             │
        │  cutting@srds.com        │
        └────────────┬─────────────┘
                     │ Complete
                     ▼
        ┌─────────────────────────┐
        │  🧵  SEWING              │
        │  sewing@srds.com         │
        └────────────┬─────────────┘
                     │ Complete
                     ▼
        ┌─────────────────────────┐
        │  💧  WASHING             │
        │  washing@srds.com        │
        └────────────┬─────────────┘
                     │ Complete
                     ▼
        ┌─────────────────────────┐
        │  ✨  FINISHING           │
        │  finishing@srds.com      │
        └────────────┬─────────────┘
                     │ Complete
                     ▼
        ┌─────────────────────────┐
        │  📦  DISPATCH            │
        │  dispatch@srds.com       │
        └────────────┬─────────────┘
                     │ Complete
                     ▼
              🎉 COMPLETE! 🎉
```

---

## Troubleshooting

### ❌ SRD not in Cutting after "Start Production"

**Check:**
1. Did you run `npm run seed:production`?
2. Did all 4 departments approve?
3. Did you click "Start Production"?
4. Check browser console for errors

**Fix:**
```bash
# Re-run seed
npm run seed:production

# Try again
```

### ❌ Can't login as production user

**Fix:**
```bash
npm run seed:production-users
```

### ❌ "Complete" button doesn't work

**Check:**
- Browser console for errors
- Network tab for API response
- Make sure you're logged in as the correct stage user

---

## That's It!

The system is now fully functional. Enjoy your production workflow! 🎉

**Need more details?** See:
- `PRODUCTION_STAGES_SETUP.md` - Full setup guide
- `TEST_PRODUCTION_FLOW.md` - Detailed testing
- `PRODUCTION_IMPLEMENTATION_COMPLETE.md` - Technical details
