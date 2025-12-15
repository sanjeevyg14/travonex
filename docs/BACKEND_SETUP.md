# Travonex Backend Setup Guide

This document provides a comprehensive guide for setting up the production-ready backend for Travonex Travel Marketplace.

## Overview

The backend is built using:
- **Next.js API Routes** - Serverless API endpoints
- **Firebase Authentication** - Phone number (OTP) based authentication
- **Firestore Database** - NoSQL database for all data storage
- **Firebase Storage** - File and image storage
- **Razorpay** - Payment gateway integration

## Prerequisites

1. Firebase Project with:
   - Authentication enabled (Phone provider)
   - Firestore Database
   - Storage bucket
   - Service account credentials

2. Razorpay Account with:
   - API Key ID
   - API Key Secret
   - Webhook Secret

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key (can be base64 encoded)
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email Service (Optional)
BREVO_API_KEY=your_brevo_api_key
```

## Firebase Setup

### 1. Enable Phone Authentication

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Phone" provider
3. Configure reCAPTCHA settings

### 2. Firestore Database

The database uses the following collections:

- `users` - User profiles
- `trips` - Trip listings
- `bookings` - Trip bookings
- `experiences` - Experience listings
- `experience_bookings` - Experience bookings
- `organizers` - Organizer profiles
- `reviews` - Reviews for trips/experiences
- `coupons` - Discount coupons
- `wallet_transactions` - Wallet transaction history
- `leads` - Lead management

### 3. Firestore Security Rules

Security rules are defined in `firestore.rules`. Key rules:

- Users can read their own data
- Trips are publicly readable when published
- Bookings are readable by traveler, organizer, or admin
- Wallet transactions are write-only by server

Deploy rules using:
```bash
firebase deploy --only firestore:rules
```

### 4. Firebase Storage

Configure storage bucket and set up rules for file uploads:
- Organizers can upload documents
- Users can upload profile images
- Public read access for published content

## Razorpay Setup

### 1. Account Configuration

1. Create a Razorpay account
2. Get API keys from Settings → API Keys
3. Enable webhooks in Settings → Webhooks

### 2. Webhook Configuration

Configure webhook endpoint: `https://yourdomain.com/api/webhooks/razorpay`

Subscribe to events:
- `payment.captured`
- `payment.authorized`
- `payment.failed`

### 3. Test Mode

Use Razorpay test keys for development. Test cards:
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Create session cookie
- `POST /api/auth/signup` - Create new user account

### Trips

- `GET /api/trips` - List trips (query params: `organizerId`, `status`, `limit`)
- `GET /api/trips/[tripId]` - Get single trip
- `POST /api/trips` - Create trip (organizer auth required)
- `PUT /api/trips/[tripId]` - Update trip (owner/admin required)
- `DELETE /api/trips/[tripId]` - Delete trip (admin only)

### Bookings

- `GET /api/bookings` - List bookings (user's or organizer's)
- `GET /api/bookings/[bookingId]` - Get single booking
- `POST /api/bookings` - Create booking with payment order
- `PUT /api/bookings/[bookingId]` - Update booking
- `POST /api/bookings/[bookingId]/refund?action=request` - Request refund
- `POST /api/bookings/[bookingId]/refund?action=approve` - Approve refund (organizer)
- `POST /api/bookings/[bookingId]/refund?action=reject` - Reject refund (organizer)
- `POST /api/bookings/[bookingId]/refund?action=process` - Process refund (admin)

### Payments

- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/webhooks/razorpay` - Razorpay webhook handler

### Organizers

- `GET /api/organizers` - List organizers
- `GET /api/organizers/[organizerId]` - Get organizer
- `PUT /api/organizers/[organizerId]` - Update organizer
- `POST /api/organizers/[organizerId]/application` - Submit application

### Experiences

- `GET /api/experiences` - List experiences
- `GET /api/experiences/[experienceId]` - Get experience
- `POST /api/experiences` - Create experience
- `PUT /api/experiences/[experienceId]` - Update experience
- `DELETE /api/experiences/[experienceId]` - Delete experience

### Experience Bookings

- `GET /api/experiences/bookings` - List experience bookings
- `POST /api/experiences/bookings` - Create experience booking

### Reviews

- `GET /api/reviews?tripId=xxx` - Get trip reviews
- `GET /api/reviews?experienceId=xxx` - Get experience reviews
- `POST /api/reviews` - Create review

### Coupons

- `GET /api/coupons` - List coupons
- `POST /api/coupons` - Create coupon (admin/organizer)

### Wallet

- `GET /api/wallet/transactions` - Get wallet transactions
- `POST /api/wallet/transactions` - Create transaction (server-side)

### Upload

- `POST /api/upload` - Upload file (multipart/form-data)
  - Body: `file` (File), `folder` (optional string)

## Authentication Flow

1. User enters phone number
2. Firebase sends OTP via SMS
3. User enters OTP
4. Frontend verifies OTP with Firebase
5. Frontend calls `/api/auth/login` or `/api/auth/signup` with ID token
6. Backend creates session cookie
7. Subsequent requests include session cookie

## Booking Flow

1. User selects trip and batch
2. Frontend calls `POST /api/bookings` with booking details
3. Backend:
   - Validates batch availability
   - Calculates price (applies Pro discount, coupons)
   - Creates booking record (status: "Reserved")
   - Creates Razorpay order
4. Frontend initiates Razorpay payment
5. User completes payment
6. Razorpay sends webhook to `/api/webhooks/razorpay`
7. Backend:
   - Verifies webhook signature
   - Updates booking with payment ID
   - Decrements batch available slots
   - Confirms booking

## Refund Flow

1. Traveler requests refund via `POST /api/bookings/[id]/refund?action=request`
2. Organizer reviews and approves/rejects via same endpoint
3. Admin processes refund via `POST /api/bookings/[id]/refund?action=process`
4. Backend calls Razorpay refund API
5. Booking status updated to "Cancelled"
6. Batch slots restored

## Pro Subscription Discount

Pro members receive a 5% discount on bookings:

1. Backend checks user's subscription status
2. If active Pro member, applies 5% discount
3. Discount amount stored in `booking.proDiscount`
4. Final price reflects discounted amount

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": "Error message"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing

### Test Authentication

1. Use Firebase Console → Authentication to add test users
2. Or use phone number verification in test mode

### Test Payments

1. Use Razorpay test keys
2. Use test card numbers provided by Razorpay
3. Monitor webhook calls in Razorpay dashboard

### Test Bookings

1. Create test trips via API or Firebase Console
2. Create bookings with test payment
3. Verify webhook processing

## Deployment

### Environment Variables

Set all environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Firebase Hosting: Use `.env` file or hosting config

### Build

```bash
npm run build
```

### Deploy

```bash
npm run start
```

Or use your hosting platform's deployment method.

## Security Considerations

1. **Never expose** Firebase Admin credentials to client
2. **Always verify** Razorpay webhook signatures
3. **Validate** all user inputs on server
4. **Use** Firestore security rules as additional layer
5. **Rate limit** API endpoints in production
6. **Monitor** webhook events for suspicious activity

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Check Razorpay Dashboard for payment issues
3. Review server logs
4. Check Firestore security rules

## Next Steps

1. Set up Firebase project
2. Configure environment variables
3. Deploy Firestore security rules
4. Set up Razorpay account
5. Configure webhook endpoint
6. Test authentication flow
7. Test booking flow
8. Deploy to production

