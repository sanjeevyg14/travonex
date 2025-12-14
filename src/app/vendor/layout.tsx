

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuAction, SidebarGroup } from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CircleUser, LogOut, BookOpen, DollarSign, PlusCircle, Cog, Activity, BarChart3, RotateCcw, Package } from "lucide-react";
import Link from "next/link";


const navLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: Activity },
  { href: "/vendor/experiences", label: "My Experiences", icon: Package },
  { href: "/vendor/experiences/new", label: "Add New Experience", icon: PlusCircle },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendor/bookings", label: "Bookings", icon: BookOpen },
  { href: "/vendor/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/vendor/payouts", label: "Payouts", icon: DollarSign },
  { href: "/vendor/settings", label: "Settings", icon: Cog },
];

export default function VendorLayout({
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
    
    // This layout is ONLY for Experience Vendors.
    if (user.role === 'organizer' && user.partnerType === 'trip') {
        router.push('/organizer/trips'); // Redirect trip organizers away
    } else if (user.role !== 'organizer' && user.role !== 'admin') {
      router.push('/dashboard/organizer-application');
    } else if (user.role === 'organizer' && user.organizerStatus !== 'approved') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  // Ensure only approved experience vendors see this layout
  if (loading || !user || user.partnerType !== 'experience') {
    return <div className="flex h-screen w-full items-center justify-center">Loading Vendor Panel...</div>;
  }
  
  return (
     <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
           <p className="px-3 py-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">Experience Vendor Panel</p>
            <SidebarMenu>
              {navLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton
                      isActive={pathname === link.href || (link.href !== "/vendor/dashboard" && pathname.startsWith(link.href))}
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
