

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuAction, SidebarGroup } from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CircleUser, LogOut, LayoutDashboard, Globe, Users, Handshake, Gift, Banknote, Palette, Settings, Ticket, BookOpen, PenSquare, Star, FileClock, Wand2, CreditCard, RotateCcw, BarChart3, MessageSquare, Server, Activity } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "/management", label: "Dashboard", icon: LayoutDashboard },
  { href: "/management/trips", label: "Manage Trips", icon: Globe },
  { href: "/management/experiences", label: "Manage Experiences", icon: Activity },
  { href: "/management/organizers", label: "Manage Organizers", icon: Users },
  { href: "/management/users", label: "Manage Users", icon: Users },
  { href: "/management/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/management/bookings", label: "All Bookings", icon: BookOpen },
  { href: "/management/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/management/stories", label: "Manage Stories", icon: PenSquare },
  { href: "/management/reviews", label: "Manage Reviews", icon: Star },
  { href: "/management/promotions", label: "Promotions", icon: Ticket },
  { href: "/management/leads", label: "Leads", icon: Handshake },
  { href: "/management/referrals", label: "Referrals", icon: Gift },
  { href: "/management/settlements", label: "Settlements", icon: Banknote },
  { href: "/management/experience-analytics", label: "Experience Analytics", icon: BarChart3 },
  { href: "/management/analytics", label: "Analytics Guide", icon: BarChart3 },
  { href: "/management/content-moderation", label: "Content Guide", icon: MessageSquare },
  { href: "/management/ai-integration", label: "AI Integration", icon: Wand2 },
  { href: "/management/backend-integration", label: "Backend Guide", icon: Server },
  { href: "/management/branding", label: "Branding", icon: Palette },
  { href: "/management/settings", label: "Platform Settings", icon: Settings },
  { href: "/management/logs", label: "Audit Logs", icon: FileClock },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/organizer/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center">Loading Admin Panel...</div>;
  }

  return (
     <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
           <p className="px-3 py-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">Admin Panel</p>
            <SidebarMenu>
              {navLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton
                      isActive={pathname === link.href || (link.href !== "/management" && pathname.startsWith(link.href))}
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
            <SidebarTrigger/>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
