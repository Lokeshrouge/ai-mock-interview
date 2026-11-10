# Neon PostgreSQL Connection Setup

## ⚠️ SECURITY NOTICE
Your Neon connection string contains sensitive credentials. Handle it carefully:
- ✅ Only store in `backend/.env` (already gitignored)
- ✅ Never commit to Git
- ✅ Never share in screenshots or logs
- ✅ Never print to console

---

## Step 1: Add Connection String to `.env`

### File Location:
```
C:\Users\ravil\OneDrive\Desktop\Ai Mock Interview\backend\.env
```

### Edit Instructions:

1. Open `backend/.env` in your text editor

2. Find this line:
```env
DATABASE_URL=sqlite:./mock_interview.db
```

3. Replace it with (keeping SQLite as backup):
```env
# SQLite (backup connection - keep for rollback)
# DATABASE_URL=sqlite:./mock_interview.db

# Neon PostgreSQL - Production Database
DATABASE_URL=postgresql://YOUR_CONNECTION_STRING_HERE
```

4. Paste your actual Neon connection string from the dashboard

5. Save the file

### Expected Format:
```env
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-ENDPOINT.aws-ap-southeast-1.neon.tech/neondb?sslmode=require
```

**Components:**
- `neondb_owner` - Your database username
- `PASSWORD` - Your generated password
- `ep-ENDPOINT` - Your Neon compute endpoint
- `aws-ap-southeast-1` - Singapore region
- `neondb` - Database name
- `sslmode=require` - SSL required for Neon

---

## Step 2: Test Connection (DO NOT RUN YET)

After updating `.env`, test the connection:

```powershell
cd backend
node test-db-connection.js
```

**Expected Success Output:**
```
✅ Database connection successful!
📊 Database Information:
   Version: PostgreSQL 16.x
   Database: neondb
   User: neondb_owner
⚠️  No tables found. Database is empty (this is normal)
```

**If Connection Fails:**
- Check connection string for typos
- Verify Neon project is active (not suspended)
- Check firewall/network settings
- Verify endpoint is correct

---

## Rollback to SQLite (If Needed)

If you need to switch back to SQLite:

1. Open `backend/.env`
2. Comment out Neon line with `#`
3. Uncomment SQLite line (remove `#`)
4. Save and restart backend

```env
# DATABASE_URL=postgresql://...
DATABASE_URL=sqlite:./mock_interview.db
```

---

## Environment Variable Name

**Variable:** `DATABASE_URL`

This is the **only** variable needed. The backend will:
- ✅ Auto-detect PostgreSQL from URL
- ✅ Auto-enable SSL for Neon
- ✅ Use correct driver (`pg`)
- ✅ Disable schema synchronization

---

## Security Checklist

Before proceeding:
- [ ] Connection string added to `backend/.env`
- [ ] File saved
- [ ] NOT committed to Git (verify with: `git status`)
- [ ] SQLite backup line preserved (commented)
- [ ] Ready to test connection

---

## Next Steps

1. ✅ Add connection string to `.env`
2. ⏳ Test connection (wait for agent instruction)
3. ⏳ Create timestamped backup
4. ⏳ Fix entity types
5. ⏳ Generate schema migration
6. ⏳ Export and import data
7. ⏳ Verify migration
8. ⏳ Test application

**DO NOT proceed past Step 1 until instructed.**
