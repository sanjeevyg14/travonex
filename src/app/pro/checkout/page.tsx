

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import type { Subscription } from "@/lib/types";

function CheckoutForm() {
    const { user, updateUser, loading } = useAuth();
    const { proPriceAnnual, proPriceMonthly } = useMockData();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const plan = searchParams.get('plan') || 'annual';
    const isAnnual = plan === 'annual';
    
    const price = isAnnual ? proPriceAnnual * 12 : proPriceMonthly;
    const planName = isAnnual ? 'Travonex Pro - Annual Plan' : 'Travonex Pro - Monthly Plan';
    const billingCycle = isAnnual ? 'year' : 'month';

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?redirect=/pro/checkout?plan=${plan}`);
        }
    }, [user, loading, router, plan]);
    
    const handleConfirmPayment = () => {
        if (!user) return;
        setIsProcessing(true);

        // Simulate payment gateway processing
        setTimeout(() => {
            const newSubscription: Subscription = {
                id: `sub_${Date.now()}`,
                planId: `pro-${plan}`,
                planName: planName,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + (isAnnual ? 1 : 0), new Date().getMonth() + (isAnnual ? 0 : 1))).toISOString(),
                pricePaid: price,
            };

            updateUser({ 
                ...user, 
                subscriptionTier: 'pro',
                subscriptionHistory: [...(user.subscriptionHistory || []), newSubscription],
            });

            toast({
                title: "Welcome to Travonex Pro!",
                description: "Your new benefits are now active.",
            });
            router.push('/pro/success');
        }, 2000);
    };

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading checkout...</div>;
    }

    return (
        <div className="bg-muted/40 min-h-[calc(100vh-4rem)] py-12">
            <div className="container max-w-4xl">
                 <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                                    <div>
                                        <p className="font-semibold">{planName}</p>
                                        <p className="text-sm text-muted-foreground">Billed once per {billingCycle}.</p>
                                    </div>
                                    <p className="font-bold text-lg">₹{price.toLocaleString('en-IN')}</p>
                                </div>
                                <Separator />
                                 <div className="flex justify-between text-sm">
                                    <p>Subtotal</p>
                                    <p>₹{price.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <p>Taxes</p>
                                    <p>₹0.00</p>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-xl">
                                    <p>Total Due Today</p>
                                    <p>₹{price.toLocaleString('en-IN')}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Payment Form */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard />
                                    Payment Details
                                </CardTitle>
                                <CardDescription>This is a simulation. No real payment will be processed.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="card-number">Card Number</Label>
                                    <Input id="card-number" placeholder="**** **** **** 1234" disabled/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input id="expiry" placeholder="MM / YY" disabled/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input id="cvc" placeholder="***" disabled/>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="name-on-card">Name on Card</Label>
                                    <Input id="name-on-card" defaultValue={user.name} disabled/>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button size="lg" className="w-full" onClick={handleConfirmPayment} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing Payment...
                                        </>
                                    ) : `Confirm & Pay ₹${price.toLocaleString('en-IN')}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <CheckoutForm />
        </Suspense>
    )
}
