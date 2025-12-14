# Travonex: The Complete Backend Integration A-Z

This document is the master guide for backend developers tasked with transitioning the Travonex platform from its current frontend-only, mock-data-driven prototype to a full-stack, production-ready application. It outlines every required API, database model, and piece of server-side logic needed.

## 1. Core Architecture: From Mock to Production

The current application is a **Next.js frontend** that simulates a backend using React hooks (`useMockData`, `useAuth`) and static data from `src/lib/data.ts`.

**The primary objective is to replace every piece of mock frontend logic with a corresponding, secure, and scalable backend API and database.**

## 2. The Data Model: Your Source of Truth

Before you begin, familiarize yourself with the application's data structures. The authoritative definitions for all data types are located in `src/lib/types.ts`. Your database schemas (e.g., Firestore collections, SQL tables) must be designed to store this information.

-   **Primary Models:** `User`, `Trip`, `Experience`, `Organizer`, `Booking`, `ExperienceBooking`.

---

## 3. The A-Z Backend Task List

This is the chronological and feature-based task list for building the entire backend.

### **Phase 1: Foundation - Authentication & User Profiles**

Your first priority is to replace the simulated user system.

#### **Task 1.1: Set Up Authentication Provider**
-   **Objective:** Implement a real authentication system. Firebase Authentication is recommended.
-   **Action:**
    1.  Set up Firebase Authentication (or another provider like Auth0, Supabase Auth).
    2.  Configure it to support phone number (OTP) based sign-in.
    3.  Create server-side functions for generating and verifying OTPs.

#### **Task 1.2: Replace `useAuth` Hook Logic**
-   **Objective:** Replace the mock login/signup logic with API calls to your new auth system.
-   **File to Edit:** `src/hooks/use-auth.tsx`
-   **Action:**
    1.  Modify the `login` function to call your backend's OTP verification endpoint.
    2.  On successful verification, your backend should either find an existing user or create a new one in the `users` collection/table.
    3.  The backend must return a full `User` object, including their `role`, `organizerStatus`, `subscriptionTier`, etc.
    4.  The frontend will then store this user object in the context, replacing the mock data.

#### **Task 1.3: Secure the Referral System**
-   **Objective:** Move the referral bonus logic to a secure backend endpoint.
-   **File to Edit:** `src/hooks/use-auth.tsx`
-   **Action:**
    1.  During signup, the frontend should send the `referralCode` to the backend.
    2.  The backend must validate the code, find the referring user, and atomically credit both the new user's and the referrer's wallets.
    3.  This requires creating new records in a `wallet_transactions` table.

#### **Task 1.4: Create User Profile APIs**
-   **Objective:** Allow users to view and update their profiles.
-   **Action:**
    1.  Create a `GET /api/users/me` endpoint that returns the profile of the currently authenticated user.
    2.  Create a `PUT /api/users/me` endpoint that allows users to update fields like `name`, `email`, `preferredCities`, `travelInterests`, emergency contacts, etc.

---

### **Phase 2: Core Product - Trips & Bookings**

This phase involves building the core marketplace functionality.

#### **Task 2.1: Replace the AI's `searchTrips` Tool**
-   **Objective:** This is the most critical integration point for the Genkit AI Planner. The AI uses this tool to find trips.
-   **File to Edit:** `src/ai/tools/trip-tools.ts`
-   **Action:**
    1.  Rewrite the body of the `searchTrips` tool.
    2.  Replace the mock array filter with a real database query (e.g., Firestore query with `where` clauses, or preferably a full-text search with a service like Algolia or Typesense).
    3.  The query **must** filter for `status: 'published'`.
    4.  It should search against `title`, `location`, `category`, and `description` using the `input.query`.
    5.  The data returned **must** match the `SearchTripsOutputSchema`.

