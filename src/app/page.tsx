/**
 * @file This is the main entry point for the homepage of the Travonex application.
 *
 * --- How It Works ---
 * 1.  **Server Component**: This is a Next.js Server Component, responsible for rendering the static shell of the homepage.
 * 2.  **Metadata**: It exports a `metadata` object, which is used by Next.js to populate the `<head>` tag of the page with SEO-friendly information like the title and description.
 * 3.  **Client Component Delegation**: The actual interactive content of the homepage (Hero section, carousels, etc.) is handled by the `HomePageClient` component. This separation allows the main page structure to be rendered on the server for performance, while interactive elements are handled on the client.
 */
import type { Metadata } from 'next';
import HomePageClient from '@/components/pages/home/home-page-client';

// SEO metadata for the homepage.
export const metadata: Metadata = {
  title: 'Travonex: Curated Weekend Getaways, Treks, and Adventures',
  description: 'Discover and book unique trips, treks, and weekend getaways curated by verified local travel experts. Plan your next adventure with Travonex.',
};

/**
 * The main Home page component.
 * It simply renders the client-side component that contains the page's content.
 */
export default function Home() {
  return <HomePageClient />;
}
