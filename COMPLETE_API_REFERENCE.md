# Travonex Complete API Reference

This document lists all API endpoints available in the Travonex backend.

## Authentication Endpoints

- `POST /api/auth/login` - Create session cookie after Firebase auth
- `POST /api/auth/signup` - Create new user account with referral handling

## Trip Endpoints

- `GET /api/trips` - List trips (query params: `organizerId`, `status`, `limit`)
- `GET /api/trips/[tripId]` - Get single trip
- `POST /api/trips` - Create trip (organizer auth required)
- `PUT /api/trips/[tripId]` - Update trip (owner/admin required)
- `DELETE /api/trips/[tripId]` - Delete trip (admin only)

## Booking Endpoints

- `GET /api/bookings` - List bookings (query params: `organizerId` for organizer's bookings)
- `GET /api/bookings/[bookingId]` - Get single booking
- `POST /api/bookings` - Create booking with Razorpay order
- `PUT /api/bookings/[bookingId]` - Update booking
- `POST /api/bookings/[bookingId]/refund?action=request` - Request refund (traveler)
- `POST /api/bookings/[bookingId]/refund?action=approve` - Approve refund (organizer)
- `POST /api/bookings/[bookingId]/refund?action=reject` - Reject refund (organizer)
- `POST /api/bookings/[bookingId]/refund?action=process` - Process refund via Razorpay (admin)

## Payment Endpoints

- `POST /api/payments/create-order` - Create Razorpay payment order
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/webhooks/razorpay` - Razorpay webhook handler (payment events)

## Organizer Endpoints

- `GET /api/organizers` - List organizers (query params: `status`)
- `GET /api/organizers/[organizerId]` - Get organizer
- `PUT /api/organizers/[organizerId]` - Update organizer (owner/admin for status)
- `POST /api/organizers/[organizerId]/application` - Submit organizer application (multipart/form-data)

## Experience Endpoints

- `GET /api/experiences` - List experiences (query params: `vendorId`, `status`, `limit`)
- `GET /api/experiences/[experienceId]` - Get experience
- `POST /api/experiences` - Create experience (organizer auth required)
- `PUT /api/experiences/[experienceId]` - Update experience (owner/admin)
- `DELETE /api/experiences/[experienceId]` - Delete experience (admin only)

## Experience Booking Endpoints

- `GET /api/experiences/bookings` - List experience bookings (query params: `vendorId`)
- `POST /api/experiences/bookings` - Create experience booking with Razorpay order

## Review Endpoints

- `GET /api/reviews` - Get reviews (query params: `tripId` or `experienceId`)
- `POST /api/reviews` - Create review (auto-updates trip/experience ratings)

## Coupon Endpoints

- `GET /api/coupons` - List coupons (query params: `organizerId`, `code`)
- `POST /api/coupons` - Create coupon (admin/organizer)

## Wallet Endpoints

- `GET /api/wallet/transactions` - Get wallet transactions
- `POST /api/wallet/transactions` - Create transaction (server-side use)

## Lead Endpoints

- `GET /api/leads` - Get leads (query params: `organizerId`, `status`)
- `POST /api/leads` - Create lead (traveler inquiry)
- `PUT /api/leads` - Update lead status (unlock, convert, archive)

## Lead Package Endpoints

- `GET /api/lead-packages` - Get lead packages (public)
- `POST /api/lead-packages` - Create lead package (admin)
- `PUT /api/lead-packages` - Update lead package (admin)
- `DELETE /api/lead-packages` - Delete lead package (admin, query param: `packageId`)

## Blog/Story Endpoints

- `GET /api/blog` - Get blog stories (query params: `status`, `authorId`, `limit`)
- `POST /api/blog` - Create blog story (user auth required)
- `PUT /api/blog` - Update blog story status (admin)

## FAQ Endpoints

- `GET /api/faqs` - Get all FAQs (public)
- `POST /api/faqs` - Create FAQ (admin)
- `PUT /api/faqs` - Update FAQ (admin)
- `DELETE /api/faqs` - Delete FAQ (admin, query param: `faqId`)

## Saved Trips (Wishlist) Endpoints

- `GET /api/users/[userId]/saved-trips` - Get user's saved trips
- `POST /api/users/[userId]/saved-trips` - Toggle saved trip (body: `{ tripId }`)

## Subscription Endpoints

- `POST /api/subscriptions/create-checkout` - Create Pro subscription checkout (body: `{ planId: "pro-monthly" | "pro-annual" }`)

## Settings Endpoints

- `GET /api/settings` - Get platform settings (public)
- `PUT /api/settings` - Update platform settings (admin)

## Upload Endpoints

- `POST /api/upload` - Upload file to Firebase Storage (multipart/form-data: `file`, `folder`)

## Admin Endpoints

- `GET /api/admin/users` - Get all users (admin)

## Notes

1. All endpoints require authentication unless marked as "public"
2. Admin endpoints require admin role
3. Organizer endpoints require organizer role or ownership
4. Payment webhooks must be configured in Razorpay dashboard
5. File uploads support images only (max 10MB)
6. All dates are in ISO 8601 format
7. All amounts are in INR (Indian Rupees)

