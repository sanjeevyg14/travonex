
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { LeadPackage } from "@/lib/types";

export default function PurchaseCreditsPage() {
    const { user } = useAuth();
    const { organizers, setOrganizers, leadPackages } = useMockData();
    const { toast } = useToast();
    
    // Find the current organizer based on the logged-in user.
    const organizer = Object.values(organizers).find(o => o.name === user?.name);

    // Default the selected package to the first popular one, or the first one overall.
    const [selectedPackage, setSelectedPackage] = useState<LeadPackage>(
        leadPackages.find(p => p.popular) || leadPackages[0]
    );

    const handlePurchase = () => {
        if (!organizer || !selectedPackage) return;

        // In a real app, this would involve a payment gateway. Here, we just simulate.
        // The purchase history logic is removed for now but can be added later.
        
        // Update organizer's credits
        setOrganizers(prev => ({
            ...prev,
            [organizer.id]: {
                ...organizer,
                leadCredits: (organizer.leadCredits || 0) + selectedPackage.credits,
            }
        }));

        toast({
            title: "Purchase Successful!",
            description: `${selectedPackage.credits} credits have been added to your account.`,
        });
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
