
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { LeadPackage } from "@/lib/types";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PurchaseCreditsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [organizer, setOrganizer] = useState<any>(null);
    const [leadPackages, setLeadPackages] = useState<LeadPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.organizerId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [orgResponse, packagesResponse] = await Promise.all([
                    fetch(`/api/organizers/${user.organizerId}`, { credentials: 'include' }),
                    fetch('/api/lead-packages', { credentials: 'include' }),
                ]);

                if (orgResponse.ok) {
                    const orgData = await orgResponse.json();
                    setOrganizer(orgData.organizer);
                }

                if (packagesResponse.ok) {
                    const packagesData = await packagesResponse.json();
                    setLeadPackages(packagesData.packages || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load data." });
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user?.organizerId, toast]);

    // Default the selected package to the first popular one, or the first one overall.
    const [selectedPackage, setSelectedPackage] = useState<LeadPackage | null>(null);

    useEffect(() => {
        if (leadPackages.length > 0 && !selectedPackage) {
            setSelectedPackage(leadPackages.find(p => p.popular) || leadPackages[0]);
        }
    }, [leadPackages, selectedPackage]);

    const handlePurchase = async () => {
        if (!organizer || !selectedPackage || !user?.organizerId) return;

        try {
            // Create purchase order
            const response = await fetch(`/api/organizers/${user.organizerId}/credits/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    packageId: selectedPackage.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create purchase order');
            }

            const { orderId, amount, currency, package: pkgData } = await response.json();

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.async = true;
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: amount,
                currency: currency || "INR",
                name: "Travonex",
                description: `Purchase ${pkgData.credits} Lead Credits`,
                order_id: orderId,
                prefill: {
                    name: organizer.name,
                    email: user.email || "",
                    contact: user.phone || "",
                },
                handler: async (response: any) => {
                    try {
                        // Verify payment with backend
                        const verifyResponse = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyData.verified) {
                            throw new Error(verifyData.error || "Payment verification failed");
                        }

                        // On success, refresh organizer data to show updated credits
                        const orgResponse = await fetch(`/api/organizers/${user.organizerId}`, {
                            credentials: 'include',
                        });
                        if (orgResponse.ok) {
                            const orgData = await orgResponse.json();
                            setOrganizer(orgData.organizer);
                        }

                        toast({
                            title: "Purchase Successful!",
                            description: `${pkgData.credits} credits have been added to your account.`,
                        });
                    } catch (error: any) {
                        console.error("Payment verification error:", error);
                        toast({
                            variant: "destructive",
                            title: "Verification Failed",
                            description: error.message || "Failed to verify payment. Please contact support."
                        });
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast({
                            variant: "destructive",
                            title: "Payment Cancelled",
                            description: "Payment was cancelled."
                        });
                    }
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error("Purchase failed:", error);
            toast({
                variant: "destructive",
                title: "Purchase Failed",
                description: error.message || "Failed to initiate purchase. Please try again."
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Buy Lead Credits</h1>
                    <p className="text-muted-foreground">Purchase credits to unlock traveler contacts and grow your business.</p>
                </div>
                <Card className="p-4 bg-card w-fit">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Your Current Balance</p>
                            <p className="text-2xl font-bold">{organizer?.leadCredits || 0} Credits</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Choose a Package</CardTitle>
                    <CardDescription>All leads are from travelers who have shown direct interest in your trips.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    {leadPackages.map(pkg => (
                        <Card
                            key={pkg.id}
                            className={cn(
                                "cursor-pointer relative flex flex-col",
                                selectedPackage?.id === pkg.id && "border-2 border-primary"
                            )}
                            onClick={() => setSelectedPackage(pkg)}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    POPULAR
                                </div>
                            )}
                            <CardHeader className="text-center">
                                <CardTitle>{pkg.name}</CardTitle>
                                <p className="text-4xl font-bold text-primary">
                                    {pkg.credits}
                                </p>
                                <p className="text-muted-foreground">Credits</p>
                            </CardHeader>
                            <CardContent className="text-center flex-grow">
                                <p className="text-muted-foreground text-sm">{pkg.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-center p-4">
                                <div>
                                    <p className="text-2xl font-bold">₹{pkg.price}</p>
                                    {pkg.originalPrice > pkg.price && (
                                        <p className="text-sm text-muted-foreground line-through">₹{pkg.originalPrice}</p>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            {selectedPackage && (
                <Card>
                    <CardHeader>
                        <CardTitle>Checkout Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Package: {selectedPackage.name} ({selectedPackage.credits} credits)</span>
                            <span>₹{selectedPackage.price}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                Unlock contact details of interested travelers.
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                Credit back guarantee if a lead converts to a booking.
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                Credits never expire.
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" className="w-full md:w-auto" onClick={handlePurchase}>
                            <ShoppingCart className="mr-2" />
                            Buy {selectedPackage.credits} Credits for ₹{selectedPackage.price}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
