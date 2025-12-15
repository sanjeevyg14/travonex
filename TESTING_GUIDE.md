# Travonex Testing Guide

Comprehensive testing checklist for all platform features after backend integration.

## Pre-Testing Setup

- [ ] All environment variables are set in `.env.local`
- [ ] Firebase services are enabled (Auth, Firestore, Storage)
- [ ] Razorpay test keys are configured
- [ ] Dev server is running: `npm run dev`
- [ ] Firebase Console is open to monitor data
- [ ] Razorpay Dashboard is open to monitor payments

---

## 1. Authentication Flow Testing

### Sign Up / Registration
- [ ] **Phone number entry**
  - Enter valid Indian phone number
  - Verify OTP is received
  - Complete registration

- [ ] **Referral code (if provided)**
  - Sign up with referral code
  - Verify both users receive ₹100 bonus
  - Check wallet transactions in Firebase

- [ ] **User creation**
  - Verify user document created in Firestore `users` collection
  - Verify `referralCode` is generated
  - Verify `role` is set to "traveler"
  - Verify `walletBalance` is updated (if referral bonus applied)

### Login
- [ ] **Existing user login**
  - Login with registered phone number
  - Verify session cookie is set
  - Verify user can access dashboard

- [ ] **Session persistence**
  - Refresh page - user should remain logged in
  - Close browser and reopen - session should persist

### Logout
- [ ] **Logout functionality**
  - Click logout
  - Verify session cookie is cleared
  - Verify redirect to login/home page

---

## 2. User Dashboard & Profile Testing

### Dashboard
- [ ] **View bookings**
  - Login as traveler
  - Navigate to dashboard
  - Verify bookings are fetched from API
  - Verify booking details are correct
  - Check loading states

- [ ] **View saved trips**
  - Verify saved trips appear
  - Verify "Save Trip" button works
  - Check that trips are added/removed from saved list

### Profile Management
- [ ] **Edit profile**
  - Update name, email, bio
  - Upload profile picture
  - Select travel interests/cities
  - Save changes
  - Verify updates in Firestore
  - Verify UI reflects changes

---

## 3. Trip Discovery & Booking Flow

### Trip Discovery
- [ ] **Browse trips**
  - View trips on homepage
  - Verify trips are fetched from API
  - Check filters work (category, difficulty, price range)
  - Verify search functionality

- [ ] **Trip details**
  - Click on a trip
  - Verify all trip details load correctly
  - Check images display
  - Verify available batches/dates show

### Booking Flow
- [ ] **Create booking (Full Payment)**
  1. Select trip and batch
  2. Enter traveler details
  3. Add co-travelers (optional)
  4. Proceed to payment
  5. Verify Razorpay order is created
  6. Complete payment with test card
  7. Verify booking confirmation
  8. Check booking in Firestore:
     - Status is "Confirmed"
     - Payment ID is stored
     - Batch slots are decremented
     - AI credits are granted to user

- [ ] **Create booking (Partial Payment)**
  1. Select trip with partial payment option
  2. Verify 10% payment option appears
  3. Complete partial payment
  4. Verify booking status is "Reserved"
  5. Verify remaining balance is tracked

- [ ] **Pro Member Discount**
  1. Login as Pro member
  2. Create booking
  3. Verify 5% discount is applied
  4. Check `proDiscount` field in booking

- [ ] **Coupon Application**
  1. Apply valid coupon code
  2. Verify discount is applied
  3. Verify coupon usage count increases
  4. Try invalid/expired coupon - should fail

---

## 4. Payment Integration Testing

### Razorpay Integration
- [ ] **Payment success**
  - Complete payment with test card: `4111 1111 1111 1111`
  - Verify webhook is received
  - Verify booking is confirmed
  - Check Razorpay dashboard for payment record

- [ ] **Payment failure**
  - Try payment with failure card: `4000 0000 0000 0002`
  - Verify error handling
  - Verify booking remains in "Reserved" state

- [ ] **Webhook processing**
  - Check server logs for webhook calls
  - Verify webhook signature validation
  - Verify booking updates correctly

---

## 5. Organizer Features Testing

### Organizer Application
- [ ] **Trip Organizer Application**
  1. Navigate to organizer application page
  2. Fill all required fields
  3. Upload documents (PAN, ID proof, bank statement)
  4. Submit application
  5. Verify application stored in Firestore
  6. Verify documents uploaded to Storage
  7. Check application appears in admin panel

