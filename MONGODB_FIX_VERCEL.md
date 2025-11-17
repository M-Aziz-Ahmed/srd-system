# Fix MongoDB SSL Error on Vercel

## The Error:
```
MongooseServerSelectionError: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

## Root Cause:
MongoDB Atlas SSL connection failing on Vercel's serverless environment.

## Fix Applied:
Updated `src/lib/db.js` with better connection options.

## Check Your MongoDB Connection String:

Your `.env` should have:
```env
MONGODB_URI=mongodb+srv://abdul6282:m1UzTcVTdwI9FvMZ@cluster0.61ali3w.mongodb.net/?appName=Cluster0
```

### Make Sure:
1. ✅ Connection string starts with `mongodb+srv://`
2. ✅ No special characters in password (or URL encode them)
3. ✅ Database name is included (add `/your-db-name` before `?`)

### Better Format:
```env
MONGODB_URI=mongodb+srv://abdul6282:m1UzTcVTdwI9FvMZ@cluster0.61ali3w.mongodb.net/srd-system?retryWrites=true&w=majority
```

## MongoDB Atlas Settings:

### 1. Allow Vercel IPs:
Go to MongoDB Atlas → Network Access → Add IP Address:
- Click "Allow Access from Anywhere"
- Or add: `0.0.0.0/0`

### 2. Check Database User:
Go to MongoDB Atlas → Database Access:
- Username: `abdul6282`
- Password: `m1UzTcVTdwI9FvMZ`
- Make sure user has "Read and write to any database" permission

## Vercel Environment Variables:

1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Make sure `MONGODB_URI` is set for **Production**, **Preview**, and **Development**

## Test Connection:

After fixing, redeploy:
```bash
git add .
git commit -m "Fix MongoDB connection for Vercel"
git push
```

Check Vercel logs for:
```
✅ MongoDB connected successfully
```

## If Still Failing:

### Option 1: Update MongoDB Driver
```bash
npm install mongoose@latest
```

### Option 2: Use Different Connection String Format
```env
# Try without srv
MONGODB_URI=mongodb://abdul6282:m1UzTcVTdwI9FvMZ@cluster0-shard-00-00.61ali3w.mongodb.net:27017,cluster0-shard-00-01.61ali3w.mongodb.net:27017,cluster0-shard-00-02.61ali3w.mongodb.net:27017/srd-system?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Option 3: Create New Database User
1. Go to MongoDB Atlas
2. Database Access → Add New Database User
3. Use simple password (no special characters)
4. Update connection string

## Quick Fix Steps:

1. **Go to MongoDB Atlas**
2. **Network Access** → Allow `0.0.0.0/0`
3. **Database Access** → Check user permissions
4. **Update Vercel env vars** with correct connection string
5. **Redeploy**

---

**The call system works fine. This is just a MongoDB connection issue on Vercel.**
