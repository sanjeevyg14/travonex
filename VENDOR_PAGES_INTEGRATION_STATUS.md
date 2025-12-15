# Vendor Pages Integration Status

## ✅ Already Integrated Pages

### 1. **Experiences Management** (`/vendor/experiences`)
- ✅ Uses `useApiExperiences` hook
- ✅ Fetches vendor's experiences from API
- ✅ Shows status, price, location
- ✅ Edit and View buttons
- **Status**: Fully integrated ✅

### 2. **Bookings Management** (`/vendor/bookings`)
- ✅ Fetches bookings via `/api/experiences/bookings?vendorId=...`
- ✅ Shows booking details dialog
- ✅ Displays revenue and booking counts
- **Status**: Fully integrated ✅

### 3. **Payouts** (`/vendor/payouts`)
- ✅ Fetches settlements via `/api/vendor/payouts`
- ✅ Shows settlement queue and history
- ✅ Displays financial breakdown
- **Status**: Fully integrated ✅

---

## ❌ Pages Still Using Mock Data

### 4. **Refunds** (`/vendor/refunds`)
- ❌ Uses `useMockData` for experience bookings
- ❌ Approve/reject refund uses mock functions
- **Needs**:
  - Fetch experience bookings from `/api/experiences/bookings?vendorId=...`
  - Approve/reject via POST `/api/experiences/bookings/[bookingId]/refund` (need to verify endpoint exists)
- **Status**: Needs integration ❌

### 5. **Settings** (`/vendor/settings`)
- ❌ Uses `useMockData` for organizers
- ❌ Save profile bio uses mock data
- ❌ Logo upload not implemented
- **Needs**:
  - Fetch organizer from `/api/organizers/[organizerId]`
  - Update organizer via PUT `/api/organizers/[organizerId]`
  - Handle logo upload via `/api/upload`
- **Status**: Needs integration ❌

### 6. **Dashboard** (`/vendor/dashboard`)
- ❌ Uses `useMockData` for experiences
- **Needs**:
  - Fetch experiences from `/api/experiences?vendorId=...`
  - Calculate stats from fetched data
- **Status**: Needs integration ❌

### 7. **Analytics** (`/vendor/analytics`)
- ⚠️ **Status**: Needs verification

### 8. **Create Experience** (`/vendor/experiences/new`)
- ❌ Uses `useMockData` for experience categories, vendors, commission rate
- ❌ Create experience uses mock data
- **Needs**:
  - Fetch static data (categories, commission rate) from settings API
  - Create experience via POST `/api/experiences`
  - Handle image uploads via `/api/upload`
- **Status**: Needs integration ❌

### 9. **Edit Experience** (`/vendor/experiences/edit/[slug]`)
- ❌ Uses `useMockData` for experiences
- ❌ Update experience uses mock data
- **Needs**:
  - Fetch experience from `/api/experiences/[experienceId]` (by slug)
  - Update experience via PUT `/api/experiences/[experienceId]`
  - Handle image uploads
- **Status**: Needs integration ❌

---

## Summary

- **Already Integrated**: 3 pages ✅
- **Needs Integration**: 5-6 pages ❌

---

## Next Steps

1. Integrate Dashboard page
2. Integrate Settings page
3. Integrate Refunds page (verify refund API endpoint exists)
4. Integrate Create Experience page
5. Integrate Edit Experience page
6. Verify Analytics page

