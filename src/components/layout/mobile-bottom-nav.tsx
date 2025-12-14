

"use client";

import { Home, Search, Activity, MoreHorizontal, User, BookOpen, Heart, Wand2, Zap, Ticket, Cog, Briefcase, ShieldCheck, LogOut, LayoutDashboard, Crown, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useMockData } from "@/hooks/use-mock-data";
import React from "react";

const mainNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Trips", icon: Compass },
    { href: "/experiences", label: "Experiences", icon: Activity },
];

const moreNavItemsSource = [
    { href: "/ai-planner", label: "AI Planner", icon: Wand2 },
    { href: "/deals", label: "Deals", icon: Zap, pro: true },
    { href: "/pro", label: "Pro", icon: Crown, pro: true },
    { href: "/blog", label: "Blog", icon: Ticket },
];

const userNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/bookings", label: "My Bookings", icon: BookOpen },
    { href: "/saved-trips", label: "Saved Trips", icon: Heart },
    { href: "/profile", label: "Profile", icon: Cog },
];

const organizerNavItems = [
    { href: "/organizer/trips", label: "Organizer Panel", icon: Briefcase },
];

const adminNavItems = [
    { href: "/management", label: "Admin Panel", icon: ShieldCheck },
];

function NavLink({ href, label, icon: Icon, isActive, isSheetLink = false }: { href: string, label: string, icon: React.ElementType, isActive: boolean, isSheetLink?: boolean }) {
    if (isSheetLink) {
        return (
             <Link href={href} className={cn("flex items-center gap-4 p-3 rounded-lg text-lg", isActive ? "bg-muted text-primary font-semibold" : "text-foreground/80")}>
                <Icon className="h-5 w-5" />
                <span>{label}</span>
            </Link>
        )
    }
    
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
            )}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Link>
    );
}

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { proSubscriptionEnabled } = useMockData();
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);

    const moreNavItems = moreNavItemsSource.filter(link => !link.pro || proSubscriptionEnabled);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg md:hidden">
            <nav className="grid h-16 grid-cols-5 items-center">
                {mainNavItems.map((item) => (
                    <NavLink
                        key={item.label}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
                    />
                ))}
                
                {/* User / Login Link */}
                {user ? (
                    <NavLink href="/profile" label="Profile" icon={User} isActive={pathname === '/profile'} />
                ) : (
                    <NavLink href="/login" label="Login" icon={User} isActive={pathname === '/login'} />
                )}

                {/* More Menu Sheet */}
                 <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                         <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                            <span>More</span>
                        </div>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] flex flex-col">
                        <SheetHeader className="text-left">
                            <SheetTitle>More Options</SheetTitle>
                        </SheetHeader>
                         <div className="flex-grow overflow-y-auto space-y-6 py-4">
                             {user && (
                                <div className="space-y-4">
                                    <p className="font-semibold px-3">My Account</p>
                                    <div className="flex flex-col gap-1">
                                        {userNavItems.map(item => <NavLink key={item.label} {...item} isActive={pathname.startsWith(item.href)} isSheetLink/>)}
                                    </div>
                                </div>
                            )}

                             <div>
                                <p className="font-semibold px-3">Explore</p>
                                <div className="flex flex-col gap-1 mt-2">
                                    {moreNavItems.map(item => <NavLink key={item.label} {...item} isActive={pathname.startsWith(item.href)} isSheetLink/>)}
                                </div>
                            </div>
                            
                             {user?.role === 'organizer' && (
                                <div>
                                    <p className="font-semibold px-3">Partner</p>
                                     <div className="flex flex-col gap-1 mt-2">
                                        {organizerNavItems.map(item => <NavLink key={item.label} {...item} isActive={pathname.startsWith(item.href)} isSheetLink/>)}
                                    </div>
                                </div>
                            )}
                            {user?.role === 'admin' && (
                                <div>
                                    <p className="font-semibold px-3">Admin</p>
                                     <div className="flex flex-col gap-1 mt-2">
                                        {adminNavItems.map(item => <NavLink key={item.label} {...item} isActive={pathname.startsWith(item.href)} isSheetLink/>)}
                                    </div>
                                </div>
                            )}

                         </div>
                         {user && (
                            <div className="mt-auto border-t pt-4">
                                <Button variant="ghost" className="w-full justify-start text-lg p-3" onClick={() => { setIsSheetOpen(false); logout(); }}>
                                    <LogOut className="mr-4 h-5 w-5"/>
                                    Logout
                                </Button>
                            </div>
                         )}
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    );
}