- [ ] **Experience Vendor Application**
  1. Navigate to vendor application page
  2. Fill required fields
  3. Upload vendor-specific documents
  4. Submit application
  5. Verify application stored correctly

### Organizer Dashboard
- [ ] **View trips**
  - Login as organizer
  - Navigate to trips page
  - Verify organizer's trips are listed
  - Verify booking counts show correctly

- [ ] **Create trip**
  1. Create new trip
  2. Fill all required fields
  3. Add multiple batches
  4. Upload images
  5. Submit for approval
  6. Verify trip in Firestore with status "pending"
  7. Verify trip appears in admin panel for approval

- [ ] **View bookings**
  - Check bookings page
  - Verify bookings are filtered by organizer
  - Verify booking details are correct

- [ ] **View payouts**
  - Check payouts page
  - Verify settlement data is calculated correctly
  - Verify commission is deducted properly

---

## 6. Experience Features Testing

### Experience Discovery
- [ ] **Browse experiences**
  - View experiences page
  - Verify experiences load from API
  - Check filters work

- [ ] **Experience details**
  - Click on experience
  - Verify all details load
  - Verify booking form works

### Experience Booking
- [ ] **Book experience**
  1. Select date and participants
  2. Complete booking
  3. Complete payment
  4. Verify booking in Firestore
  5. Verify vendor sees booking

---

## 7. Admin Panel Testing

### Trips Management
- [ ] **View all trips**
  - Verify trips list loads
  - Check filters work (status, organizer)
  - Verify search works

- [ ] **Approve trip**
  1. Find pending trip
  2. Click approve
  3. Verify trip status changes to "published"
  4. Verify audit log is created

- [ ] **Reject trip**
  1. Find pending trip
  2. Click reject
  3. Add rejection reason
  4. Verify trip status changes to "rejected"
  5. Verify organizer is notified

### Bookings Management
- [ ] **View all bookings**
  - Verify bookings list loads
  - Check filters work (status, date range)
  - Verify booking details are correct

- [ ] **Cancel booking**
  1. Find confirmed booking
  2. Cancel with reason
  3. Verify refund is initiated
  4. Verify booking status updates

### Refunds Management
- [ ] **Process refund**
  1. Find refund request
  2. Verify refund details
  3. Process refund
  4. Verify Razorpay refund API is called
  5. Verify booking status updates
  6. Verify wallet transaction is created

### Settlements
- [ ] **View settlements**
  - Check settlements page
  - Verify settlement calculations
  - Verify batches are grouped correctly
  - Check payout details

### Analytics
- [ ] **View analytics**
  - Check analytics dashboard
  - Verify metrics are calculated correctly:
    - Total revenue
    - Total bookings
    - Active trips
    - Active users
    - Referral stats

### Settings
- [ ] **Update platform settings**
  1. Change commission rate
  2. Change referral bonus amount
  3. Update Pro subscription prices
  4. Save changes
  5. Verify settings saved in Firestore
  6. Verify changes apply to new bookings

### Leads Management
- [ ] **View leads**
  - Check leads page
  - Verify leads are listed
  - Verify status badges work

### Referrals
- [ ] **View referrals**
  - Check referrals page
  - Verify referral list loads
  - Verify statistics are correct

---

## 8. Pro Subscription Testing

### Subscription Purchase
- [ ] **Monthly subscription**
  1. Navigate to Pro page
  2. Select monthly plan
  3. Complete payment
  4. Verify subscription activated
  5. Verify user's `subscriptionTier` is "pro"
  6. Verify `subscriptionHistory` is updated

- [ ] **Annual subscription**
  1. Select annual plan
  2. Complete payment
  3. Verify subscription activated
  4. Verify discount is applied

- [ ] **Subscription benefits**
  - Verify Pro discount on bookings
  - Verify increased cashback rate
  - Verify access to Pro features

---

## 9. Reviews & Ratings Testing

### Create Review
- [ ] **Submit review**
  1. Navigate to booking details
  2. Submit review with rating and comment
  3. Verify review saved in Firestore
  4. Verify trip/experience rating is updated
  5. Verify review count increments

- [ ] **View reviews**
  - Check reviews appear on trip/experience page
  - Verify reviews are sorted correctly

---

## 10. Wallet & Transactions Testing

### Wallet Balance
- [ ] **Check wallet balance**
  - View wallet page
  - Verify balance is correct
  - Verify transaction history loads

