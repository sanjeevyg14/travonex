# Travonex: Backend Update Guide (7th Dec 2025)

This document summarizes the recent frontend changes and outlines the corresponding backend tasks required to support them.

## 1. Pro Subscription Feature Flag

A new global feature flag has been introduced to enable or disable the "Travonex Pro" subscription feature across the platform.

**Backend Task:**
- Your API should expose a global settings endpoint (e.g., `GET /api/settings`) that includes a boolean flag like `isProSubscriptionEnabled`.
- All backend logic related to Pro features—such as applying discounts, checking for exclusive access, or processing subscriptions—must first check this flag. If it's `false`, the logic should be bypassed.

## 2. Pro Membership Discount (Change from Cashback)

The business logic for Pro member benefits has changed significantly. It is no longer a "cashback" system. It is now an **immediate, upfront discount** applied at the time of booking.

**Backend Task:**
- **Modify Booking Endpoint (`POST /api/bookings`):**
  - When creating a booking, your API must check if the authenticated user has an active Pro subscription.
  - If they are a Pro member, the backend **must** calculate and apply the 5% discount to the final price *before* creating a payment session with the payment gateway (e.g., Stripe, Razorpay).
  - The final `totalPrice` stored in the `Booking` record should reflect the discounted amount.
  - A new field, `proDiscount` (number), has been added to the `Booking` type in `src/lib/types.ts`. Your backend should store the calculated discount amount in this field for auditing and display purposes.
- The previous "cashback" fields and logic can now be deprecated or removed.

## 3. Co-Traveler Data Collection

The `Booking` model has been expanded to capture details for all travelers in a group, not just the lead traveler.

**Backend Task:**
- **Update `Booking` Schema:** Modify your database schema for the `bookings` collection/table to include a new field:
  - `coTravelers`: An array of objects. Each object should contain:
    - `name` (string)
    - `gender` (string)
    - `email` (string)
    - `phone` (string)
- **Update Booking Endpoint (`POST /api/bookings`):** Your endpoint must now be able to accept this array of co-traveler objects in the request payload and store it with the booking record.

## 4. Video URL for Experiences

The `Experience` model has been updated to include an optional video link.

**Backend Task:**
- **Update `Experience` Schema:** Add a new optional string field, `videoUrl`, to your `experiences` table/collection.
- **Update Experience CRUD Endpoints:** The `POST /api/vendor/experiences` and `PUT /api/vendor/experiences/:id` endpoints should be updated to accept and save the `videoUrl`.

By implementing these changes, the backend will be fully aligned with the latest frontend features and data structures.
