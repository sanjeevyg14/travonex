# Travonex: Cancellation & Refund System - A-Z Backend Guide

This document is the master guide for backend developers tasked with implementing the complete, end-to-end cancellation and refund workflow for the Travonex platform, integrated with a payment gateway like Razorpay.

---

## 1. Overview: The Unified Cancellation & Refund Flow

The system must handle three distinct cancellation scenarios initiated by different user roles: the Traveler, the Trip Organizer, and the Platform Admin. The process is designed to be automated via payment gateway APIs, ensuring a secure and auditable trail for every transaction.

### Scenario 1: Traveler-Initiated Cancellation
1.  **Traveler Request:** User requests a refund via the booking details page.
2.  **Organizer Review:** The organizer receives an email and sees the request in their dashboard. They can:
    *   **Approve:** Specify the refund amount (which defaults based on policy) and add remarks.
    *   **Reject:** Provide a mandatory reason for rejection.
3.  **Admin Processing:** If approved by the organizer, the request appears in the admin's queue. The admin verifies the amount and triggers the refund via the payment gateway API.

### Scenario 2: Organizer-Initiated Cancellation
1.  **Organizer Action:** The organizer cancels a traveler's booking directly from their dashboard.
2.  **System Action:** This implies a 100% refund. The organizer must provide a reason. The system automatically marks the refund as `approved_by_organizer` and sends it directly to the admin's processing queue.

### Scenario 3: Admin-Initiated Cancellation
1.  **Admin Action:** A super admin force-cancels a booking from the management panel.
2.  **System Action:** This is a final action. The admin must specify the refund amount, provide an internal reason, and can trigger the refund via the payment gateway API directly.

---

## 2. Database Schema Requirements

The `Bookings` and `ExperienceBookings` collections/tables must be updated to include the following fields to track the state of a refund.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `paymentGatewayId`| `String` | **CRITICAL.** The unique transaction ID from the payment gateway (e.g., Razorpay's `pay_...`). This is required to process automated refunds. |
| `refundStatus` | `String` (Enum) | The current state of the refund. Values: `none`, `requested`, `approved_by_organizer`, `rejected_by_organizer`, `rejected_by_admin`, `processed`. Defaults to `none`. |
| `cancellationInitiator` | `String` (Enum) | Who started the cancellation. Values: `traveler`, `organizer`, `admin`. |
| `approvedRefundAmount`| `Number` | The monetary value approved for refund by the organizer or admin. |
| `cancellationReason` | `String` | Stores remarks from an organizer/admin for a cancellation or rejection. |
| `refundRequestDate` | `DateTime` / `Timestamp` | Timestamp when the traveler first requested the refund. |
| `refundProcessedDate` | `DateTime` / `Timestamp` | Timestamp when the refund was successfully processed by the gateway. |
| `refundUtr` | `String` | The unique refund ID from the payment gateway (e.g., Razorpay's `rfnd_...`) for auditing. |

---

## 3. Required API Endpoints & Logic

The backend must expose the following secure endpoints.

#### 3.1. `POST /api/bookings/{bookingId}/request-refund`
*   **Actor:** Traveler
*   **Action:** Initiates a refund request.
*   **Logic:** Sets `refundStatus` to `requested` and `cancellationInitiator` to `traveler`. Triggers **Email Notification 1** to the organizer.

#### 3.2. `PUT /api/organizer/refunds/{bookingId}/approve`
*   **Actor:** Organizer
*   **Action:** Approves a pending refund request.
*   **Request Body:** `{ "amount": number, "remarks": string }`
*   **Logic:** Updates `refundStatus` to `approved_by_organizer`. Saves the `approvedRefundAmount` and `cancellationReason` (remarks). Triggers **Email Notifications 2a (to Admin) & 2b (to Traveler)**.

#### 3.3. `PUT /api/organizer/refunds/{bookingId}/reject`
*   **Actor:** Organizer
*   **Action:** Rejects a pending refund request.
*   **Request Body:** `{ "reason": string }`
*   **Logic:** Updates `refundStatus` to `rejected_by_organizer` and saves the `cancellationReason` (reason). Triggers **Email Notification 2c** to the traveler.

#### 3.4. `POST /api/organizer/bookings/{bookingId}/cancel`
*   **Actor:** Organizer
*   **Action:** Organizer unilaterally cancels a booking.
*   **Request Body:** `{ "reason": string }`
*   **Logic:** Sets `cancellationInitiator` to `organizer`. Calculates 100% of `amountPaid` and sets it as `approvedRefundAmount`. Sets `refundStatus` to `approved_by_organizer`. Saves the `cancellationReason`. Triggers the same emails as a standard approval (**2a & 2b**).

#### 3.5. `POST /api/admin/refunds/{bookingId}/process`
*   **Actor:** Admin
*   **Action:** Triggers the refund via the payment gateway.
*   **Logic:**
    1.  Fetch the `Booking` record using the `bookingId`.
    2.  Retrieve the `paymentGatewayId` and `approvedRefundAmount` from the record.
    3.  Call the payment gateway's **Refund API** (e.g., Razorpay's `payments/{payment_id}/refund`) with the payment ID and amount.
    4.  **Do not** immediately set the status to `processed`. Instead, wait for the webhook confirmation.
    5.  On successful API call initiation, you can optionally update the status to `'processing'`.

#### 3.6. `POST /api/webhooks/payment-gateway`
*   **Actor:** Payment Gateway (e.g., Razorpay)
*   **Action:** Listens for incoming webhook events.
*   **Logic:**
    1.  **MUST** verify the webhook signature to ensure it's a legitimate request from the gateway.
    2.  Listen for the `refund.processed` event.
    3.  From the webhook payload, extract the original `payment_id` and the new `refund_id`.
    4.  Find the `Booking` record in your database where `paymentGatewayId` matches the `payment_id`.
    5.  Update the booking's `refundStatus` to `'processed'`, save the gateway's `refund_id` into your `refundUtr` field, and set the `refundProcessedDate`.
    6.  Trigger **Email Notification 3** to the traveler confirming the refund has been processed.

---

## 4. Email Notification Triggers

The backend should integrate with an email service (e.g., SendGrid, Mailgun) to send transactional emails at key steps.

| Trigger Action | Email ID | Recipient | Subject | Body Content Suggestion |
| :--- | :--- | :--- | :--- | :--- |
| Traveler requests refund | `REFUND_REQUEST_ORGANIZER` | Organizer | New Refund Request for Booking `TRVNX...` | "A refund has been requested for booking `TRVNX...`. Please review it in your dashboard." |
| Organizer approves refund | `REFUND_APPROVED_ADMIN` | Admin | Refund Approved for `TRVNX...` - Ready for Processing | "A refund of **₹{amount}** has been approved by the organizer for booking `TRVNX...`. Remarks: '{remarks}'. Please process it from the admin panel." |
| Organizer approves refund | `REFUND_APPROVED_TRAVELER`| Traveler | Your Refund Request has been Approved! | "Good news! Your refund request for booking `TRVNX...` has been approved by the organizer and is now being processed by our team." |
| Organizer rejects refund | `REFUND_REJECTED_TRAVELER`| Traveler | Update on Your Refund Request | "Your refund request for `TRVNX...` has been rejected by the organizer. Reason: '{reason}'. Please contact the organizer for more details." |
| Admin processes refund | `REFUND_PROCESSED_TRAVELER`| Traveler | Your Refund has been Processed! | "Your refund of **₹{amount}** for booking `TRVNX...` has been successfully processed. The amount should reflect in your account in 5-7 business days." |

This document provides the complete technical specification for building a production-grade, automated cancellation and refund system.
