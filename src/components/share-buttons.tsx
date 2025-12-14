
"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Facebook, Linkedin, Twitter, Copy } from "lucide-react";
import { WhatsAppIcon } from "./icons/whatsapp-icon";
import { useToast } from "@/hooks/use-toast";

export function ShareButtons({ title }: { title: string }) {
    const pathname = usePathname();
    const { toast } = useToast();
    const url = typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : '';

    const shareOptions = [
        {
            name: "Copy Link",
            icon: <Copy className="h-5 w-5" />,
            onClick: () => {
                navigator.clipboard.writeText(url);
                toast({ title: "Copied!", description: "Link copied to clipboard." });
            }
        },
        {
            name: "WhatsApp",
            icon: <WhatsAppIcon className="h-6 w-6" />,
            href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%0A${encodeURIComponent(url)}`
        },
        {
            name: "Twitter",
            icon: <Twitter className="h-5 w-5" />,
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: "Facebook",
            icon: <Facebook className="h-5 w-5" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: "LinkedIn",
            icon: <Linkedin className="h-5 w-5" />,
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        }
    ];

    return (
        <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-muted-foreground mr-2 hidden md:block">Share this story:</p>
            {shareOptions.map(option => (
                option.href ? (
                    <a key={option.name} href={option.href} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" aria-label={`Share on ${option.name}`}>
                            {option.icon}
                        </Button>
                    </a>
                ) : (
                    <Button key={option.name} variant="outline" size="icon" onClick={option.onClick} aria-label={option.name}>
                        {option.icon}
                    </Button>
                )
            ))}
        </div>
    );
}
