# Database Seeding Guide

This guide explains how to seed your Firestore database with mock data for testing and demo purposes.

## 🎯 Quick Start

### Prerequisites
1. ✅ Firebase credentials configured in `.env.local`
2. ✅ Firebase Admin SDK initialized
3. ✅ `tsx` package installed (for running TypeScript files)

### Run the Seed Script

```bash
npm run seed
```

This will seed **all collections** with mock data from `src/lib/data.ts`.

---

## 📦 What Gets Seeded

The comprehensive seed script (`seed-complete.ts`) seeds the following collections:

### Core Data
- ✅ **Users** - Travelers, organizers, vendors, and admin users
- ✅ **Organizers** - Trip organizers with full profile data
- ✅ **Experience Vendors** - Experience vendors (stored in organizers collection)
- ✅ **Trips** - All trip listings with batches, itineraries, etc.
- ✅ **Experiences** - All experience listings

### Booking & Transaction Data
- ✅ **Bookings** - Trip bookings (past, upcoming, with refunds)
- ✅ **Experience Bookings** - Experience bookings
- ✅ **Wallet Transactions** - Transaction history
- ✅ **Referrals** - Referral records

### Content & Configuration
- ✅ **Reviews** - Trip and experience reviews
- ✅ **Blog Stories** - Traveler stories/blog posts
- ✅ **Coupons** - Promotional coupons (global and organizer-specific)
- ✅ **Leads** - Traveler leads for organizers
- ✅ **Lead Packages** - Credit packages for purchase
- ✅ **FAQs** - Platform FAQs
- ✅ **Audit Logs** - Admin action logs

### Platform Settings
- ✅ **Settings** - Platform-wide configuration:
  - Commission rate
  - Referral bonus amount
  - Pro subscription pricing
  - Travel cities, interests, categories, difficulties

---

## 🔧 Script Options

### Full Seed (Recommended)
```bash
npm run seed
```
Seeds all collections with complete mock data.

### Basic Seed (Minimal)
```bash
npm run seed:basic
```
Seeds only: Users, Organizers, Trips, Experiences

---

## 📊 Data Summary

After seeding, you'll have:

- **~8 Users** (including 1 admin, 2 organizers, 1 vendor)
- **~5 Organizers** (trip organizers)
- **~3 Experience Vendors**
- **~16 Trips** (with various statuses: published, pending, draft)
- **~5 Experiences**
- **~15 Bookings** (past, upcoming, with refund scenarios)
- **~5 Experience Bookings**
- **~10 Reviews**
- **~5 Coupons**
- **~10 Wallet Transactions**
- **~5 Referrals**
- **~5 Leads**
- **~3 Lead Packages**
- **~7 FAQs**
- **~3 Blog Stories**
- **~3 Audit Logs**
- **1 Platform Settings document**

---

## ⚠️ Important Notes

### Data Safety
- The script uses `{ merge: true }` - it won't delete existing data
- Existing documents with the same ID will be updated
- New documents will be created

### User Authentication
⚠️ **Important**: The seed script creates user documents in Firestore, but **does NOT create Firebase Auth users**.

To use these users for login:
1. **Option 1**: Manually create Firebase Auth users with matching phone numbers
2. **Option 2**: Use the signup flow to create real users (recommended for testing)

### Phone Numbers
The mock users have test phone numbers like `+917777777777`. For testing:
- Use Firebase Console → Authentication to create test users
- Or use real phone numbers and complete OTP verification

### Organizer IDs
Some users have `organizerId` set. Make sure the corresponding organizer exists in the `organizers` collection (which the seed script handles).

---

## 🧪 Testing After Seeding

### 1. Verify Data in Firebase Console
- Go to Firebase Console → Firestore Database
- Check each collection has documents
- Verify relationships (e.g., bookings reference valid trips)

### 2. Test User Login
- Create a Firebase Auth user with phone: `+917777777777`
- Login should work and load user data from Firestore

### 3. Test Admin Access
- Create Firebase Auth user with phone: `+919999999999`
- This user has `role: 'admin'` in Firestore
- Should be able to access `/management` pages

### 4. Test Organizer Access
- Create Firebase Auth user with phone: `+918888888888`
- This user has `role: 'organizer'` and `organizerId: 'adventure-seekers'`
- Should be able to access `/organizer` pages

### 5. Test Trip Booking
- Login as a traveler
- Browse trips (should see ~16 trips)
- Book a trip (should work end-to-end)

---

## 🔄 Re-seeding

If you need to re-seed:

```bash
# Just run the seed script again
npm run seed
```

The `{ merge: true }` option ensures:
- Existing data is updated (not duplicated)
- New data is added
- Missing collections are created

---

## 🗑️ Clearing Data (Optional)

If you want to start fresh:

1. **Via Firebase Console**:
   - Go to Firestore Database
   - Delete collections manually (or use Firebase CLI)

2. **Via Script** (create if needed):
   ```typescript
   // Clear all collections
   const collections = ['users', 'trips', 'bookings', ...];
   for (const coll of collections) {
       const snapshot = await adminDb.collection(coll).get();
       const batch = adminDb.batch();
       snapshot.docs.forEach(doc => batch.delete(doc.ref));
       await batch.commit();
   }
   ```

---

## 🐛 Troubleshooting

### Error: "Private Key missing!"
- Check `.env.local` has `FIREBASE_ADMIN_PRIVATE_KEY`
- Verify the key format (should include newlines or be base64 encoded)

### Error: "NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing"
- Check `.env.local` has all Firebase config variables

### Error: "tsx: command not found"
- Install tsx: `npm install -D tsx`
- Or use: `npx tsx src/scripts/seed-complete.ts`

### Data not appearing in Firestore
- Check Firebase Console → Firestore Database
- Verify you're looking at the correct project
- Check browser console for errors

### Users can't login
- Remember: Seed script creates Firestore documents, NOT Auth users
- Create Firebase Auth users manually or via signup flow

---

## 📝 Customizing Seed Data

To modify the seed data:

1. Edit `src/lib/data.ts`
2. Update the `initial*` arrays/objects
3. Run `npm run seed` again

---

## ✅ Success Checklist

After seeding, verify:

- [ ] All collections have documents in Firestore Console
- [ ] Users collection has admin, organizer, and traveler users
- [ ] Trips collection has published trips visible on homepage
- [ ] Bookings collection has various booking statuses
- [ ] Settings collection has platform settings document
- [ ] Can login with seeded user (after creating Auth user)
- [ ] Can browse trips and experiences
- [ ] Can view bookings in dashboard

---

## 🚀 Next Steps

After seeding:

1. **Create Firebase Auth users** for testing
2. **Test authentication flow**
3. **Test booking flow**
4. **Test admin/organizer flows**
5. **Follow `QUICK_START_TESTING.md`** for systematic testing

Happy testing! 🎉

