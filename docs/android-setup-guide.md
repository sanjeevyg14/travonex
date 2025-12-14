# Android App Setup & Deployment Guide

This document provides a comprehensive guide for developers on how to set up the local environment, build, and run the Travonex Android application using the generated native project files.

## 1. Introduction: The Hybrid Approach with Capacitor

The Travonex Android app is built using a **hybrid approach** powered by **Capacitor**. This means our high-quality Next.js web application is wrapped in a native Android shell.

-   **Core Logic:** The user interface and business logic are still rendered by our Next.js web application.
-   **Native Shell:** Capacitor creates a standard Android project (`/android` directory) that houses the web app in a component called a `WebView`.
-   **Result:** This gives us a real Android app that can be published to the Google Play Store, while allowing us to maintain a single codebase for our primary features.

## 2. Prerequisites: Setting Up Your Development Environment

Before you can build or run the Android app, you need the standard Android development environment set up on your machine.

1.  **Install Android Studio:** Download and install the latest version of Android Studio, which is the official IDE for Android development.
    -   [Download Android Studio](https://developer.android.com/studio)

2.  **Install Required SDKs:**
    -   Open Android Studio.
    -   Go to `Tools` > `SDK Manager`.
    -   Make sure you have at least one Android SDK Platform installed (e.g., Android 13.0 "Tiramisu").
    -   Under the "SDK Tools" tab, ensure that `Android SDK Build-Tools`, `Android SDK Platform-Tools`, and `Android Emulator` are installed.

3.  **Set up a Virtual Device (Emulator):**
    -   In Android Studio, go to `Tools` > `Device Manager`.
    -   Click "Create device" and follow the wizard to set up a virtual device (e.g., a Pixel 7). This will allow you to run the app on your computer.

## 3. Building and Running the App for Development

Here is the step-by-step process to get the app running on your local machine.

### Step 1: Open the Android Project

-   Start **Android Studio**.
-   Choose **"Open an Existing Project"**.
-   Navigate to the root of your Travonex repository and select the `android` directory. **Do NOT select the root directory, only the `android` sub-directory.**
-   Android Studio will open the project and may take a few minutes to perform a "Gradle Sync" to configure the project. Let this process complete.

### Step 2: Build the Web App Assets

The native Android app needs the latest production build of our Next.js web app.

-   Open a terminal in the **root directory** of the Travonex repository (not the `android` directory).
-   Run the following command to create a static export of the Next.js site:

    ```bash
    npm run build
    ```

### Step 3: Sync Web Assets with the Android Project

Capacitor needs to copy the newly built web assets into the native Android project.

-   In the same terminal (at the project root), run the Capacitor `sync` command:

    ```bash
    npx cap sync android
    ```

    This command updates the native Android project with the latest web code from your `out` directory.

### Step 4: Run the App from Android Studio

You can now run the app on an emulator or a physical device.

-   In Android Studio, select your desired virtual device (or a physically connected Android phone) from the dropdown menu in the top toolbar.
-   Click the **"Run 'app'"** button (the green play icon).
-   Android Studio will build the native app, install it on the selected device, and launch it. You should see the Travonex application running.

## 4. Preparing for Google Play Store Release

When you are ready to publish, you will not run the app directly but will instead generate a signed release bundle.

1.  **Generate a Signed App Bundle:**
    -   In Android Studio, go to `Build` > `Generate Signed Bundle / APK...`.
    -   Select **"Android App Bundle"** and click "Next".
    -   You will need to create a "keystore" file. This is a secure file that contains the digital certificate for signing your app. **Follow the Android Studio wizard to create a new keystore. VERY IMPORTANT: Store this file in a safe and backed-up location. If you lose it, you will not be able to publish updates to your app.**
    -   Once you have a keystore, select it, enter the required passwords, and complete the wizard.
    -   Android Studio will generate an `.aab` file. This is the App Bundle you will upload to the Google Play Store.

2.  **Publish on Google Play:**
    -   You will need a Google Play Developer account.
    -   In the Google Play Console, create a new app listing.
    -   Upload your signed `.aab` file.
    -   Fill out all the required store listing details (screenshots, description, privacy policy, etc.) and submit for review.

This guide covers the essential steps to bridge the gap between the web application and a deployable Android package. For more detailed information on specific Android or Capacitor topics, refer to their official documentation.