- [ ] **Referral bonus**
  - Verify referral bonuses are credited
  - Verify transactions are recorded

- [ ] **Refund credits**
  - Verify refunds are credited to wallet
  - Verify transaction record is created

---

## 11. Error Handling Testing

### Network Errors
- [ ] **Offline behavior**
  - Disconnect internet
  - Try to create booking
  - Verify appropriate error message

- [ ] **API errors**
  - Test with invalid data
  - Verify error messages are user-friendly
  - Verify errors are logged

### Validation Errors
- [ ] **Form validation**
  - Submit empty forms
  - Submit invalid data
  - Verify validation messages appear

### Authentication Errors
- [ ] **Unauthorized access**
  - Try accessing protected routes without login
  - Verify redirect to login
  - Verify proper error handling

---

## 12. Performance Testing

- [ ] **Page load times**
  - Check initial page load
  - Check data fetching times
  - Verify loading states appear

- [ ] **API response times**
  - Monitor API call performance
  - Check for slow queries
  - Verify pagination works for large datasets

- [ ] **Image loading**
  - Verify images load efficiently
  - Check lazy loading works
  - Verify placeholder images show

---

## 13. Data Integrity Testing

### Firestore Data
- [ ] **Verify data structure**
  - Check all documents have required fields
  - Verify field types are correct
  - Verify relationships are maintained

- [ ] **Transaction integrity**
  - Verify referral bonuses are atomic
  - Verify booking creation and slot decrement are atomic
  - Verify refund processing is atomic

### Referential Integrity
- [ ] **Check relationships**
  - Verify booking references valid trip
  - Verify trip references valid organizer
  - Verify review references valid booking

---

## 14. Security Testing

- [ ] **Authentication checks**
  - Verify API endpoints check authentication
  - Verify role-based access control works
  - Verify users can't access others' data

- [ ] **Input validation**
  - Test SQL injection (shouldn't apply to Firestore)
  - Test XSS attempts
  - Test invalid file uploads

- [ ] **Payment security**
  - Verify payment signatures are validated
  - Verify webhook signatures are checked
  - Verify sensitive data is not logged

---

## 15. Browser Compatibility

- [ ] **Desktop browsers**
  - Chrome
  - Firefox
  - Safari
  - Edge

- [ ] **Mobile browsers**
  - Chrome Mobile
  - Safari Mobile
  - Test responsive design

---

## Testing Checklist Summary

### Critical Paths (Must Test First)
1. ✅ Authentication (Sign up, Login, Logout)
2. ✅ Trip booking with payment
3. ✅ Admin trip approval
4. ✅ Organizer trip creation

### High Priority
5. ✅ Refund flow
6. ✅ Pro subscription
7. ✅ Referral system
8. ✅ Wallet transactions

### Medium Priority
9. ✅ Reviews and ratings
10. ✅ Experience booking
11. ✅ Settlements
12. ✅ Analytics

### Low Priority
13. ✅ Settings management
14. ✅ Blog/stories
15. ✅ Email notifications

---

## Common Issues to Watch For

1. **Session Cookie Issues**
   - Check if cookies are being set correctly
   - Verify SameSite attributes
   - Check cookie expiration

2. **Firebase Admin Initialization**
   - Check console for initialization errors
   - Verify private key format
   - Check service account permissions

3. **Payment Webhook Issues**
   - Verify webhook URL is accessible
   - Check webhook signature validation
   - Monitor webhook delivery in Razorpay dashboard

4. **File Upload Issues**
   - Check Firebase Storage rules
   - Verify file size limits
   - Check file type restrictions

5. **Firestore Query Issues**
   - Check for missing indexes
   - Verify query filters are correct
   - Check pagination limits

---

## Testing Tools

- **Firebase Console**: Monitor Firestore, Auth, Storage
- **Razorpay Dashboard**: Monitor payments and webhooks
- **Browser DevTools**: Check network requests, console errors
- **React DevTools**: Inspect component state
- **Postman/Thunder Client**: Test API endpoints directly

---

## Reporting Issues

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots/error messages**
5. **Browser/device info**
6. **Network logs (if relevant)**
7. **Firebase/Razorpay logs (if relevant)**

---

## Next Steps After Testing

1. Fix any critical bugs
2. Optimize performance issues
3. Update documentation
4. Deploy to staging environment
5. Conduct user acceptance testing
6. Deploy to production

---

Good luck with testing! 🚀