#### **Task 2.2: Implement Booking APIs**
-   **Objective:** Replace the mock `addBooking` function with a robust, multi-step booking API.
-   **Files to Edit:** `src/app/book/[slug]/booking-form.tsx`, `src/hooks/use-mock-data.tsx`
-   **Action:**
    1.  **Create `POST /api/bookings` endpoint.** This endpoint will handle the entire booking creation process.
    2.  **Input:** It should accept `tripId`, `batchId`, `numberOfTravelers`, and any `couponCode`.
    3.  **Logic:**
        a.  **Validate Inventory:** Atomically check if the selected `batch` has enough `availableSlots`. This is critical to prevent overbooking.
        b.  **Calculate Price:** Recalculate the final price on the server, applying any valid coupons.
        c.  **Create Payment Session:** Integrate with a payment gateway (e.g., Stripe, Razorpay) to create a payment intent/order for the final amount. Return the session ID to the client.
    4.  **Implement Webhooks:** Create a webhook endpoint (e.g., `/api/webhooks/payment-complete`) to listen for success events from the payment gateway.
    5.  **On Payment Success:**
        a.  Decrement the `availableSlots` for the batch.
        b.  Create the new `Booking` record in your database.
        c.  Check for lead conversion and credit back the organizer if applicable.
        d.  Trigger confirmation emails/notifications.

---

### **Phase 3: Partner Panels - Organizer & Vendor**

This phase focuses on building the B2B SaaS tools for your partners.

#### **Task 3.1: Organizer Onboarding & Verification**
-   **Objective:** Create the backend workflow for approving new partners.
-   **Files to Edit:** `src/app/dashboard/organizer-application/page.tsx`, `src/app/management/organizers/page.tsx`
-   **Action:**
    1.  Create a `POST /api/organizers/apply` endpoint that accepts the application form data and uploaded KYC documents (storing them in a secure bucket like GCS or S3).
    2.  Create an `organizer_applications` table to store this data with a `'pending'` status.
    3.  Create admin-only endpoints (`POST /api/admin/organizers/:id/approve`, `POST /api/admin/organizers/:id/reject`) to manage the application status. Approval should create a new `Organizer` record.

#### **Task 3.2: Trip Creation & Management API**
-   **Objective:** Build the APIs for the "Create Trip" wizard.
-   **File to Edit:** `src/app/organizer/trips/new/page.tsx`
-   **Action:**
    1.  Create `POST /api/trips` and `PUT /api/trips/:id` endpoints for creating and updating trips. These endpoints must be protected and only accessible by the trip's owner (organizer).
    2.  When a trip is created or edited, it must be saved with a `status: 'pending'` and will require admin approval.

#### **Task 3.3: Experience Vendor APIs**
-   **Objective:** Build the specific APIs for the "Experiences" vertical.
-   **Action:**
    1.  **CRUD for Experiences:** Create endpoints for vendors to manage their experiences:
        -   `POST /api/vendor/experiences` (Create)
        -   `PUT /api/vendor/experiences/:id` (Update)
        -   `GET /api/vendor/experiences` (Fetch all for logged-in vendor)
    2.  **Booking Management:** Create an endpoint for vendors to view their bookings:
        -   `GET /api/vendor/experience-bookings`
    3.  **Admin Approval:** Create admin-only endpoints to approve/reject new experiences, similar to the trip approval flow.
        -   `PUT /api/admin/experiences/:id/approve`

#### **Task 3.4: Payout & Settlement System**
-   **Objective:** Automate the calculation of organizer payouts.
-   **File to Edit:** `src/app/management/settlements/page.tsx`
-   **Action:**
    1.  Create a scheduled function (e.g., a cron job) that runs weekly.
    2.  This function must:
        a.  Find all `batches` that were completed in the previous week.
        b.  For each batch, calculate the `grossRevenue` from all successful bookings.
        c.  Subtract the platform `commission` (fetch the organizer-specific rate first, then fall back to global rate).
        d.  Create a `settlement` record in a new table with the `netEarning` and a status of `'pending_payout'`.
    3.  The admin finance team will use this ledger to make bank transfers and update the status to `'paid'`.

---

### **Phase 4: Admin Panel - Full Platform Control**

This phase involves building the backend for all administrative dashboards.

-   **Objective:** For every page in `/management`, create a corresponding set of secure, admin-only API endpoints to fetch and mutate the required data.
-   **Examples:**
    -   `/management/users`: `GET /api/admin/users`, `PUT /api/admin/users/:id/status`
    -   `/management/bookings`: `GET /api/admin/bookings`
    -   `/management/promotions`: `POST /api/admin/coupons`
    -   `/management/settings`: `PUT /api/admin/settings` (for platform-wide variables like referral bonus).
    -   `/management/refunds`: `POST /api/admin/refunds/:id/process`

This comprehensive guide covers the A-Z of backend tasks. By systematically replacing each piece of mock frontend logic with these robust backend services, you will successfully transition Travonex into a scalable, production-ready platform.