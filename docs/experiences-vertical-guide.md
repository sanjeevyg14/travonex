# Experiences Vertical: UI/UX Flow & Wireframe Plan

## 1. Overview

This document outlines the complete user interface flow and screen-by-screen structure for the new "Experiences" vertical on the Travonex platform. The goal is to create a seamless, intuitive, and visually consistent experience for users to discover, book, and manage adventure and leisure activities.

**Branding Note:** The entire flow will adhere to the existing Travonex style. The primary action color, **Travonex Orange (`#FF6300`)**, will be used for all call-to-action buttons, active states, and key highlights to ensure a vibrant and cohesive user experience.

---

## 2. Screen-by-Screen UI Breakdown

### Screen 1: Home Page → Entry Point

A new card will be added to the main home page grid (likely alongside "Treks," "Camping," etc.) to serve as the primary entry point into the new vertical.

-   **Component:** `EntryPointCard`
-   **Visuals:**
    -   A visually dynamic image representing multiple activities (e.g., a split shot of a scuba diver and a paraglider).
    -   Title text: **"Experiences"**
    -   Subtitle: "Book unique activities & adventures."
    -   The card will be a prominent and attractive gateway.

![Home Screen Entry Point](https://storage.googleapis.com/aifirebase-static-content/studio-docs/experiences/1-Home.png)

### Screen 2: Experiences Hub (Discovery Page)

This is the central browsing page for the vertical, designed for exploration and filtering.

-   **Route:** `/experiences`
-   **Structure:**
    1.  **Hero Section:**
        -   A prominent **Search Bar** with the placeholder "Search for activities or locations."
        -   A **Location Selector** dropdown next to the search bar, pre-filled with the user's auto-detected city but allowing manual selection.
    2.  **Category Pills:**
        -   A horizontally scrollable list of filter pills with icons.
        -   Categories: `Water`, `Adventure`, `Aerial`, `Nature`, `Local Tours`, `Workshops`.
        -   The "All" pill is active by default. Tapping a pill filters the grid below.
    3.  **"Top Near You" Carousel:**
        -   A horizontally scrolling carousel of `ExperienceCard` components, featuring activities geolocated near the user.
    4.  **"Popular This Week" Carousel:**
        -   A second carousel showing the most booked or viewed experiences across the platform.
    5.  **Main Experience Grid:**
        -   A responsive grid of `ExperienceCard` components displaying all available experiences, which dynamically updates based on filters.

#### Component: `ExperienceCard`

-   **Structure:**
    -   **Cover Photo:** Fills the top portion of the card.
    -   **Icon Badge:** An icon representing the category (e.g., a wave for water sports) overlaid on the photo with an orange accent background.
    -   **Title:** Experience name (e.g., "Scuba Diving in Goa").
    -   **Location & Vendor:** "Goa • by Aqua Adventures"
    -   **Rating:** Star icons with the rating value (e.g., ★ 4.8).
    -   **Price:** "Starts from **₹2,499**".
    -   **Accent:** A thin orange line at the bottom of the card.

![Experiences Hub](https://storage.googleapis.com/aifirebase-static-content/studio-docs/experiences/2-Hub.png)

### Screen 3: Experience Detail Page

The full product page for a single experience, designed for conversion.

-   **Route:** `/experiences/{experience-slug}`
-   **Structure:**
    1.  **Photo Carousel:** A large, immersive carousel of high-quality images and videos at the top.
    2.  **Primary Info Block:**
        -   **Title:** "Scuba Diving in Grande Island"
        -   **Vendor Info:** Link to the vendor's profile with a "Verified Vendor" badge.
        -   **Rating & Reviews:** ★ 4.8 (120 reviews) - Tappable to scroll to the reviews section.
        -   **Map Preview:** A small, non-interactive map image showing the general location. Tapping it opens a full-screen map view.
    3.  **Key Highlights Section:** An icon-based section for quick info:
        -   **Duration:** (e.g., 🕒 45 Mins)
        -   **Difficulty:** (e.g., 💪 Beginner)
        -   **Instant Confirmation:** (e.g., ✅)
    4.  **Tabbed Content Section:**
        -   **About:** Full description of the experience.
        -   **Inclusions/Exclusions:** Clear lists of what's provided.
        -   **Safety & Policies:** Detailed safety notes and the cancellation policy.
    5.  **Reviews Section:** A feed of user reviews with ratings and comments.
    6.  **Booking Section (Sticky on Desktop):**
        -   **Availability Calendar:** A real-time calendar where users select a date.
        -   **Time Slot Selector:** Appears after a date is selected.
        -   **"Book Now" Button:** The primary CTA, in Travonex Orange. Becomes active only after date and time are selected.

![Experience Detail Page](https://storage.googleapis.com/aifirebase-static-content/studio-docs/experiences/3-Detail.png)

### Screen 4: Booking Flow

A clean, modal-like, multi-step process initiated after clicking "Book Now."

1.  **Step 1: Participants & Details**
    -   The selected date and time are displayed at the top.
    -   A stepper (`+/-`) to select the number of participants.
    -   Basic user detail fields (Name, Contact Number), pre-filled if logged in.
    -   Price summary dynamically updates on this screen.
    -   **CTA:** "Proceed to Payment" (Orange Button)

2.  **Step 2: Payment**
    -   A standard, secure payment gateway interface.

![Booking Flow](https://storage.googleapis.com/aifirebase-static-content/studio-docs/experiences/4-Booking.png)

### Screen 5: Confirmation Screen

A rich confirmation page providing all necessary information post-booking.

-   **Route:** `/booking/experiences/{booking-id}`
-   **Structure:**
    -   Large "Booking Confirmed!" message with a checkmark icon.
    -   **QR Code:** Prominently displayed for easy check-in.
    -   **Booking ID:** Clearly visible.
    -   **Experience Details:** Title, Date, Time, Number of Participants.
    -   **Meeting Point:** A small map embed showing the exact meeting point, with a "Get Directions" link.
    -   **Instructions:** Key things to know before you go.
    -   **Action Buttons:**
        -   "Add to Calendar"
        -   "Share Booking"
        -   "Contact Vendor"

![Confirmation Screen](https://storage.googleapis.com/aifirebase-static-content/studio-docs/experiences/5-Confirmation.png)

---

## 3. Vendor Dashboard Flow

A new section within the existing Organizer Panel for managing experiences.

-   **Navigation:** A new "Experiences" tab in the organizer sidebar.
-   **Screens:**
    1.  **My Experiences:** A list view of all experiences created by the vendor, showing status (Live, Draft), total bookings, and revenue.
    2.  **Add/Edit Experience:** A simplified version of the trip creation wizard, tailored for activities (shorter duration, no complex itinerary, focus on schedule and capacity).
    3.  **Bookings:** A calendar or list view to track all incoming bookings for all experiences.
    4.  **Payouts:** Integrated into the existing weekly payout system.
    5.  **Reviews:** A dedicated tab to view and respond to traveler reviews.

---

## 4. Community & Safety Features

-   **Badges:** "Verified Vendor" and "Safety Assured" badges will be designed using the primary orange color and prominently displayed on detail pages.
-   **Post-Experience Prompts:** After an experience is completed, the user will receive a push notification prompting them to "Upload Photos" and "Leave a Review."
-   **Organizer Media Upload:** A feature in the vendor dashboard will allow organizers to upload a short video clip (e.g., from a GoPro) to the user's booking confirmation page, creating a delightful post-experience "memory."

This plan provides a complete A-Z structure for the Experiences vertical, ensuring a consistent, high-quality user experience that aligns perfectly with the Travonex brand.