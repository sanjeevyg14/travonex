"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Trip, Booking } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { format } from "date-fns";
import { ArrowLeft, Minus, Plus, Users, Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingService } from "@/services/booking-service";

type CoTraveler = {
    name: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
};

export function BookingForm({ trip }: { trip: Trip }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    const batchId = searchParams.get('batchId');
    const paymentType = searchParams.get('paymentType') as 'full' | 'partial' | null;

    const [numberOfTravelers, setNumberOfTravelers] = useState(1);
    const [coTravelers, setCoTravelers] = useState<CoTraveler[]>([]);

    useEffect(() => {
        const requiredCoTravelers = numberOfTravelers - 1;
        if (coTravelers.length < requiredCoTravelers) {
            const newCoTravelers = Array(requiredCoTravelers - coTravelers.length).fill({ name: "", email: "", phone: "", gender: "" as any });
            setCoTravelers(prev => [...prev, ...newCoTravelers]);
        } else if (coTravelers.length > requiredCoTravelers) {
            setCoTravelers(prev => prev.slice(0, requiredCoTravelers));
        }
    }, [numberOfTravelers, coTravelers.length]);

    const handleCoTravelerChange = (index: number, field: keyof CoTraveler, value: string) => {
        const newCoTravelers = [...coTravelers];
        newCoTravelers[index] = { ...newCoTravelers[index], [field]: value };
        setCoTravelers(newCoTravelers);
    }

    if (!batchId || !paymentType) {
        return (
            <div className="container py-12 text-center">
                <p className="text-destructive">Booking information is missing. Please go back and try again.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        )
    }

    const selectedBatch = trip.batches?.find(b => b.id === batchId);
    if (!selectedBatch) {
        return (
            <div className="container py-12 text-center">
                <p className="text-destructive">Selected batch is not available. Please select another date.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        )
    }

    const isProUser = user?.subscriptionTier === 'pro';
    const basePrice = selectedBatch.isLastMinuteDeal && selectedBatch.dealPrice ? selectedBatch.dealPrice : (selectedBatch.priceOverride || trip.price);
    const subtotal = basePrice * numberOfTravelers;

    const proDiscount = isProUser ? subtotal * 0.05 : 0;
    const totalPrice = subtotal - proDiscount;

    const amountToPay = paymentType === 'partial'
        ? totalPrice * ((trip.spotReservationPercentage || 10) / 100)
        : totalPrice;


    const handleTravelerChange = (change: number) => {
        setNumberOfTravelers(prev => {
            const newCount = prev + change;
            if (newCount < 1) return 1;
            if (newCount > selectedBatch.availableSlots) {
                toast({ variant: "destructive", title: "Slot limit reached" });
                return selectedBatch.availableSlots;
            }
            return newCount;
        });
    }

    const handleConfirmBooking = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Please login to continue." });
            router.push('/login');
            return;
        }

        for (let i = 0; i < coTravelers.length; i++) {
            if (!coTravelers[i].name || !coTravelers[i].gender || !coTravelers[i].email || !coTravelers[i].phone) {
                toast({
                    variant: "destructive",
                    title: `Missing Details for Traveler ${i + 2}`,
                    description: "Please fill out all details for all co-travelers.",
                });
                return;
            }
        }

        setSubmitting(true);
        try {
            const newBooking: Booking = {
                id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                tripId: trip.id,
                batchId,
                tripTitle: trip.title,
                travelerName: user.name,
                travelerPhone: user.phone,
                travelerId: user.id,
                bookingDate: new Date().toISOString(),
                totalPrice: totalPrice,
                organizerId: trip.organizer.id,
                numberOfTravelers: numberOfTravelers,
                paymentType,
                amountPaid: amountToPay,
                balanceDue: totalPrice - amountToPay,
                paymentStatus: paymentType === 'full' ? 'Paid in Full' : 'Reserved',
                proDiscount: proDiscount,
                coTravelers: coTravelers,
            };

            await bookingService.createBooking(newBooking);

            toast({ title: "Booking Confirmed!", description: "Redirecting to success page..." });
            router.push(`/book/success?bookingId=${newBooking.id}`);
        } catch (error: any) {
            console.error("Booking failed:", error);
            toast({
                variant: "destructive",
                title: "Booking Failed",
                description: error.message || error.toString()
            });
        } finally {
            setSubmitting(false);
        }
    };

    const placeholder = PlaceHolderImages.find((p) => p.id === trip.image);

    return (
        <div className="bg-muted/40 min-h-[calc(100vh-4rem)]">
            <div className="container py-8 md:py-12">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Trip
                </Button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Confirm Your Adventure</CardTitle>
                                <CardDescription>Please confirm your details to complete the booking.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Number of Travelers</Label>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="icon" onClick={() => handleTravelerChange(-1)} disabled={numberOfTravelers <= 1 || submitting}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xl font-bold w-12 text-center">{numberOfTravelers}</span>
                                        <Button variant="outline" size="icon" onClick={() => handleTravelerChange(1)} disabled={numberOfTravelers >= selectedBatch.availableSlots || submitting}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <p className="text-sm text-muted-foreground">{selectedBatch.availableSlots} slots left</p>
                                    </div>
                                </div>
                                <div className="space-y-4 rounded-lg border p-4">
                                    <h3 className="font-semibold">Lead Traveler Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" value={user?.name ?? ''} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" value={user?.phone ?? ''} disabled />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {coTravelers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Users /> Co-Traveler Details</CardTitle>
                                    <CardDescription>Please provide the details for all members of your group.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {coTravelers.map((_, index) => (
                                        <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/50">
                                            <h4 className="font-semibold">Traveler {index + 2}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`co-traveler-name-${index}`}>Full Name</Label>
                                                    <Input
                                                        id={`co-traveler-name-${index}`}
                                                        placeholder="Enter full name"
                                                        value={coTravelers[index].name}
                                                        onChange={(e) => handleCoTravelerChange(index, 'name', e.target.value)}
                                                        required
                                                        disabled={submitting}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`co-traveler-gender-${index}`}>Gender</Label>
                                                    <Select
                                                        value={coTravelers[index].gender}
                                                        onValueChange={(value) => handleCoTravelerChange(index, 'gender', value)}
                                                        required
                                                        disabled={submitting}
                                                    >
                                                        <SelectTrigger id={`co-traveler-gender-${index}`}>
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`co-traveler-email-${index}`}>Email Address</Label>
                                                    <Input
                                                        id={`co-traveler-email-${index}`}
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        value={coTravelers[index].email}
                                                        onChange={(e) => handleCoTravelerChange(index, 'email', e.target.value)}
                                                        required
                                                        disabled={submitting}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`co-traveler-phone-${index}`}>Phone Number</Label>
                                                    <Input
                                                        id={`co-traveler-phone-${index}`}
                                                        type="tel"
                                                        placeholder="+91..."
                                                        value={coTravelers[index].phone}
                                                        onChange={(e) => handleCoTravelerChange(index, 'phone', e.target.value)}
                                                        required
                                                        disabled={submitting}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
                                    {placeholder && <Image src={placeholder.imageUrl} alt={trip.title} fill className="object-cover" />}
                                    1</div>
                                <CardTitle className="text-xl">{trip.title}</CardTitle>
                                <CardDescription>{trip.location}</CardDescription>
                                <div className="text-sm text-muted-foreground pt-2">
                                    {format(new Date(selectedBatch.startDate), "EEE, dd MMM yyyy")} &mdash; {format(new Date(selectedBatch.endDate), "EEE, dd MMM yyyy")}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{numberOfTravelers} Traveler(s) x ₹{basePrice.toLocaleString('en-IN')}</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                {isProUser && proDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="font-semibold flex items-center gap-1"><Crown size={14} /> Pro Member Discount (5%)</span>
                                        <span>- ₹{proDiscount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Amount to Pay</span>
                                    <span>₹{amountToPay.toLocaleString('en-IN')}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button size="lg" className="w-full" onClick={handleConfirmBooking} disabled={submitting}>
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {submitting ? "Processing..." : "Proceed to Payment"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
