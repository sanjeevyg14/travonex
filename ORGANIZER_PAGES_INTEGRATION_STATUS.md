# Organizer Pages Integration Status

## ✅ Already Integrated Pages

### 1. **Trips Management** (`/organizer/trips`)
- ✅ Uses `useApiTrips` hook
- ✅ Fetches organizer's trips from API
- ✅ Fetches bookings to enrich trip data
- ✅ Shows booking counts and revenue
- **Status**: Fully integrated ✅

### 2. **Bookings Management** (`/organizer/bookings`)
- ✅ Fetches bookings via `/api/bookings?organizerId=...`
- ✅ Enriches with trip and batch data
- ✅ Categorizes into upcoming/past bookings
- ✅ Shows booking details dialog
- **Status**: Fully integrated ✅

### 3. **Payouts** (`/organizer/payouts`)
- ✅ Fetches settlements via `/api/organizers/[organizerId]/payouts`
- ✅ Shows settlement queue and history
- ✅ Displays financial breakdown
- **Status**: Fully integrated ✅

### 4. **Analytics** (`/organizer/analytics`)
- ⚠️ Uses `useOrganizerAnalytics` hook
- **Needs verification**: Check if hook uses API calls
- **Status**: Needs verification ⚠️

### 5. **Help** (`/organizer/help`)
- ✅ Static FAQ page
- ✅ No backend integration needed
- **Status**: Complete ✅

---

## ❌ Pages Still Using Mock Data

### 6. **Leads Management** (`/organizer/leads`)
- ❌ Uses `useMockData` for leads
- ❌ Uses `useMockData` for organizers
- ❌ Unlock lead action uses mock data
- **Needs**: 
  - Fetch leads from `/api/leads?organizerId=...`
  - Update lead status via PUT `/api/leads`
  - Fetch organizer lead credits from API
- **Status**: Needs integration ❌

### 7. **Promotions/Coupons** (`/organizer/promotions`)
- ❌ Uses `useMockData` for coupons
- ❌ Create coupon uses mock data
- ❌ Toggle coupon status uses mock data
- **Needs**:
  - Fetch coupons from `/api/coupons?organizerId=...`
  - Create coupon via POST `/api/coupons`
  - Update coupon status (need PUT endpoint or delete/recreate)
- **Status**: Needs integration ❌

### 8. **Refunds** (`/organizer/refunds`)
- ❌ Uses `useMockData` for bookings
- ❌ Approve/reject refund uses mock functions
- **Needs**:
  - Fetch bookings from `/api/bookings?organizerId=...`
  - Approve/reject via POST `/api/bookings/[bookingId]/refund`
- **Status**: Needs integration ❌

### 9. **Settings** (`/organizer/settings`)
- ❌ Uses `useMockData` for organizers
- ❌ Save profile bio uses mock data
- ❌ Logo upload not implemented
- **Needs**:
  - Fetch organizer from `/api/organizers/[organizerId]`
  - Update organizer via PUT `/api/organizers/[organizerId]`
  - Handle logo upload via `/api/upload`
- **Status**: Needs integration ❌

### 10. **Lead Credits Purchase** (`/organizer/credits`)
- ❌ Uses `useMockData` for lead packages
- ❌ Uses `useMockData` for organizers
- ❌ Purchase uses mock data
- **Needs**:
  - Fetch packages from `/api/lead-packages`
  - Purchase credits via payment (need endpoint)
  - Update organizer credits
- **Status**: Needs integration ❌

### 11. **Create Trip** (`/organizer/trips/new`)
- ❌ Uses `useMockData` for trip categories, difficulties, cities
- ❌ Uses `useMockData` for organizers
- ❌ Create trip uses mock data
- **Needs**:
  - Fetch static data (categories, difficulties, cities) from settings API
  - Create trip via POST `/api/trips`
  - Handle image uploads via `/api/upload`
- **Status**: Needs integration ❌

### 12. **Edit Trip** (`/organizer/trips/edit/[slug]`)
- ❌ Uses `useMockData` for trips
- ❌ Uses `useMockData` for organizers
- ❌ Update trip uses mock data
- **Needs**:
  - Fetch trip from `/api/trips/[tripId]` (by slug)
  - Update trip via PUT `/api/trips/[tripId]`
  - Handle image uploads
- **Status**: Needs integration ❌

---

## Summary

- **Integrated**: 4 pages ✅
- **Needs Integration**: 7 pages ❌
- **Needs Verification**: 1 page ⚠️

---

## Next Steps

1. Integrate Leads Management page
2. Integrate Promotions/Coupons page
3. Integrate Refunds page
4. Integrate Settings page
5. Integrate Lead Credits Purchase page
6. Integrate Create Trip page
7. Integrate Edit Trip page
8. Verify Analytics page integration


