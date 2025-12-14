
"use client";

import { Facebook, Instagram, Youtube, Linkedin, HelpCircle } from "lucide-react";
import { Logo } from "./logo";
import Link from "next/link";
import { Button } from "../ui/button";
import { WhatsAppIcon } from "../icons/whatsapp-icon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/travonex", icon: <Instagram className="h-5 w-5" /> },
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61581171023347", icon: <Facebook className="h-5 w-5" /> },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/travonex/", icon: <Linkedin className="h-5 w-5" /> },
  { name: "YouTube", href: "https://www.youtube.com/@Travonex", icon: <Youtube className="h-5 w-5" /> },
];


function CommunityHub() {
    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <PopoverTrigger asChild>
                            <Button
                                size="icon"
                                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white"
                            >
                                <WhatsAppIcon className="h-8 w-8" />
                                <span className="sr-only">Contact and Community Hub</span>
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-primary text-primary-foreground border-none">
                        <p>Chat & Community</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <PopoverContent side="top" align="end" className="w-80">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2">
                         <HelpCircle className="text-primary"/>
                        Get Help & Join Us
                    </CardTitle>
                    <CardDescription>
                        Have questions or want to join our travel community?
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    <Button asChild className="w-full bg-green-500 hover:bg-green-600" size="lg">
                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                           <WhatsAppIcon className="mr-2 h-6 w-6"/> Chat on WhatsApp
                        </a>
                    </Button>
                    <Separator />
                    <div className="text-center text-sm text-muted-foreground">Or follow us on</div>
                    <div className="flex justify-around">
                        {socialLinks.map(link => (
                             <TooltipProvider key={link.name}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon" aria-label={link.name}>
                                                {link.icon}
                                            </Button>
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{link.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </CardContent>
            </PopoverContent>
        </Popover>
    )
}

export function Footer() {

  return (
    <footer className="border-t bg-card">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground">
              Curated weekend getaways, treks, and experiences.
            </p>
            {/* Mobile layout refinement - Center social icons on mobile */}
            <div className="flex space-x-2 justify-center md:justify-start">
              {socialLinks.map(link => (
                 <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon">
                       {link.icon}
                    </Button>
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 text-center md:col-span-3 md:grid-cols-3 md:text-left">
            <div>
              <h3 className="font-semibold">Explore</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/discover" className="text-muted-foreground hover:text-foreground">Discover Trips</Link></li>
                <li><Link href="/experiences" className="text-muted-foreground hover:text-foreground">Discover Experiences</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Traveler Stories</Link></li>
                 <li><Link href="/ai-planner" className="text-muted-foreground hover:text-foreground">AI Planner</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">For Partners</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/partner-with-us" className="text-muted-foreground hover:text-foreground">Partner with Us</Link></li>
                <li><Link href="/organizer/login" className="text-muted-foreground hover:text-foreground">Partner Login</Link></li>
                 <li><Link href="/organizer/help" className="text-muted-foreground hover:text-foreground">Organizer Help</Link></li>
              </ul>
            </div>
             <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Travonex. All rights reserved.
          </p>
        </div>
      </div>
      <CommunityHub />
    </footer>
  );
}
