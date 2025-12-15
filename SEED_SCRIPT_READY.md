# ✅ Database Seed Script Ready!

Your comprehensive seed script is ready to populate Firestore with all mock data for testing!

## 🚀 Quick Start

```bash
npm run seed
```

This will seed **all collections** with data from `src/lib/data.ts`.

---

## 📦 What Gets Seeded

### ✅ Core Collections
- **Users** (~8 users: travelers, organizers, vendors, admin)
- **Organizers** (~5 trip organizers)
- **Experience Vendors** (~3 vendors)
- **Trips** (~16 trips with various statuses)
- **Experiences** (~5 experiences)

### ✅ Booking & Transaction Data
- **Bookings** (~15 trip bookings: past, upcoming, refund scenarios)
- **Experience Bookings** (~5 experience bookings)
- **Wallet Transactions** (~10 transactions)
- **Referrals** (~5 referral records)

### ✅ Content & Configuration
- **Reviews** (~10 reviews)
- **Blog Stories** (~3 stories)
- **Coupons** (~5 coupons)
- **Leads** (~5 leads)
- **Lead Packages** (~3 packages)
- **FAQs** (~7 FAQs)
- **Audit Logs** (~3 logs)

### ✅ Platform Settings
- **Settings** (1 document with all platform config)

---

## 📋 Pre-Seed Checklist

Before running the seed script:

- [ ] Firebase credentials configured in `.env.local`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` is set
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL` is set
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set
- [ ] Firebase project is accessible

---

## 🎯 Running the Seed Script

### Option 1: Full Seed (Recommended)
```bash
npm run seed
```
Seeds all collections with complete mock data.

### Option 2: Basic Seed (Minimal)
```bash
npm run seed:basic
```
Seeds only: Users, Organizers, Trips, Experiences

---

## ⚠️ Important Notes

### User Authentication
The seed script creates **Firestore user documents**, but **NOT Firebase Auth users**.

To login with seeded users:
1. **Option 1**: Manually create Firebase Auth users with matching phone numbers
2. **Option 2**: Use the signup flow (recommended for testing)

### Test Users
After seeding, you can create Firebase Auth users for:
- **Admin**: Phone `+919999999999` (role: admin)
- **Organizer**: Phone `+918888888888` (organizerId: adventure-seekers)
- **Traveler**: Phone `+917777777777` (John Doe, has Pro subscription)

---

## ✅ Verification Steps

After seeding:

1. **Check Firestore Console**:
   - Go to Firebase Console → Firestore Database
   - Verify all collections have documents

2. **Check Platform Settings**:
   - Collection: `settings`
   - Document: `platform`
   - Should have commission rate, referral bonus, etc.

3. **Test Data Relationships**:
   - Bookings should reference valid trips
   - Trips should reference valid organizers
   - Reviews should reference valid trips/bookings

---

## 🔄 Re-seeding

The script uses `{ merge: true }`, so you can safely re-run:

```bash
npm run seed
```

This will:
- ✅ Update existing documents
- ✅ Add new documents
- ✅ Not delete existing data

---

## 📚 Documentation

For detailed information, see:
- **`SEED_DATA_GUIDE.md`** - Complete seeding guide
- **`QUICK_START_TESTING.md`** - Testing guide after seeding
- **`COMPREHENSIVE_TESTING_CHECKLIST.md`** - Full test checklist

---

## 🎉 Next Steps

1. **Run the seed script**: `npm run seed`
2. **Verify data in Firebase Console**
3. **Create Firebase Auth users** for testing
4. **Start testing** using `QUICK_START_TESTING.md`

Happy testing! 🚀

