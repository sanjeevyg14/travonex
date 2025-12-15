# Missing Flows Identified & Completed ✅

This document lists all the missing flows identified in the `src/app/` folder and the APIs created to support them.

## Flows Identified & APIs Created

### 1. User Profile Update ✅
**Pages:** `/profile`
**Issue:** Uses `userService.updateUser` (client SDK)
**API Created:** 
- `PUT /api/users/[userId]` - Update user profile

**Features:**
- Update personal information
- Update preferences
- Update emergency contact
- Update government ID

### 2. Pro Subscription Checkout ✅
**Pages:** `/pro/checkout`
**Issue:** Uses simulated payment (mock)
**API Created:**
- `POST /api/subscriptions/create-checkout` - Already exists
- Webhook integration for subscription activation

**Action Required:**
- Frontend needs to integrate Razorpay payment UI
- Call `/api/subscriptions/create-checkout` instead of mock

### 3. Organizer Lead Credits Purchase ✅
**Pages:** `/organizer/credits`
**Issue:** Uses mock data, no payment integration
**API Created:**
- `POST /api/organizers/[organizerId]/credits/purchase` - Create payment order for credits
- Webhook integration added to credit organizer account on payment

**Features:**
- Creates Razorpay order for lead package
- Webhook updates organizer's `leadCredits` on payment success

### 4. Organizer Payouts ✅
**Pages:** `/organizer/payouts`
**Issue:** Uses mock data computation
**API Created:**
- `GET /api/organizers/[organizerId]/payouts` - Get organizer's settlements

**Features:**
- Calculates settlements for completed trip batches
- Groups by trip and batch
- Computes commission and net earnings
- Filters by status

### 5. Vendor/Experience Payouts ✅
**Pages:** `/vendor/payouts`
**Issue:** Uses mock data computation
**API Created:**
- `GET /api/vendor/payouts` - Get vendor's experience settlements

**Features:**
- Groups experience bookings by date
- Calculates settlements for past activity dates
- Similar to organizer payouts but for experiences

### 6. AI Credits Granting ✅
**Pages:** `/book/success`
**Issue:** Client-side update only, no backend tracking
**API Created:**
- `POST /api/bookings/[bookingId]/grant-ai-credits` - Grant 10 AI credits after booking

**Features:**
- One-time grant (prevents duplicate credits)
- Grants 10 credits to user
- Marks booking as credits granted

### 7. Saved Trips (Wishlist) ✅
**Pages:** `/saved-trips`, trip cards
**Issue:** Uses mock data
**API Created:**
- `GET /api/users/[userId]/saved-trips` - Get saved trips
- `POST /api/users/[userId]/saved-trips` - Toggle saved trip

**Status:** ✅ Already created

### 8. Booking Form Integration
**Pages:** `/book/[slug]/booking-form`
**Issue:** Uses `bookingService.createBooking` (client SDK)
**Action Required:**
- Update to call `POST /api/bookings` instead
- Integrate Razorpay payment UI
- Handle payment verification

**API Status:** ✅ Already exists (`POST /api/bookings`)

### 9. Experience Booking Form
**Pages:** `/experiences/[slug]/_components/experience-details.tsx`
**Issue:** Uses mock data (`setExperienceBookings`)
**Action Required:**
- Update to call `POST /api/experiences/bookings` instead
- Integrate Razorpay payment UI

**API Status:** ✅ Already exists (`POST /api/experiences/bookings`)

### 10. Contact Organizer (Lead Creation)
**Pages:** `/discover/[slug]/_components/trip-details.tsx`
**Issue:** Uses `addLead` from mock data
**Action Required:**
- Update to call `POST /api/leads` instead

**API Status:** ✅ Already exists (`POST /api/leads`)

### 11. Review Submission
**Pages:** Booking details, trip details
**Issue:** Uses `addReview` from mock data
**Action Required:**
- Update to call `POST /api/reviews` instead

**API Status:** ✅ Already exists (`POST /api/reviews`)

### 12. Refund Request
**Pages:** Booking details pages
**Issue:** Uses `requestRefund` from mock data
**Action Required:**
- Update to call `POST /api/bookings/[bookingId]/refund?action=request`

**API Status:** ✅ Already exists

### 13. Wallet Transactions
**Pages:** `/dashboard/wallet`
**Issue:** Uses mock data
**Action Required:**
- Update to call `GET /api/wallet/transactions`

**API Status:** ✅ Already exists

## Summary

### ✅ APIs Created (New)
1. `PUT /api/users/[userId]` - User profile update
2. `POST /api/organizers/[organizerId]/credits/purchase` - Lead credits purchase
3. `GET /api/organizers/[organizerId]/payouts` - Organizer payouts
4. `GET /api/vendor/payouts` - Vendor payouts
5. `POST /api/bookings/[bookingId]/grant-ai-credits` - Grant AI credits

### ✅ APIs Already Exist (Need Frontend Integration)
1. `POST /api/bookings` - Create booking with payment
2. `POST /api/experiences/bookings` - Create experience booking
3. `POST /api/leads` - Create lead
4. `POST /api/reviews` - Create review
5. `POST /api/bookings/[bookingId]/refund?action=request` - Request refund
6. `GET /api/wallet/transactions` - Get wallet transactions
7. `POST /api/subscriptions/create-checkout` - Pro subscription checkout

### 🔄 Webhook Updates
- ✅ Lead credits purchase handling added to webhook

## Frontend Integration Checklist

### High Priority
- [ ] Update booking form to use `POST /api/bookings` + Razorpay
- [ ] Update Pro checkout to use `POST /api/subscriptions/create-checkout` + Razorpay
- [ ] Update profile page to use `PUT /api/users/[userId]`
- [ ] Update experience booking to use `POST /api/experiences/bookings` + Razorpay
- [ ] Update organizer credits purchase to use `POST /api/organizers/[organizerId]/credits/purchase` + Razorpay

### Medium Priority
- [ ] Update wallet page to use `GET /api/wallet/transactions`
- [ ] Update organizer payouts to use `GET /api/organizers/[organizerId]/payouts`
- [ ] Update vendor payouts to use `GET /api/vendor/payouts`
- [ ] Update booking success to use `POST /api/bookings/[bookingId]/grant-ai-credits`
- [ ] Update contact organizer to use `POST /api/leads`
- [ ] Update review submission to use `POST /api/reviews`
- [ ] Update refund request to use refund API

### Low Priority (Already using APIs via services)
- [ ] Dashboard uses `bookingService` and `tripService` - can continue or switch to APIs
- [ ] User bookings page - check if needs API update

## Payment Integration Notes

All payment flows need Razorpay integration:
1. **Trip Booking** - Use order from `POST /api/bookings`
2. **Experience Booking** - Use order from `POST /api/experiences/bookings`
3. **Pro Subscription** - Use order from `POST /api/subscriptions/create-checkout`
4. **Lead Credits** - Use order from `POST /api/organizers/[organizerId]/credits/purchase`

All webhooks are already set up to handle payment confirmations.

