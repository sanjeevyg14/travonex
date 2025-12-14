# iOS App Setup & Deployment Guide

This document provides a comprehensive guide for developers on how to set up the local environment, build, and run the Travonex iOS application using Capacitor.

## 1. Introduction: The Hybrid Approach with Capacitor

The Travonex iOS app is built using a **hybrid approach** powered by **Capacitor**. This means our high-quality Next.js web application is wrapped in a native iOS shell.

-   **Core Logic:** The UI and business logic are rendered by our Next.js web app.
-   **Native Shell:** Capacitor creates a standard iOS Xcode project (`/ios` directory) that houses the web app.
-   **Result:** This gives us a real iOS app that can be published to the Apple App Store, while allowing us to maintain a single codebase for our primary features.

## 2. Prerequisites: Setting Up Your Development Environment

Building an iOS app requires a macOS computer.

1.  **Install Xcode:** Download and install the latest version of Xcode from the Mac App Store. Xcode is Apple's official IDE for iOS and macOS development.

2.  **Install Xcode Command Line Tools:** Open your terminal and run the following command to install essential tools for development:
    ```bash
    xcode-select --install
    ```

3.  **Install CocoaPods:** This is a dependency manager for iOS projects.
    ```bash
    sudo gem install cocoapods
    ```

4.  **Set up an Apple Developer Account:** While you can run the app on a simulator without an account, you will need a paid Apple Developer account to run it on a physical device and to publish to the App Store.

## 3. Building and Running the App for Development

Here is the step-by-step process to get the app running on your local machine.

### Step 1: Add the iOS Platform

First, you need to tell Capacitor to create the native iOS project.

-   Open a terminal in the **root directory** of the Travonex repository.
-   Run the following command:

    ```bash
    npx cap add ios
    ```
    This will create a new `/ios` directory in your project.

### Step 2: Build the Web App Assets

The native iOS app needs the latest production build of our Next.js web app.

-   In the same terminal (at the project root), run the command to create a static export of the Next.js site:

    ```bash
    npm run build
    ```

### Step 3: Sync Web Assets with the iOS Project

Capacitor needs to copy the newly built web assets into the native iOS project.

-   Run the Capacitor `sync` command:

    ```bash
    npx cap sync ios
    ```

### Step 4: Open and Run the Project in Xcode

-   Open the native iOS project in Xcode:
    ```bash
    npx cap open ios
    ```
-   This command will automatically open the `/ios` directory as a project in Xcode.
-   In Xcode, select your target device (e.g., an iPhone simulator or a connected physical iPhone) from the dropdown at the top.
-   Click the **"Run"** button (the play icon) in the top-left corner.
-   Xcode will build the app, install it on the selected device/simulator, and launch it. You should see the Travonex application running.

## 4. Preparing for App Store Release

When you are ready to publish, you will generate a release archive.

1.  **Configure Signing & Capabilities:**
    -   In Xcode, go to the project settings by clicking on the project name in the navigator.
    -   Under the "Signing & Capabilities" tab, select your team and make sure the Bundle Identifier is unique (e.g., `com.yourcompany.travonex`).

2.  **Generate an Archive:**
    -   Go to `Product` > `Archive` in the Xcode menu.
    -   Xcode will build a release version of your app. Once complete, the "Organizer" window will open.

3.  **Distribute to App Store Connect:**
    -   In the Organizer window, select your new archive and click "Distribute App".
    -   Follow the wizard to upload the build to App Store Connect. You will need to have an app record created in your App Store Connect account first.
    -   After the upload, you can submit the build for review from the App Store Connect website, filling out all necessary metadata like screenshots and descriptions.

This guide provides the essential steps for taking your web application to a fully functional iOS app. For more details, always refer to the official Capacitor and Apple documentation.