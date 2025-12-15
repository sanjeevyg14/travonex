# Quick Start Testing Guide 🚀

This guide helps you test the **most critical paths** first to verify everything is working correctly.

## ⚡ Setup (5 minutes)

1. **Verify credentials are set** (check `.env.local`):
   ```bash
   # Quick check - should NOT show "missing credentials" in console
   npm run dev
   ```

2. **Open these tabs**:
   - Your app: `http://localhost:3000`
   - Firebase Console: https://console.firebase.google.com
   - Razorpay Dashboard: https://dashboard.razorpay.com (Test Mode)

3. **Check Firebase Console**:
   - Authentication → Sign-in method → Phone enabled ✓
   - Firestore Database exists ✓
   - Storage bucket exists ✓

---

## 🎯 Critical Path #1: Authentication (5 minutes)

### Test Signup & Login
1. Go to `/signup`
2. Enter phone number: `+919876543210` (or your test number)
3. Complete OTP verification
4. **Expected**: 
   - ✅ User created in Firestore `users` collection
   - ✅ Session cookie set
   - ✅ Redirected to dashboard
   - ✅ Referral code generated

### Test Login
1. Go to `/login`
2. Enter same phone number
3. Complete OTP
4. **Expected**: 
   - ✅ Session cookie set
   - ✅ Dashboard loads with user data

**✅ If this works → Authentication is working!**

---

## 🎯 Critical Path #2: Trip Booking Flow (10 minutes)

### Prerequisites
- You need at least ONE published trip in the system
- If no trips exist, create one via admin panel (see Path #3) or manually in Firestore

### Test Booking
1. **Login as traveler** (from Path #1)
2. **Browse trips** on homepage
3. **Click a trip** → View trip details
4. **Click "Book Now"**
5. **Fill booking form**:
   - Select a batch
   - Enter number of travelers
   - Click "Proceed to Payment"
6. **Complete Razorpay payment**:
   - Use test card: `4111 1111 1111 1111`
   - Any future expiry (e.g., 12/25)
   - Any CVV (e.g., 123)
   - Name: Test User
7. **After payment**:
   - ✅ Should redirect to success page
   - ✅ Booking visible in "My Bookings"
   - ✅ Check Firestore `bookings` collection for new booking
   - ✅ Check trip batch `availableSlots` decremented
   - ✅ Check Razorpay dashboard for payment

**✅ If this works → Booking flow is working!**

---

## 🎯 Critical Path #3: Organizer Flow (15 minutes)

### Create Admin User (One-time setup)
```javascript
// In Firestore Console, create a user document:
// Collection: users
// Document ID: <your-uid-from-auth>
{
  "uid": "<your-uid>",
  "phone": "+919876543210",
  "role": "admin",
  "name": "Test Admin",
  "email": "admin@test.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Test Admin Trip Approval
1. **Login as admin** → Go to `/management/trips`
2. **Find a pending trip** (or create one via organizer account)
3. **Click "Approve"**
4. **Expected**:
   - ✅ Trip status → "published"
   - ✅ Trip visible on homepage
   - ✅ Audit log created

### Test Organizer Trip Creation
1. **Create organizer account**:
   - Go to `/dashboard/organizer-application`
   - Fill form and submit
   - (In production, admin approves; for testing, manually set role to "organizer" in Firestore)
2. **Login as organizer** → Go to `/organizer/trips`
3. **Click "Create New Trip"**
4. **Fill trip form** (minimum required fields):
   - Title, description, location
   - At least one batch with dates
   - Price
   - Upload at least one image
5. **Submit trip**
6. **Expected**:
   - ✅ Trip created with status "pending"
   - ✅ Trip visible in admin panel
   - ✅ Admin can approve it

**✅ If this works → Organizer flow is working!**

---

## 🎯 Critical Path #4: Payment Webhook (5 minutes)

### Verify Webhook Processing
1. After completing a booking (from Path #2):
2. **Check server logs** for webhook processing
3. **Check Razorpay Dashboard** → Webhooks → See webhook delivery
4. **Expected**:
   - ✅ Webhook received at `/api/webhooks/razorpay`
   - ✅ Booking status updated to "Confirmed"
   - ✅ If referral signup, wallet transactions created

**✅ If this works → Webhook integration is working!**

---

## 🎯 Critical Path #5: Refund Flow (10 minutes)

### Test Refund Request
1. **As traveler**: Go to booking details
2. **Click "Request Refund"**
3. **Enter reason** and submit
4. **Expected**:
   - ✅ Booking `refundStatus` → "requested"
   - ✅ Refund request visible to organizer

### Test Refund Approval (as organizer)
1. **Login as organizer** → Go to refunds page
2. **Find pending refund request**
3. **Click "Approve"** → Enter amount and remarks
4. **Expected**:
   - ✅ `refundStatus` → "approved_by_organizer"
   - ✅ Refund visible to admin

### Test Refund Processing (as admin)
1. **Login as admin** → Go to `/management/refunds`
2. **Find approved refund**
3. **Click "Process Refund"**
4. **Expected**:
   - ✅ Razorpay refund API called
   - ✅ `refundStatus` → "processed"
   - ✅ Refund visible in Razorpay dashboard

**✅ If this works → Refund flow is working!**

---

## 🔍 Quick Health Checks

### API Endpoints
Test these in browser console or Postman:

```javascript
// Check if APIs are responding
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)

fetch('/api/trips')
  .then(r => r.json())
  .then(console.log)

fetch('/api/settings')
  .then(r => r.json())
  .then(console.log)
```

### Firestore Collections
Check these exist and have data:
- ✅ `users`
- ✅ `trips`
- ✅ `bookings`
- ✅ `organizers`
- ✅ `settings` (at least one document with platform settings)

### Firebase Services
- ✅ Authentication working (can send OTP)
- ✅ Firestore accessible (can read/write)
- ✅ Storage accessible (can upload files)

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Firebase Admin missing credentials"
**Fix**: Check `.env.local` has `FIREBASE_ADMIN_PRIVATE_KEY` and `FIREBASE_ADMIN_CLIENT_EMAIL`

### Issue: "Payment not processing"
**Fix**: 
- Use test mode keys in Razorpay
- Check webhook URL is accessible
- Verify webhook secret matches

### Issue: "Session not persisting"
**Fix**: 
- Check cookies are enabled
- Verify `credentials: 'include'` in API calls
- Check middleware is not blocking requests

### Issue: "Cannot upload files"
**Fix**: 
- Check Firebase Storage rules
- Verify bucket name in env vars
- Check file size limits

---

## ✅ Success Criteria

If ALL critical paths pass:
- ✅ Users can signup/login
- ✅ Users can book trips
- ✅ Organizers can create trips
- ✅ Admins can approve trips
- ✅ Payments process successfully
- ✅ Refunds work end-to-end

**→ You're ready for comprehensive testing!**

---

## 📋 Next Steps

1. **Complete comprehensive testing** using `COMPREHENSIVE_TESTING_CHECKLIST.md`
2. **Test edge cases** (see checklist)
3. **Performance testing** (page load times, API response times)
4. **Security testing** (authorization, input validation)
5. **Fix any bugs** found
6. **Deploy to staging** for user acceptance testing

---

## 🆘 Need Help?

- Check `TESTING_GUIDE.md` for detailed test cases
- Check `SETUP_CREDENTIALS_GUIDE.md` for credential setup
- Check `COMPLETE_API_REFERENCE.md` for API documentation
- Review server logs for error messages
- Check browser console for client-side errors

Good luck! 🚀

