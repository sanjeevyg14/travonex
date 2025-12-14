# Corporate & Private Trips Backend Integration Guide

This document provides a technical guide for backend developers on implementing the "Corporate & Private Group Trips" module. This feature is designed to create a new B2B sales channel for Travonex.

## 1. High-Level Architecture & User Flow

The goal is to allow corporate clients or private groups to submit a detailed request for a custom trip, which is then managed by a Travonex admin and fulfilled by a trusted organizer.

The frontend flow is as follows:
1.  A corporate client fills out a detailed **"Group Inquiry Form"**.
2.  This submission creates a **"Group Lead"** that is routed **exclusively to the Admin Panel**.
3.  An admin reviews the lead and forwards it as a "Request for Proposal" (RFP) to one or more suitable organizers.
4.  The organizer receives the RFP and uses the standard "Create Trip" flow to build a custom itinerary, but saves it with a new **"Private Quote"** status. This trip is not publicly visible.
5.  The organizer submits the private trip back to the admin.
6.  The admin presents the private trip link to the corporate client for approval and booking.

## 2. Core Backend Implementation Tasks

### Task 1: Create the Group Inquiry Endpoint

You need to create an API endpoint to handle submissions from the "Group Inquiry Form".

-   **Endpoint:** `POST /api/corporate-inquiries`
-   **Payload:** The endpoint should accept a JSON payload with fields such as:
    -   `groupName` (string)
    -   `contactName` (string)
    -   `contactEmail` (string)
    -   `contactPhone` (string)
    -   `numberOfTravelers` (number)
    -   `preferredDates` (string or date range)
    -   `budgetPerPerson` (number)
    -   `desiredDestinations` (string)
    -   `tripStyles` (string[])
    -   `specificRequirements` (string)

-   **Action:** On receiving a valid request, this endpoint must save the data to a new `corporate_leads` table/collection in your database, flagging its status as `'new'`.

### Task 2: Enhance the Trip Data Model & Logic

The `Trip` model requires a crucial modification to support this private workflow.

-   **Update `Trip` Schema:** Add a new optional field to the `trips` table/collection:
    -   `visibility`: (string, enum: `'public'`, `'private'`). Default to `'public'`.
-   **Modify Data Access Rules:**
    -   **CRITICAL:** Update all data access layers (e.g., `/api/trips`, `searchTrips` tool) to **strictly filter for `visibility: 'public'` and `status: 'published'` by default**. This is a critical security and privacy measure to ensure private quotes are never leaked to the public.
    -   Access to trips where `visibility: 'private'` should only be granted via a unique, non-guessable URL or when the logged-in user (the corporate client or admin) has explicit permission.

### Task 3: Implement the Admin-to-Organizer Workflow

This is the core logic of the feature and requires several new backend capabilities.

1.  **Admin Panel UI:**
    -   Create a new section in the Admin Panel (`/management`) called **"Corporate Leads"** that lists all records from the `corporate_leads` table.
    -   From this view, an admin must be able to select a lead and trigger a "Forward to Organizer" action. This should open a modal where the admin can select one or more verified organizers.

2.  **Create RFP Endpoint:**
    -   **Endpoint:** `POST /api/admin/forward-rfp`
    -   **Payload:** `{ "leadId": string, "organizerIds": string[] }`
    -   **Action:** This secure, admin-only endpoint should create a new record in an `rfp_submissions` table, linking the `leadId` to the `organizerIds`. It should also trigger a notification (e.g., email, push notification) to the selected organizers about the new business opportunity.

3.  **Organizer "Create Trip" Flow:**
    -   When an organizer creates a trip in response to an RFP, the frontend will need to pass an extra parameter, e.g., `?source=rfp&leadId=...`.
    -   When saving the trip, the backend must set `visibility: 'private'` and `status: 'pending_quote_approval'`.

4.  **Admin Quote Review:**
    -   The Admin Panel needs a new section, **"Private Quotes"**, where admins can see all trips with the `pending_quote_approval` status.
    -   From here, the admin can review the quote and, upon approval, share its unique link (`/discover/{private-trip-slug}`) with the corporate client.

This guide outlines the necessary backend architecture to bring the corporate travel module to life, creating a powerful new B2B revenue stream for Travonex.
