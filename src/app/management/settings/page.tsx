

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

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Tag, ShoppingCart, MessageSquare, Crown, Percent } from "lucide-react";

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Settings state
    const [referralBonusAmount, setReferralBonusAmount] = useState(100);
    const [commissionRate, setCommissionRate] = useState(10);
    const [cashbackRateStandard, setCashbackRateStandard] = useState(5);
    const [cashbackRatePro, setCashbackRatePro] = useState(10);
    const [proPriceMonthly, setProPriceMonthly] = useState(599);
    const [proPriceAnnual, setProPriceAnnual] = useState(499);
    const [proSubscriptionEnabled, setProSubscriptionEnabled] = useState(true);
    const [aiPlannerEnabled, setAiPlannerEnabled] = useState(true);
    const [spotReservationEnabled, setSpotReservationEnabled] = useState(true);
    
    // Form inputs
    const [bonusInput, setBonusInput] = useState("100");
    const [commissionInput, setCommissionInput] = useState("10");
    const [cashbackStandardInput, setCashbackStandardInput] = useState("5");
    const [cashbackProInput, setCashbackProInput] = useState("10");
    const [proPriceMonthlyInput, setProPriceMonthlyInput] = useState("599");
    const [proPriceAnnualInput, setProPriceAnnualInput] = useState("499");

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            try {
                const response = await fetch('/api/settings', { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch settings');
                const data = await response.json();
                const settings = data.settings || {};
                
                setReferralBonusAmount(settings.referralBonusAmount || 100);
                setCommissionRate(settings.commissionRate || 10);
                setCashbackRateStandard(settings.cashbackRateStandard || 5);
                setCashbackRatePro(settings.cashbackRatePro || 10);
                setProPriceMonthly(settings.proPriceMonthly || 599);
                setProPriceAnnual(settings.proPriceAnnual || 499);
                setProSubscriptionEnabled(settings.proSubscriptionEnabled !== false);
                setAiPlannerEnabled(settings.aiPlannerEnabled !== false);
                setSpotReservationEnabled(settings.spotReservationEnabled !== false);
                
                setBonusInput(String(settings.referralBonusAmount || 100));
                setCommissionInput(String(settings.commissionRate || 10));
                setCashbackStandardInput(String(settings.cashbackRateStandard || 5));
                setCashbackProInput(String(settings.cashbackRatePro || 10));
                setProPriceMonthlyInput(String(settings.proPriceMonthly || 599));
                setProPriceAnnualInput(String(settings.proPriceAnnual || 499));
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load settings." });
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, [toast]);


    // --- Save Handler ---
    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const settings = {
                referralBonusAmount: parseInt(bonusInput, 10),
                commissionRate: parseInt(commissionInput, 10),
                cashbackRateStandard: parseInt(cashbackStandardInput, 10),
                cashbackRatePro: parseInt(cashbackProInput, 10),
                proPriceMonthly: parseInt(proPriceMonthlyInput, 10),
                proPriceAnnual: parseInt(proPriceAnnualInput, 10),
                proSubscriptionEnabled,
                aiPlannerEnabled,
                spotReservationEnabled,
            };

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }

            // Update local state
            setReferralBonusAmount(settings.referralBonusAmount);
            setCommissionRate(settings.commissionRate);
            setCashbackRateStandard(settings.cashbackRateStandard);
            setCashbackRatePro(settings.cashbackRatePro);
            setProPriceMonthly(settings.proPriceMonthly);
            setProPriceAnnual(settings.proPriceAnnual);

            toast({
                title: "Platform Settings Saved",
                description: "Your changes have been successfully applied.",
            });
        } catch (error: any) {
            console.error("Failed to save settings:", error);
            toast({ 
                variant: "destructive", 
                title: "Error", 
                description: error.message || "Failed to save settings. Please try again." 
            });
        } finally {
            setSaving(false);
        }
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

