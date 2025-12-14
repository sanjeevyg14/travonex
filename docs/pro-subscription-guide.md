# Pro Subscription Backend Integration Guide

This document provides a technical guide for backend developers on integrating a real subscription management and payment system to replace the current frontend-only mock of the Travonex Pro feature.

## 1. High-Level Architecture

The Travonex Pro subscription is a premium tier that offers users exclusive benefits. The current implementation is entirely simulated on the frontend within the `useAuth` hook and various UI components.

**The primary backend task is to replace this mock system with a secure, scalable subscription management service.**

Key components of the simulated subscription system:

-   **Mock Subscription Data:** The user "John Doe" (`+917777777777`) is hardcoded as a Pro member in `src/hooks/use-auth.tsx`. All other users are treated as "free" tier.
-   **Simulated Checkout:** The checkout flow at `/pro/checkout` is a complete frontend simulation. The `handleConfirmPayment` function in the component fakes a successful payment and manually updates the user's `subscriptionTier` in the React context.
-   **Gated Features:** Various components throughout the application check the `user.subscriptionTier` value to conditionally render UI or grant access (e.g., the "glass wall" on `/deals`, the advanced AI model in `/app/ai-planner/actions.ts`, and the 5% discount logic in `/app/book/[slug]/booking-form.tsx`).

## 2. The Data Model

To support subscriptions, the `User` and `Subscription` types have been defined in `src/lib/types.ts`. Your backend database schema must be able to store this information.

### 2.1. The `User` Model Subscription Fields

The following fields have been added to the `User` type:

-   `subscriptionTier`: `'free' | 'pro'`. The user's current access level.
-   `aiCredits`: `number`. A numerical value for tracking AI Planner usage for free-tier users.
-   `subscriptionHistory`: `Subscription[]`. An array to store a record of all past and present subscriptions for a user.

### 2.2. The `Subscription` Model

This is a new type to represent a single subscription record:

-   `id`: A unique identifier for the subscription instance.
-   `planId`: The ID of the plan (e.g., `pro-monthly`, `pro-annual`).
-   `planName`: A human-readable name for the plan.
-   `status`: `'active' | 'cancelled' | 'expired'`.
-   `startDate` / `endDate`: ISO date strings for the subscription period.
-   `pricePaid`: The amount paid for this subscription period.

## 3. Core Backend Implementation Tasks

### Task 1: Replace Mocked Subscription Status (`useAuth`)

The `login` function in `src/hooks/use-auth.tsx` currently assigns subscription status based on hardcoded phone numbers.

**Your Task:**

When a user successfully authenticates, your backend **must** query your database to retrieve the user's real `subscriptionTier`, `aiCredits`, and `subscriptionHistory`. This data should be returned as part of the user profile payload that is then hydrated into the frontend `useAuth` context.

### Task 2: Implement the Subscription Checkout Flow

The entire flow starting from `/pro/checkout` is a frontend simulation.

**Your Task:**

You need to create a set of API endpoints to handle a real payment and subscription lifecycle.

1.  **Create Payment Session Endpoint:**
    -   When the user clicks "Go Pro," the frontend should call a new endpoint (e.g., `POST /api/subscriptions/create-checkout-session`) with the desired plan ID (`pro-monthly` or `pro-annual`).
    -   This endpoint should integrate with a payment gateway (e.g., Stripe, Razorpay) to create a payment session.
    -   It should return a session ID or a URL that the frontend can use to redirect the user to the payment gateway.

2.  **Implement Webhooks for Payment Events:**
    -   Your backend must expose webhook endpoints to listen for events from the payment gateway.
    -   **On `checkout.session.completed` (or equivalent):** This is the most critical event. When you receive it, your backend must:
        -   Create a new `Subscription` record in your database for the user.
        -   Update the user's `subscriptionTier` to `'pro'`.
        -   Update the user's `organizerStatus` if they are an organizer, as Pro status may grant benefits.
        -   Log the transaction.
    -   **On `invoice.payment_failed` / `customer.subscription.deleted`:** Handle failed payments or cancellations by downgrading the user's `subscriptionTier` to `'free'`.

3.  **Update the Frontend:**
    -   The `handleConfirmPayment` function in `/pro/checkout/page.tsx` must be replaced with a call to your new "Create Payment Session" endpoint, followed by a redirect to the payment gateway.
    -   The success and failure pages (`/pro/success`) should be triggered via redirects from your backend after the webhook processing is complete.

This backend implementation will replace the mock data and provide a robust, production-ready subscription system for Travonex Pro.
