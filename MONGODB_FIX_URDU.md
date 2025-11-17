# MongoDB SSL Error Fix - Vercel Par

## Error Kya Hai:
```
MongooseServerSelectionError: SSL routines error
```

Matlab: Vercel se MongoDB connect nahi ho raha.

## Problem:
MongoDB Atlas Vercel ke serverless environment se SSL connection reject kar raha hai.

## Fix Kiya:
`src/lib/db.js` file update kar di better connection options ke saath.

## Aapko Kya Karna Hai:

### Step 1: MongoDB Atlas Mein Jayein

1. **Network Access** kholen
2. "Add IP Address" dabayein
3. "Allow Access from Anywhere" select karein
4. Ya `0.0.0.0/0` add karein
5. Confirm karein

### Step 2: Connection String Check Karein

Aapki `.env` file mein ye hona chahiye:
```env
MONGODB_URI=mongodb+srv://abdul6282:m1UzTcVTdwI9FvMZ@cluster0.61ali3w.mongodb.net/srd-system?retryWrites=true&w=majority
```

**Dhyan Dein**:
- `mongodb+srv://` se shuru ho
- Database name add karein (`/srd-system`)
- Password mein special characters na hon

### Step 3: Vercel Environment Variables

1. Vercel Dashboard kholen
2. Apna project select karein
3. Settings → Environment Variables
4. `MONGODB_URI` check karein
5. **Production**, **Preview**, aur **Development** teeno mein set ho

### Step 4: Redeploy Karein

```bash
git add .
git commit -m "Fix MongoDB connection"
git push
```

## Kaise Pata Chalega Fix Hua:

Vercel logs mein ye dikhna chahiye:
```
✅ MongoDB connected successfully
```

## Agar Phir Bhi Problem Ho:

### Option 1: MongoDB User Check Karein
1. MongoDB Atlas → Database Access
2. User `abdul6282` ko dekhen
3. Permissions: "Read and write to any database"
4. Agar nahi hai toh edit karein

### Option 2: Naya User Banayein
1. Database Access → Add New Database User
2. Simple password use karein (special characters nahi)
3. Connection string update karein

### Option 3: Mongoose Update Karein
```bash
npm install mongoose@latest
git add .
git commit -m "Update mongoose"
git push
```

## Quick Checklist:

- [ ] MongoDB Atlas mein `0.0.0.0/0` IP allowed hai?
- [ ] Database user ke paas permissions hain?
- [ ] Connection string sahi format mein hai?
- [ ] Vercel mein environment variable set hai?
- [ ] Redeploy kiya?

## Important:

**Call system bilkul sahi kaam kar raha hai!** Ye sirf MongoDB connection ka issue hai Vercel par. Local par sab kuch kaam kar raha hai.

---

**Fix Steps Summary**:
1. MongoDB Atlas → Network Access → Allow 0.0.0.0/0
2. Vercel → Environment Variables → Check MONGODB_URI
3. Git push karein
4. Done!
