/**
 * Razorpay Checkout Hook
 * Handles Razorpay payment flow with proper error handling
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
}

interface RazorpayCheckoutOptions {
    order: RazorpayOrder;
    onSuccess?: (paymentResponse: any) => void;
    onError?: (error: any) => void;
    successRedirect?: string;
    keyId?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
}

export function useRazorpayCheckout(options: RazorpayCheckoutOptions) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Check if script already exists
        if (window.Razorpay) {
            setScriptLoaded(true);
            return;
        }

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
            setScriptLoaded(true);
        };
        script.onerror = () => {
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Failed to load payment gateway. Please try again.",
            });
        };
        document.body.appendChild(script);

        return () => {
            // Don't remove script on cleanup - it might be needed by other components
        };
    }, [toast]);

    const handlePayment = useCallback(async () => {
        if (!scriptLoaded || !window.Razorpay) {
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Payment gateway not loaded. Please refresh the page.",
            });
            return;
        }

        if (!options.order || !options.order.id) {
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Invalid order details. Please try again.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const razorpayOptions = {
                key: options.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: options.order.amount, // Amount in paise
                currency: options.order.currency || "INR",
                name: "Travonex",
                description: "Travel Booking Payment",
                order_id: options.order.id,
                handler: async (response: any) => {
                    try {
                        // Verify payment with backend
                        const verifyResponse = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
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

                        // Payment verified successfully
                        setIsLoading(false);

                        if (options.onSuccess) {
                            options.onSuccess(response);
                        }

                        toast({
                            title: "Payment Successful!",
                            description: "Your payment has been processed successfully.",
                        });

                        if (options.successRedirect) {
                            router.push(options.successRedirect);
                        }
                    } catch (error: any) {
                        setIsLoading(false);
                        console.error("Payment verification error:", error);

                        toast({
                            variant: "destructive",
                            title: "Verification Failed",
                            description: error.message || "Failed to verify payment. Please contact support.",
                        });

                        if (options.onError) {
                            options.onError(error);
                        }
                    }
                },
                prefill: options.prefill || {
                    name: "",
                    email: "",
                    contact: "",
                },
                theme: {
                    color: "#3b82f6", // Primary color
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        if (options.onError) {
                            options.onError(new Error("Payment cancelled by user"));
                        }
                    },
                },
            };

            const razorpay = new window.Razorpay(razorpayOptions);
            razorpay.open();
        } catch (error: any) {
            setIsLoading(false);
            console.error("Razorpay payment error:", error);

            toast({
                variant: "destructive",
                title: "Payment Error",
                description: error.message || "Failed to initialize payment. Please try again.",
            });

            if (options.onError) {
                options.onError(error);
            }
        }
    }, [options, scriptLoaded, router, toast]);

    return {
        handlePayment,
        isLoading,
        scriptLoaded,
    };
}

