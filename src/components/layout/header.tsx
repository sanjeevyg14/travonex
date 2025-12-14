

/**
 * @file This component renders the main application header.
 * It is a client component (`"use client"`) because it contains interactive elements like
 * the user profile dropdown, search functionality, and mobile navigation sheet, which require state and event handlers.
 *
 * --- How It Works ---
 * 1.  **Authentication State**: It uses the `useAuth` hook to get the current user's status. It conditionally renders either a "Login/Sign Up" button or a user profile dropdown menu.
 * 2.  **Navigation**: It displays primary navigation links. For mobile view, these links are housed within a `Sheet` component.
 * 3.  **User Menu**: For logged-in users, it provides a `DropdownMenu` with links to various user-specific pages like Dashboard, Bookings, and Profile. It also conditionally shows links to the Organizer or Admin panels based on the user's role.
 * 4.  **Search**: Implements a global search command menu (`cmdk`) that can be opened with a button or a keyboard shortcut (Ctrl+K).
 */

"use client";

import * as React from "react";
import Link from "next/link";
import {
  CircleUser,
  Menu,
  BookOpen,
  LogOut,
  Cog,
  Wand2,
  ShieldCheck,
  Briefcase,
  Wallet,
  Heart,
  PenSquare,
  LayoutDashboard,
  Search,
  Crown,
  CreditCard,
  Zap,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useMockData } from "@/hooks/use-mock-data";
import { useRouter } from "next/navigation";


const navLinksSource = [
    { href: "/discover", label: "Trips" },
    { href: "/experiences", label: "Experiences" },
    { href: "/deals", label: "Deals", pro: true },
    { href: "/ai-planner", label: "AI Planner" },
    { href: "/pro", label: "Pro Membership", pro: true },
    { href: "/blog", label: "Blog" },
];


export function Header() {
  const { user, logout } = useAuth();
  const { trips, proSubscriptionEnabled } = useMockData();
  const [openSearch, setOpenSearch] = useState(false);
  const [modifierKey, setModifierKey] = useState("⌘");
  const publishedTrips = trips.filter(t => t.status === 'published');
  const router = useRouter();

  const navLinks = navLinksSource.filter(link => !link.pro || (link.pro && proSubscriptionEnabled));

  // --- Keyboard Shortcut for Search ---
  useEffect(() => {
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    if (!isMac) {
      setModifierKey("Ctrl");
    }

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpenSearch((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])


  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
             <Logo />
          </div>

           <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle><Logo /></SheetTitle>
                </SheetHeader>
                 <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 text-lg font-medium text-foreground/80 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            {navLinks.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className="flex items-center rounded-md border border-input bg-transparent px-3 py-1.5 transition-colors text-foreground/70 hover:bg-muted hover:text-foreground"
            >
                {link.label}
            </Link>
            ))}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
              <div className="flex-1 md:flex-grow-0">
                 <Button 
                    variant="outline" 
                    className="h-9 w-full md:w-40 lg:w-64 justify-start px-3 text-muted-foreground font-normal" 
                    onClick={() => setOpenSearch(true)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search...
                    <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                      <span className="text-xs">{modifierKey}</span>K
                    </kbd>
                  </Button>
              </div>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                    <Link href="/dashboard/wallet">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Wallet: ₹{(user.walletBalance || 0).toLocaleString('en-IN')}</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.role === 'traveler' && (
                    <>
                        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/bookings"><BookOpen className="mr-2 h-4 w-4" /><span>My Bookings</span></Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/saved-trips"><Heart className="mr-2 h-4 w-4" /><span>Saved Trips</span></Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/my-stories"><PenSquare className="mr-2 h-4 w-4" /><span>My Stories</span></Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/profile#subscription-billing"><CreditCard className="mr-2 h-4 w-4" /><span>Subscription & Billing</span></Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                    )}
                    {user.role === 'organizer' && (
                    <DropdownMenuItem asChild>
                        <Link href="/organizer">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Organizer Panel</span>
                        </Link>
                    </DropdownMenuItem>
                    )}
                    {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link href="/management">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                        </Link>
                    </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild><Link href="/profile"><Cog className="mr-2 h-4 w-4" /><span>Profile</span></Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
                <Button asChild><Link href="/signup">Sign Up</Link></Button>
              </div>
            )}
          </div>
      </div>
    </header>

    {/* --- Global Search Command Dialog --- */}
     <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Links">
            <CommandItem onSelect={() => {setOpenSearch(false); router.push('/discover')}}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search for trips</span>
            </CommandItem>
            <CommandItem onSelect={() => {setOpenSearch(false); router.push('/ai-planner')}}>
            <Wand2 className="mr-2 h-4 w-4" />
            <span>Plan a trip with the AI Planner</span>
            </CommandItem>
            <CommandItem onSelect={() => {setOpenSearch(false); router.push('/bookings')}}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>My Bookings</span>
            </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Trips">
            {publishedTrips.slice(0, 5).map(trip => (
                <CommandItem key={trip.id} onSelect={() => {setOpenSearch(false); router.push(`/discover/${trip.slug}`)}}>
                    <span>{trip.title}</span>
                </CommandItem>
            ))}
        </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

