# Experiences Vertical: Backend Integration Guide

This document provides a technical guide for backend developers on implementing the "Experiences" vertical. This feature allows Travonex to list and manage single-day activities, workshops, and tours from various vendors.

## 1. High-Level Architecture

The goal is to create a new, distinct content type on the platform for short-duration, bookable activities.

The frontend flow is as follows:
1.  A user browses and filters experiences on the `/experiences` hub page.
2.  They select an experience, view its details, and choose an available date and time slot.
3.  They proceed to a booking modal, enter their details, and complete the payment.
4.  A new `ExperienceBooking` record is created.
5.  The vendor sees this booking in their dedicated "Experience Vendor" dashboard.

## 2. Core Backend Implementation Tasks

### Task 1: Create the Data Models

You will need to create database schemas (e.g., Firestore collections or SQL tables) for two new core models: **`Experience`** and **`ExperienceBooking`**. The vendor who creates the experience will be an **`Organizer`** with the `partnerType: 'experience'`.

#### 2.1. The `Experience` Model
This model defines the bookable activity itself.

-   **Source of Truth:** `Experience` type in `src/lib/types.ts`.
-   **Key Fields to Implement:**
    -   `id`, `slug`, `title`, `location`, `category`.
    -   `price`: The base price for a single participant.
    -   `duration`, `difficulty`.
    -   `vendor`: A foreign key reference to the `organizers` collection/table.
    -   `availability`: A nested object defining the rules for time slots (e.g., `type: 'daily'`, `timeSlots: ['09:00', '11:00']`). Your backend will need a system to manage availability based on these rules.
    -   `inclusions`, `exclusions`, `highlights`, `safetyNotes`, `cancellationPolicy`.
    -   `status`: `'published'`, `'pending'`, `'draft'`.

#### 2.2. The `ExperienceBooking` Model
This model represents a confirmed booking for an experience.

-   **Source of Truth:** `ExperienceBooking` type in `src/lib/types.ts`.
-   **Key Fields to Implement:**
    -   `id`, `experienceId`, `travelerId`.
    -   `activityDate`: The specific date the user booked.
    -   `timeSlot`: The specific time slot booked.
    -   `participants`: The number of people in the booking.
    -   `totalPrice`: The final price paid.
    -   `status`: `'Confirmed'`, `'Cancelled'`.

### Task 2: Implement the Booking API

You must create API endpoints to handle the creation and management of experience bookings.

-   **Endpoint:** `POST /api/experiences/book`
-   **Payload:** The endpoint should accept a payload containing `{ experienceId, activityDate, timeSlot, participants }`.
-   **Action:**
    1.  **Validate Availability:** Before processing, the backend **must** check if the requested `timeSlot` on the given `activityDate` has enough capacity for the requested number of `participants`. This is a critical step to prevent overbooking.
    2.  **Create Payment Session:** Integrate with a payment gateway (e.g., Stripe, Razorpay) to create a payment session for the `totalPrice`.
    3.  **Handle Webhooks:** Implement a webhook listener to receive `payment.success` events from the gateway. Upon successful payment, create the `ExperienceBooking` record in your database.

### Task 3: Implement the Vendor Dashboard APIs

The "Experience Vendor" dashboard requires its own set of APIs for vendors to manage their listings and bookings.

1.  **CRUD for Experiences:**
    -   `POST /api/vendor/experiences`: Create a new experience (status: `pending`).
    -   `PUT /api/vendor/experiences/:id`: Update an existing experience.
    -   `GET /api/vendor/experiences`: Fetch all experiences belonging to the logged-in vendor.

2.  **Booking Management:**
    -   `GET /api/vendor/experience-bookings`: Fetch all bookings for the vendor's experiences. This should allow for filtering by date and experience.

### Task 4: Implement Admin Approval Workflow

New experiences must be approved by an admin before they go live.

1.  **Admin Panel UI:** Create a new page in the Admin Panel (`/management/experiences`) that lists all experiences with the status `pending`.
2.  **Approval Endpoints:**
    -   `PUT /api/admin/experiences/:id/approve`: An admin-only endpoint to change an experience's status to `published`.
    -   `PUT /api/admin/experiences/:id/reject`: An admin-only endpoint to change an experience's status back to `draft`, ideally with feedback for the vendor.

This guide provides the foundational backend structure required to launch the Experiences vertical, creating a new and exciting way for travelers to engage with the Travonex platform.