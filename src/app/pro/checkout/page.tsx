

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

function CheckoutForm() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const plan = searchParams.get('plan') || 'annual';
    const isAnnual = plan === 'annual';

    // Pricing (should match backend)
    const prices = {
        monthly: 599,
        annual: 499,
    };

    const price = isAnnual ? prices.annual : prices.monthly;
    const planId = isAnnual ? 'pro-annual' : 'pro-monthly';
    const planName = isAnnual ? 'Travonex Pro - Annual Plan' : 'Travonex Pro - Monthly Plan';
    const billingCycle = isAnnual ? 'year' : 'month';

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?redirect=/pro/checkout?plan=${plan}`);
        }
    }, [user, loading, router, plan]);

    const openRazorpayPayment = async (order: { id: string; amount: number; currency: string }) => {
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
            amount: order.amount,
            currency: order.currency || "INR",
            name: "Travonex",
            description: planName,
            order_id: order.id,
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

                    toast({
                        title: "Welcome to Travonex Pro!",
                        description: "Your new benefits are now active.",
                    });

                    router.push('/pro/success');
                } catch (error: any) {
                    console.error("Payment verification error:", error);
                    toast({
                        variant: "destructive",
                        title: "Verification Failed",
                        description: error.message || "Failed to verify payment. Please contact support.",
                    });
                }
            },
            prefill: {
                name: user?.name || "",
                email: user?.email || "",
                contact: user?.phone || "",
            },
            theme: { color: "#3b82f6" },
            modal: {
                ondismiss: () => {
                    toast({
                        variant: "default",
                        title: "Payment Cancelled",
                        description: "You can complete the payment later.",
                    });
                },
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const handleConfirmPayment = async () => {
        if (!user) return;
        setIsProcessing(true);

        try {
            const response = await fetch('/api/subscriptions/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ planId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout');
            }

            const data = await response.json();
            const order = {
                id: data.orderId,
                amount: data.amount,
                currency: data.currency || "INR",
            };

            await openRazorpayPayment(order);
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast({
                variant: "destructive",
                title: "Checkout Failed",
                description: error.message || "Failed to initialize checkout. Please try again.",
            });
        } finally {
            setIsProcessing(false);
        }
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
                                <CardDescription>Secure payment powered by Razorpay</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                                    <p>You will be redirected to Razorpay's secure payment gateway to complete your purchase.</p>
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
