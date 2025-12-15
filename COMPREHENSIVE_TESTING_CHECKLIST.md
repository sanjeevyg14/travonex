# Comprehensive Testing Checklist for Travonex

## 📋 Pre-Testing Setup

### ✅ Environment Setup
- [ ] Firebase credentials configured (`FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`)
- [ ] Razorpay credentials configured (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- [ ] Environment variables set in `.env.local`
- [ ] Next.js development server running (`npm run dev`)
- [ ] Firebase project initialized and Firestore database accessible
- [ ] Firebase Storage bucket created and accessible

### ✅ Initial Data Setup
- [ ] At least one admin user created in Firestore
- [ ] Platform settings initialized (`/api/settings`)
- [ ] At least one organizer/vendor account created
- [ ] Test trip and experience data ready (optional, can create during testing)

---

## 🔐 Authentication & User Management

### Signup Flow
- [ ] **Phone Signup**
  - [ ] Enter phone number
  - [ ] Receive OTP via Firebase Auth
  - [ ] Enter correct OTP
  - [ ] User created in Firestore with default role "traveler"
  - [ ] Referral code generated for new user
  - [ ] Session cookie set after successful signup
  - [ ] Redirect to appropriate dashboard

- [ ] **Referral Signup**
  - [ ] Signup with referral code
  - [ ] Referrer receives ₹100 bonus (check wallet transaction)
  - [ ] New user receives ₹100 bonus (check wallet transaction)
  - [ ] Referral record created in `referrals` collection
  - [ ] Admin referral stats updated

### Login Flow
- [ ] **Phone Login**
  - [ ] Enter phone number
  - [ ] Receive OTP
  - [ ] Enter correct OTP
  - [ ] Session cookie created
  - [ ] Redirect based on user role (traveler/organizer/admin)
  - [ ] Invalid OTP shows error message

### Logout Flow
- [ ] Click logout
- [ ] Session cookie cleared
- [ ] Redirect to home/login page

### Profile Management
- [ ] Update user profile (name, email, bio, interests, cities)
- [ ] Profile changes saved to Firestore
- [ ] Changes reflected in dashboard

---

## 👤 Traveler Flows

### Trip Discovery & Booking
- [ ] **Browse Trips**
  - [ ] View trip listings on home page
  - [ ] Filter trips by category, location, price
  - [ ] Search trips
  - [ ] View trip details page

- [ ] **Save/Unsave Trips**
  - [ ] Save trip to wishlist
  - [ ] View saved trips page
  - [ ] Unsave trip
  - [ ] Saved trips persist after page refresh

- [ ] **Trip Booking**
  - [ ] Select trip and batch
  - [ ] Enter number of travelers
  - [ ] Add co-traveler details (optional)
  - [ ] Select payment type (Full/Partial)
  - [ ] Apply Pro discount if user has Pro subscription
  - [ ] Create booking → Razorpay order created
  - [ ] Complete Razorpay payment
  - [ ] Payment webhook received and processed
  - [ ] Booking status updated to "Confirmed"
  - [ ] Trip batch slots decremented
  - [ ] AI credits granted to user
  - [ ] Booking confirmation email/page shown

- [ ] **Booking Management**
  - [ ] View "My Bookings" page
  - [ ] See booking details (trip, batch, travelers, payment status)
  - [ ] Filter bookings by status
  - [ ] Cancel/request refund for booking

- [ ] **Reviews**
  - [ ] Submit review for completed trip
  - [ ] Review appears on trip details page
  - [ ] Review saved to Firestore

### Experience Booking
- [ ] **Browse Experiences**
  - [ ] View experience listings
  - [ ] Filter by category, location
  - [ ] View experience details

- [ ] **Experience Booking**
  - [ ] Select activity date and time slot
  - [ ] Enter number of participants
  - [ ] Complete payment via Razorpay
  - [ ] Booking confirmed
  - [ ] Booking visible in "My Bookings"

### Pro Subscription
- [ ] **Purchase Pro Subscription**
  - [ ] Navigate to Pro checkout page
  - [ ] See subscription benefits and pricing
  - [ ] Complete payment via Razorpay
  - [ ] Subscription activated
  - [ ] User profile updated with `subscriptionTier: "pro"`
  - [ ] Discount applied on next booking
  - [ ] Subscription visible in profile

---

## 🏢 Organizer Flows

### Onboarding
- [ ] **Application Submission**
  - [ ] Fill organizer application form
  - [ ] Upload required documents (PAN, bank statement, etc.)
  - [ ] Submit application
  - [ ] Application saved to Firestore with status "pending"
  - [ ] Documents uploaded to Firebase Storage

### Trip Management
- [ ] **Create Trip**
  - [ ] Navigate to "Create New Trip"
  - [ ] Fill all trip details (title, description, images, batches, etc.)
  - [ ] Upload trip images
  - [ ] Submit trip
  - [ ] Trip created with status "pending"
  - [ ] Trip visible in organizer's trip list

- [ ] **Edit Trip**
  - [ ] Edit existing trip
  - [ ] Update trip details
  - [ ] Changes saved
  - [ ] Trip status may reset to "pending" if needed

- [ ] **View Trips**
  - [ ] See all trips (all/published/pending/draft)
  - [ ] Filter and search trips
  - [ ] View trip statistics (bookings, revenue)

### Booking Management
- [ ] **View Bookings**
  - [ ] See all bookings for organizer's trips
  - [ ] Filter by status, trip, date
  - [ ] View booking details (traveler info, payment status)

- [ ] **Manage Refunds**
  - [ ] View pending refund requests
  - [ ] Approve refund with amount and remarks
  - [ ] Reject refund with reason
  - [ ] Refund status updated
  - [ ] Historical refunds visible

### Leads Management
- [ ] **View Leads**
  - [ ] See available leads
  - [ ] Filter by status, destination
  - [ ] Check lead credits balance

- [ ] **Unlock Lead**
  - [ ] Select lead to unlock
  - [ ] Lead credits decremented
  - [ ] Lead details revealed
  - [ ] Lead status updated to "unlocked"

### Credits Purchase
- [ ] **Buy Lead Credits**
  - [ ] View lead credit packages
  - [ ] Select package
  - [ ] Complete payment via Razorpay
  - [ ] Credits added to organizer account
  - [ ] Transaction recorded

### Promotions
- [ ] **Create Coupon**
  - [ ] Fill coupon form (code, discount, expiry, scope)
  - [ ] Create coupon
  - [ ] Coupon visible in coupons list

- [ ] **Toggle Coupon Status**
  - [ ] Activate/deactivate coupon
  - [ ] Status updated

### Payouts
- [ ] **View Payouts**
  - [ ] See settlement queue (available for payout)
  - [ ] See payout history (processing/paid)
  - [ ] View financial breakdown per batch
  - [ ] Check UTR numbers for paid settlements

### Analytics
- [ ] **View Analytics**
  - [ ] See revenue statistics
  - [ ] View top trips by revenue/bookings
  - [ ] Monthly revenue chart

### Settings
- [ ] **Update Settings**
  - [ ] Update public bio
  - [ ] Upload/change logo
  - [ ] Changes saved
  - [ ] View application details (read-only)

---

## 🎯 Vendor Flows

### Onboarding
- [ ] **Experience Vendor Application**
  - [ ] Fill vendor application form
  - [ ] Upload vendor-specific documents (licenses, insurance, etc.)
  - [ ] Submit application
  - [ ] Application saved with status "pending"

### Experience Management
- [ ] **Create Experience**
  - [ ] Fill experience form
  - [ ] Upload experience images
  - [ ] Set availability (time slots, days)
  - [ ] Submit experience
  - [ ] Experience created with status "pending"

- [ ] **Edit Experience**
  - [ ] Edit existing experience
  - [ ] Update details and images
  - [ ] Changes saved

- [ ] **View Experiences**
  - [ ] See all experiences
  - [ ] Filter by status
  - [ ] View experience statistics

### Booking Management
- [ ] **View Experience Bookings**
  - [ ] See all bookings for vendor's experiences
  - [ ] View booking details
  - [ ] Filter by date, experience

### Refunds
- [ ] **Manage Experience Booking Refunds**
  - [ ] View pending refund requests
  - [ ] Approve refund with amount
  - [ ] Reject refund with reason
  - [ ] Refund status updated

### Payouts
- [ ] **View Vendor Payouts**
  - [ ] See settlement queue
  - [ ] See payout history
  - [ ] View financial breakdown

### Settings
- [ ] **Update Vendor Settings**
  - [ ] Update public bio
  - [ ] Upload logo
  - [ ] View application details

---

## 👨‍💼 Admin Flows

### Dashboard & Analytics
- [ ] **View Admin Dashboard**
  - [ ] See platform-wide statistics (revenue, bookings, users)
  - [ ] View referral statistics
  - [ ] Check recent activity

### Trip Management
- [ ] **Review Trips**
  - [ ] View pending trips
  - [ ] Approve trip (status → "published")
  - [ ] Reject trip with remarks (status → "draft")
  - [ ] Audit log created for approval/rejection

### Experience Management
- [ ] **Review Experiences**
  - [ ] View pending experiences
  - [ ] Approve experience (status → "published")
  - [ ] Reject experience with remarks
  - [ ] Audit log created

### Organizer Management
- [ ] **Review Organizer Applications**
  - [ ] View pending applications
  - [ ] Approve application (create organizer record, update user role)
  - [ ] Reject application with reason
  - [ ] View organizer details and documents

- [ ] **Manage Organizers**
  - [ ] View all organizers
  - [ ] Update organizer status
  - [ ] View organizer statistics

### Booking Management
- [ ] **View All Bookings**
  - [ ] See all platform bookings (trips and experiences)
  - [ ] Filter by status, organizer, date
  - [ ] View booking details
  - [ ] Cancel booking if needed

### Refund Management
- [ ] **Process Refunds**
  - [ ] View refund requests approved by organizer
  - [ ] Process refund via Razorpay
  - [ ] Enter UTR number
  - [ ] Refund status updated to "processed"
  - [ ] Refund visible in history

### Settlements
- [ ] **Manage Settlements**
  - [ ] View settlement queue
  - [ ] Generate invoices (if applicable)
  - [ ] Process payout
  - [ ] Enter UTR number
  - [ ] Settlement status updated

### Referrals
- [ ] **View Referral Program**
  - [ ] See all referral records
  - [ ] View referral statistics (total bonus paid, total referrals)
  - [ ] Filter by referrer, referred user

### Leads
- [ ] **Manage Leads**
  - [ ] View all leads
  - [ ] Filter by status, organizer, destination
  - [ ] Update lead status

### Reviews
- [ ] **Manage Reviews**
  - [ ] View all reviews
  - [ ] Filter by trip, rating
  - [ ] Delete inappropriate reviews (if functionality exists)

### Promotions/Coupons
- [ ] **Manage Coupons**
  - [ ] View all coupons (global and organizer-specific)
  - [ ] Create global coupon
  - [ ] Toggle coupon status
  - [ ] View coupon usage statistics

### Settings
- [ ] **Platform Settings**
  - [ ] Update commission rate
  - [ ] Update referral bonus amount
  - [ ] Update subscription pricing
  - [ ] Toggle feature flags
  - [ ] Changes saved and reflected across platform

### Content Management
- [ ] **Blog/Stories**
  - [ ] View all blog stories
  - [ ] Approve/reject stories
  - [ ] Delete stories

### Audit Logs
- [ ] **View Audit Logs**
  - [ ] See all admin actions
  - [ ] Filter by action type, entity type, date
  - [ ] Search logs

---

## 💳 Payment Integration Testing

### Razorpay Integration
- [ ] **Order Creation**
  - [ ] Trip booking creates Razorpay order
  - [ ] Experience booking creates Razorpay order
  - [ ] Pro subscription creates Razorpay order
  - [ ] Lead credits purchase creates Razorpay order
  - [ ] Order amounts are correct (with discounts, taxes, fees)

- [ ] **Payment Flow**
  - [ ] Razorpay checkout modal opens
  - [ ] Pre-filled user details appear
  - [ ] Payment can be completed
  - [ ] Payment can be cancelled
  - [ ] Error handling for failed payments

- [ ] **Webhook Processing**
  - [ ] `payment.captured` webhook received
  - [ ] Booking status updated correctly
  - [ ] Wallet transactions created for referral bonuses
  - [ ] Subscription activated for Pro payments
  - [ ] Lead credits incremented for credit purchases
  - [ ] Trip batch slots decremented
  - [ ] AI credits granted

- [ ] **Refund Processing**
  - [ ] Razorpay refund created successfully
  - [ ] Refund status updated in booking
  - [ ] Refund amount correct

---

## 🐛 Error Handling & Edge Cases

### Authentication Errors
- [ ] Invalid OTP shows error
- [ ] Expired session redirects to login
- [ ] Unauthorized access shows 403 error

### Booking Errors
- [ ] Booking with no available slots shows error
- [ ] Booking with invalid batch shows error
- [ ] Duplicate booking prevented (if applicable)

### Payment Errors
- [ ] Failed payment shows error message
- [ ] Payment timeout handled gracefully
- [ ] Partial payment scenarios (if applicable)

### Validation Errors
- [ ] Form validation works (required fields, formats)
- [ ] File upload size limits enforced
- [ ] Invalid file types rejected

### Network Errors
- [ ] Offline handling (if applicable)
- [ ] API timeout errors handled
- [ ] Retry mechanisms (if applicable)

---

## 🔒 Security Testing

### Authorization
- [ ] Users cannot access admin pages
- [ ] Organizers cannot access other organizers' data
- [ ] Travelers cannot access organizer pages
- [ ] API endpoints enforce proper authorization

### Data Validation
- [ ] SQL injection attempts fail (Firestore handles this, but verify)
- [ ] XSS attempts are sanitized
- [ ] File uploads are validated

### Session Management
- [ ] Session cookies are secure (HttpOnly, Secure flags)
- [ ] Session expires after inactivity
- [ ] Concurrent sessions handled (if applicable)

---

## 📊 Performance Testing

### Page Load Times
- [ ] Home page loads quickly
- [ ] Trip/experience listings load efficiently
- [ ] Dashboard pages load within acceptable time

### API Response Times
- [ ] API endpoints respond quickly (< 2s for most operations)
- [ ] Complex queries (analytics, settlements) complete within acceptable time
- [ ] File uploads complete successfully

---

## ✅ Final Checklist

### Critical Paths Verified
- [ ] User can signup, login, and book a trip
- [ ] Organizer can create trip and receive bookings
- [ ] Vendor can create experience and receive bookings
- [ ] Admin can approve trips/experiences
- [ ] Payments complete successfully
- [ ] Refunds process correctly
- [ ] Settlements calculate correctly

### Data Integrity
- [ ] All data persists correctly in Firestore
- [ ] Relationships between collections maintained (trips → bookings, etc.)
- [ ] Financial calculations are accurate
- [ ] Referral bonuses awarded correctly

### User Experience
- [ ] Error messages are clear and helpful
- [ ] Loading states shown during async operations
- [ ] Success messages confirm actions
- [ ] Navigation works correctly
- [ ] Responsive design works on mobile/tablet

---

## 📝 Testing Notes Template

```
Date: ___________
Tester: ___________

### Issues Found:
1. [Issue description]
   - Page/Component: ___________
   - Steps to reproduce: ___________
   - Expected: ___________
   - Actual: ___________
   - Priority: [High/Medium/Low]
   - Screenshot: ___________

### Test Results Summary:
- Total Tests: ___________
- Passed: ___________
- Failed: ___________
- Blocked: ___________
```

---

## 🚀 Post-Testing

- [ ] Document all issues found
- [ ] Prioritize fixes
- [ ] Create bug reports
- [ ] Verify fixes
- [ ] Re-test critical paths after fixes
- [ ] Prepare production deployment checklist

