

/**
 * @file This component renders the main Platform Settings page for administrators.
 * It provides controls for managing global configurations of the application.
 *
 * --- How It Works ---
 * 1.  **State Management**: It uses local React `useState` for form inputs (like commission rate).
 * 2.  **Data Context for Global Settings**: For settings that affect other parts of the app (like the referral bonus),
 *     it reads and writes directly to the `useMockData` context.
 *     - It reads `referralBonusAmount` to populate the form.
 *     - It calls `setReferralBonusAmount` upon saving.
 * 3.  **Form Handling**: A "Save Changes" button simulates a backend update by:
 *     - Updating the global state via the context setters.
 *     - Showing a confirmation toast to the admin.
 *
 * This architecture allows for a realistic simulation of an admin controlling live platform variables.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMockData } from "@/hooks/use-mock-data";
import Link from "next/link";
import { Tag, ShoppingCart, MessageSquare, Crown, Percent } from "lucide-react";

export default function AdminSettingsPage() {
    const { toast } = useToast();
    // Get the global referral bonus amount and its setter from the mock data context.
    const { 
        referralBonusAmount, setReferralBonusAmount, 
        commissionRate, setCommissionRate,
        cashbackRateStandard, setCashbackRateStandard,
        cashbackRatePro, setCashbackRatePro,
        proPriceMonthly, setProPriceMonthly,
        proPriceAnnual, setProPriceAnnual,
        proSubscriptionEnabled, setProSubscriptionEnabled,
    } = useMockData();

    // Local state for settings that are only displayed on this page.
    const [aiPlannerEnabled, setAiPlannerEnabled] = useState(true);
    const [spotReservationEnabled, setSpotReservationEnabled] = useState(true);
    // Local state for the form inputs, synchronized with the global context.
    const [bonusInput, setBonusInput] = useState(referralBonusAmount.toString());
    const [commissionInput, setCommissionInput] = useState(commissionRate.toString());
    const [cashbackStandardInput, setCashbackStandardInput] = useState(cashbackRateStandard.toString());
    const [cashbackProInput, setCashbackProInput] = useState(cashbackRatePro.toString());
    const [proPriceMonthlyInput, setProPriceMonthlyInput] = useState(proPriceMonthly.toString());
    const [proPriceAnnualInput, setProPriceAnnualInput] = useState(proPriceAnnual.toString());


    // --- Save Handler ---
    const handleSaveChanges = () => {
        // Update the global referral bonus amount in the mock data context.
        const newBonusAmount = parseInt(bonusInput, 10);
        if (!isNaN(newBonusAmount)) {
            setReferralBonusAmount(newBonusAmount);
        }

        const newCommissionRate = parseInt(commissionInput, 10);
        if (!isNaN(newCommissionRate)) {
            setCommissionRate(newCommissionRate);
        }

        const newCashbackStandard = parseInt(cashbackStandardInput, 10);
        if (!isNaN(newCashbackStandard)) {
            setCashbackRateStandard(newCashbackStandard);
        }

        const newCashbackPro = parseInt(cashbackProInput, 10);
        if (!isNaN(newCashbackPro)) {
            setCashbackRatePro(newCashbackPro);
        }
        
        const newProPriceMonthly = parseInt(proPriceMonthlyInput, 10);
        if (!isNaN(newProPriceMonthly)) {
            setProPriceMonthly(newProPriceMonthly);
        }

        const newProPriceAnnual = parseInt(proPriceAnnualInput, 10);
        if (!isNaN(newProPriceAnnual)) {
            setProPriceAnnual(newProPriceAnnual);
        }

        // Provide user feedback.
        toast({
            title: "Platform Settings Saved",
            description: "Your changes have been successfully applied.",
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Platform Settings</h1>
                <p className="text-muted-foreground">Manage global configurations for the Travonex platform.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Content &amp; Tagging</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-base">Traveler FAQs</CardTitle>
                            <CardDescription>Add or edit questions on the main public-facing FAQ page.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                             <Button asChild variant="outline">
                                <Link href="/management/settings/faq">
                                    <MessageSquare className="mr-2 h-4 w-4"/>
                                    Manage FAQs
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-base">User Interest Tags</CardTitle>
                            <CardDescription>Manage the cities and interests users can select in their profile.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline">
                                <Link href="/management/settings/interests">
                                    <Tag className="mr-2 h-4 w-4"/>
                                    Manage User Interests
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                     <Card className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-base">Trip Tags</CardTitle>
                            <CardDescription>Manage the categories and difficulties organizers can assign to trips.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline">
                                <Link href="/management/settings/trip-tags">
                                    <Tag className="mr-2 h-4 w-4"/>
                                    Manage Trip Tags
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Financials, Leads &amp; Subscription</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
                     <Card className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-base">Lead Packages</CardTitle>
                            <CardDescription>Set the pricing and credit amounts for organizer lead packages.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline">
                                <Link href="/management/settings/leads">
                                    <ShoppingCart className="mr-2 h-4 w-4"/>
                                    Manage Lead Packages
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    <div className="space-y-2">
                        <Label htmlFor="commission">Platform Commission Rate (%)</Label>
                        <Input 
                            id="commission" 
                            type="number" 
                            value={commissionInput}
                            onChange={e => setCommissionInput(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            This is the percentage Travonex will take from each booking.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referral-bonus">Referral Bonus Amount (₹)</Label>
                        <Input 
                            id="referral-bonus" 
                            type="number" 
                            value={bonusInput}
                            onChange={e => setBonusInput(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The amount credited to both referrer and referee upon successful signup.
                        </p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cashback-standard" className="flex items-center gap-1"><Percent size={14}/>Standard Cashback Rate (%)</Label>
                        <Input 
                            id="cashback-standard" 
                            type="number" 
                            value={cashbackStandardInput}
                            onChange={e => setCashbackStandardInput(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Cashback % for regular (free-tier) users.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cashback-pro" className="flex items-center gap-1"><Crown size={14} className="text-yellow-500"/>Pro Cashback Rate (%)</Label>
                        <Input 
                            id="cashback-pro" 
                            type="number" 
                            value={cashbackProInput}
                            onChange={e => setCashbackProInput(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Cashback % for Travonex Pro members.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pro-monthly">Pro Price: Monthly (₹)</Label>
                        <Input 
                            id="pro-monthly" 
                            type="number" 
                            value={proPriceMonthlyInput}
                            onChange={e => setProPriceMonthlyInput(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                           The standard monthly subscription price.
                        </p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pro-annual">Pro Price: Annual Plan (monthly rate in ₹)</Label>
                        <Input 
                            id="pro-annual" 
                            type="number" 
                            value={proPriceAnnualInput}
                            onChange={e => setProPriceAnnualInput(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                           The lower monthly rate when a user pays for a full year.
                        </p>
                    </div>
                </CardContent>
            </Card>


            {/* Feature Flags Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Enable or disable major features across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="pro-subscription" className="font-medium flex items-center gap-2">
                                <Crown className="text-primary"/> Travonex Pro Subscription
                            </Label>
                            <p className="text-sm text-muted-foreground">Enable or disable the Pro membership feature entirely.</p>
                        </div>
                        <Switch id="pro-subscription" checked={proSubscriptionEnabled} onCheckedChange={setProSubscriptionEnabled} />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="ai-planner" className="font-medium">AI Trip Planner</Label>
                            <p className="text-sm text-muted-foreground">Allow users to access the AI-powered trip planning tool.</p>
                        </div>
                        <Switch id="ai-planner" checked={aiPlannerEnabled} onCheckedChange={setAiPlannerEnabled} />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="spot-reservation" className="font-medium">Global Spot Reservation</Label>
                             <p className="text-sm text-muted-foreground">Allow organizers to enable partial payment (10%) options for their trips.</p>
                        </div>
                        <Switch id="spot-reservation" checked={spotReservationEnabled} onCheckedChange={setSpotReservationEnabled} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges}>Save All Changes</Button>
            </div>
        </div>
    );
}

