/**
 * @file This file contains a custom React hook `useIsMobile` for detecting mobile screen sizes.
 *
 * --- How It Works ---
 * 1.  **Client-Side Execution**: The core logic is wrapped in a `useEffect` with an empty dependency array `[]`. This is a critical pattern that ensures the code inside only runs on the client-side, after the component has "mounted".
 * 2.  **Window API**: It uses `window.innerWidth` to check the current viewport width against a predefined `MOBILE_BREAKPOINT`.
 * 3.  **State Management**: It uses `useState` to store the boolean result (`isMobile`).
 * 4.  **Event Listener**: It attaches an event listener to the `window`'s `resize` event to automatically update the `isMobile` state whenever the browser window is resized.
 * 5.  **Cleanup**: It returns a cleanup function from `useEffect` to remove the event listener when the component unmounts, preventing memory leaks.
 *
 * This hook is essential for creating responsive layouts that need to adapt their structure in JavaScript, not just CSS.
 * For example, it's used in `src/app/layout.tsx` to decide whether to render the desktop header or the mobile bottom navigation.
 */
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const checkIsMobile = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set the initial value on mount.
    checkIsMobile();

    // Add event listener for window resize.
    window.addEventListener("resize", checkIsMobile);

    // Cleanup the event listener on component unmount.
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []); // Empty dependency array ensures this runs only once on mount.

  return isMobile;
}
