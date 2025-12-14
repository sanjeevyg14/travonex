

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuAction, SidebarGroup } from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CircleUser, LogOut, BookOpen, DollarSign, PlusCircle, Cog, Globe, LayoutDashboard, Handshake, ShoppingCart, HelpCircle, Ticket, BarChart3, RotateCcw } from "lucide-react";
import Link from "next/link";


const navLinks = [
  { href: "/organizer/trips", label: "My Trips", icon: Globe },
  { href: "/organizer/trips/new", label: "Create Trip", icon: PlusCircle },
  { href: "/organizer/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/organizer/bookings", label: "Bookings", icon: BookOpen },
  { href: "/organizer/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/organizer/promotions", label: "Promotions", icon: Ticket },
  { href: "/organizer/leads", label: "Leads", icon: Handshake },
  { href: "/organizer/credits", label: "Credits", icon: ShoppingCart },
  { href: "/organizer/payouts", label: "Payouts", icon: DollarSign },
  { href: "/organizer/help", label: "Help & FAQs", icon: HelpCircle },
  { href: "/organizer/settings", label: "Settings", icon: Cog },
];

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/organizer/login');
      return;
    }
    
    // This layout is ONLY for Trip Organizers.
    if (user.role === 'organizer' && user.partnerType === 'experience') {
        router.push('/vendor/dashboard'); // Redirect experience vendors away
    } else if (user.role !== 'organizer' && user.role !== 'admin') {
      router.push('/dashboard/organizer-application');
    } else if (user.role === 'organizer' && user.organizerStatus !== 'approved') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  // Allow the login page to render without showing the loading screen for an unauthenticated user.
  if (pathname === '/organizer/login') {
     return <>{children}</>;
  }

  // Ensure only approved trip organizers see this layout
  if (loading || !user || user.partnerType !== 'trip') {
    return <div className="flex h-screen w-full items-center justify-center">Loading Organizer Panel...</div>;
  }
  
  return (
     <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
           <p className="px-3 py-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">Trip Organizer Panel</p>
            <SidebarMenu>
              {navLinks.filter(l => !l.href.endsWith('/new')).map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton
                      isActive={pathname === link.href || (link.href !== "/organizer/trips" && pathname.startsWith(link.href))}
                      tooltip={link.label}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/profile">
                  <SidebarMenuButton tooltip="Your Profile" isActive={pathname === "/profile"}>
                    <CircleUser />
                    <span className="truncate">{user?.name}</span>
                  </SidebarMenuButton>
                </Link>
                 <SidebarMenuAction asChild>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut />
                  </Button>
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 bg-muted/40 p-4 md:p-8 overflow-auto">
        <div className="flex items-center gap-2 mb-4">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
