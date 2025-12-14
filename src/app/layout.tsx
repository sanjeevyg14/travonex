/**
 * @file This file defines the root layout for the entire application.
 * It's the top-level component that wraps every page.
 *
 * --- How It Works ---
 * 1.  **Client Component Root**: It is marked as `"use client"` because it needs to use client-side hooks like `usePathname` and `useIsMobile` to adapt the layout.
 * 2.  **Global Providers**: It wraps the entire application in necessary context providers:
 *     - `MockDataProvider`: Provides all mock data and state management functions.
 *     - `AuthProvider`: Manages user authentication state.
 *     - `LocationProvider`: Manages user's geographical location context.
 * 3.  **Dynamic Layout Wrapper**: It uses a `LayoutWrapper` component to conditionally render UI elements like the header, footer, and mobile navigation based on the current route and screen size. This is crucial for creating different layouts for the main app vs. the admin/organizer panels.
 * 4.  **Google Tag Manager**: It injects the GTM script into the `<head>` for analytics.
 * 5.  **Toaster**: Renders the global `Toaster` component for notifications.
 */

"use client"; // This needs to be a client component to use hooks for layout adaptation.

import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";
import { MockDataProvider } from "@/hooks/use-mock-data";
import { usePathname } from "next/navigation";
import { LocationProvider } from "@/hooks/use-location";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import Script from "next/script";
import React from "react";

// Type definition for the dataLayer for Google Tag Manager.
declare global {
    interface Window {
        dataLayer: any[];
    }
}

// Initialize the Poppins font for the application.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});


/**
 * A client-side wrapper component that dynamically adjusts the layout.
 * It's separated from RootLayout because hooks cannot be used in the top-level server component.
 * This component is responsible for deciding whether to show the main header/footer or the mobile bottom navigation.
 */
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  // The 'mounted' state is a critical pattern to prevent hydration mismatches.
  // The server doesn't know the screen size, so we wait until the component is mounted on the client to render mobile-specific layouts.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if the current page is part of an admin or organizer panel.
  const isPanelPage = pathname.startsWith('/organizer') || pathname.startsWith('/management') || pathname.startsWith('/vendor');

  // The mobile bottom navigation should only be shown if the component is mounted,
  // the screen is mobile-sized, and it's not a panel page.
  const showMobileNav = mounted && isMobile && !isPanelPage;

  return (
    <div className="flex min-h-screen flex-col">
      {/* The main header is hidden on panel pages. */}
      {!isPanelPage && <Header />}
      
      {/* Add bottom padding to the main content area to prevent the mobile nav from overlapping content. */}
      <main className={cn("flex-grow", showMobileNav && "pb-20")}>
        {children}
      </main>

      {/* Conditionally render the mobile navigation or the standard footer. */}
      {showMobileNav ? <MobileBottomNav /> : (!isPanelPage && <Footer />)}
    </div>
  );
}


/**
 * The root layout of the application.
 * It sets up the HTML structure, loads global CSS, and wraps children in all necessary providers.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
       <head>
        {/* Google Tag Manager script for analytics */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-K474G356');`}
        </Script>
      </head>
      <body className={`${poppins.className} antialiased`}>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K474G356"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* Wrap the entire application in data and authentication providers. */}
        <MockDataProvider>
          <AuthProvider>
            <LocationProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster />
            </LocationProvider>
          </AuthProvider>
        </MockDataProvider>
      </body>
    </html>
  );
}