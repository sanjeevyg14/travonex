# Analytics & User Tracking Guide

This document provides a step-by-step guide on how to set up Google Analytics and Google Tag Manager to track user behavior on the Travonex platform. Following these steps will allow you to understand user journeys, identify where they drop off, and analyze the behavior of specific, logged-in users.

## 1. Prerequisites

Before you begin, you need to have accounts for two free Google services:

1.  **Google Analytics 4 (GA4):** This is where you will view all your reports and analyze user data. If you don't have one, [create a new GA4 property](https://support.google.com/analytics/answer/9304153).
2.  **Google Tag Manager (GTM):** This tool acts as the bridge between your website and Google Analytics. It manages your tracking scripts. If you don't have one, [create a new GTM account and container](https://support.google.com/tagmanager/answer/6103696).

## 2. Connecting Your App to Google Tag Manager

Your application is already set up to use GTM. You just need to add your unique ID.

1.  **Find Your GTM ID:** In your Google Tag Manager container, your ID is located in the top-right corner of the dashboard. It will look like `GTM-XXXXXXX`.

2.  **Update Your Application Code:**
    *   Open the file `src/app/layout.tsx`.
    *   Find the line with the placeholder GTM ID (`GTM-K474G356`).
    *   **Replace** this placeholder with your own GTM ID.

    ```javascript
    // src/app/layout.tsx

    <head>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-K474G356');`} // <-- REPLACE THIS ID
      </Script>
    </head>
    ```

3.  **Publish Your GTM Container:** In GTM, click the "Submit" button in the top-right, give your version a name (e.g., "Initial Setup"), and click "Publish".

Once this is done, your application will start sending basic page view data to Google Analytics.

## 3. Tracking Specific Logged-In Users

To see which specific user dropped out, you need to enable User-ID tracking in Google Analytics.

1.  **Go to Google Analytics Admin:** In your GA4 property, click on `Admin` (the gear icon in the bottom-left).
2.  **Navigate to Reporting Identity:** In the "Property" column, click on `Reporting Identity`.
3.  **Select the "Observed" Option:** Choose the "Observed" identity model. This tells GA to prioritize the User-ID that we send from the application.
4.  **Save Your Changes.**

That's it. From this point forward, whenever a user logs in, their activity will be associated with their unique `user-id` from your database, allowing for much deeper analysis.

## 4. How to Track Booking Drop-Offs

The best way to see where users are dropping out is to create a **Funnel Exploration Report**.

1.  **Go to the "Explore" Tab:** In the left-hand navigation of Google Analytics, click on `Explore`.
2.  **Create a Funnel Exploration:** Start a new blank exploration and select "Funnel exploration" as the technique.
3.  **Define the Steps:** In the "Steps" section of the report builder, you will define the path a user takes to make a booking. This is the most important part. Here is a typical setup:

    *   **Step 1: View Trip Page**
        *   Event name: `page_view`
        *   Parameter: `page_path` contains `/discover/`

    *   **Step 2: Start Booking**
        *   Event name: `page_view`
        *   Parameter: `page_path` contains `/book/`

    *   **Step 3: Successful Booking**
        *   Event name: `page_view`
        *   Parameter: `page_path` contains `/book/success`

4.  **Analyze the Funnel:** The report will generate a bar chart showing you exactly how many users completed each step and how many dropped off between steps. If you see a large drop-off between "Start Booking" and "Successful Booking," it's a clear signal that something on your booking form is causing friction.

## 5. How to See an Individual User's Journey

To investigate the "who" behind the numbers, you can use the **User Explorer** report.

1.  **Go to the "Explore" Tab:** Create another new exploration and select "User explorer" as the technique.
2.  **Find a User:** This report will show a table of all users, identified by their `user-id` (e.g., `user-john-doe`).
3.  **View the Activity Stream:** Click on any `user-id` to see a detailed, chronological list of every action they took on your site: every page they viewed, every button they clicked (once we add event tracking), and the exact page they were on before they left.

This setup gives you the powerful tools you need to move from asking "How many users are dropping off?" to "WHO is dropping off, and what can we learn from their specific journey?"
