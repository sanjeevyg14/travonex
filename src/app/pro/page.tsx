

"use client";

import { Check, Crown, Star, Wand2, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useMockData } from "@/hooks/use-mock-data";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const proFeatures = [
    {
        icon: <Wand2 className="h-6 w-6 text-primary" />,
        title: "Plan Smarter, Not Harder",
        description: "Get unlimited, personalized trip ideas from our advanced AI. Your personal travel agent is always on."
    },
    {
        icon: <Star className="h-6 w-6 text-primary" />,
        title: "Save on Every Adventure",
        description: "Receive an automatic 5% discount on every single trip you book, with no limits on how much you can save."
    },
    {
        icon: <Zap className="h-6 w-6 text-primary" />,
        title: "Access Exclusive Deals",
        description: "Unlock Pro-only prices and get access to our exclusive Last-Minute Getaways."
    },
];

const comparisonFeatures = [
    { feature: "AI Trip Planner", free: "Standard Model", pro: "Advanced AI Model" },
    { feature: "Booking Discount", free: "—", pro: "5% Off Everything" },
    { feature: "Last-Minute Deals", free: false, pro: true },
    { feature: "Pro Profile Badge", free: false, pro: true },
    { feature: "Offline Itinerary Downloads", free: false, pro: true },
];

export default function ProPage() {
    const { user } = useAuth();
    const { proPriceAnnual, proPriceMonthly, proSubscriptionEnabled } = useMockData();
    const router = useRouter();
    const authorAvatar = PlaceHolderImages.find((p) => p.id === "user1");


    const handleGoPro = (plan: 'monthly' | 'annual') => {
        if (!user) {
            router.push(`/login?redirect=/pro/checkout?plan=${plan}`);
            return;
        }
        router.push(`/pro/checkout?plan=${plan}`);
    };

    return (
        <div className="bg-gradient-to-b from-background to-muted/40">
            <div className="container py-12 md:py-20 text-center">
                {/* Hero Section */}
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
                        Upgrade to <span className="text-primary">Travonex Pro</span>
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                        Unlock the ultimate travel experience. Plan smarter, save bigger, and explore more with our premium membership.
                    </p>
                </div>

                {proSubscriptionEnabled && (
                <>
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
                    {proFeatures.map((feature) => (
                        <Card key={feature.title} className="text-center bg-background/50">
                            <CardHeader className="items-center">
                                {feature.icon}
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-16 max-w-6xl mx-auto items-start">
                    {/* Pricing Card (Mobile First) */}
                    <div className="lg:hidden">
                        <PricingCard />
                    </div>

                    {/* Comparison Table */}
                    <div className="lg:col-span-3">
                        <Card className="text-left">
                             <CardHeader>
                                <CardTitle>Compare Plans</CardTitle>
                                <CardDescription>See how Pro unlocks the best of Travonex.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 items-center gap-4 text-sm font-semibold border-b pb-2">
                                    <p className="col-span-1">Feature</p>
                                    <p className="text-center col-span-1">Free</p>
                                    <p className="text-primary text-center col-span-1">Pro</p>
                                </div>
                                {comparisonFeatures.map((item) => (
                                    <div key={item.feature} className="grid grid-cols-3 items-center gap-4 text-sm border-b pb-4 last:border-none last:pb-0">
                                        <p className="font-semibold text-left col-span-1">{item.feature}</p>
                                        <div className="text-muted-foreground text-center col-span-1">
                                             {typeof item.free === 'boolean' ? (
                                                item.free ? <Check className="h-5 w-5 mx-auto text-green-500" /> : <X className="h-5 w-5 mx-auto text-muted-foreground/50"/>
                                            ) : (
                                                item.free
                                            )}
                                        </div>
                                        <div className="font-bold text-primary text-center col-span-1">
                                            {typeof item.pro === 'boolean' ? (
                                                item.pro ? <Check className="h-5 w-5 mx-auto text-green-500" /> : <X className="h-5 w-5 mx-auto"/>
                                            ) : (
                                                item.pro
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                     {/* Pricing Card (Desktop) */}
                    <div className="hidden lg:block lg:col-span-2">
                       <PricingCard />
                    </div>
                </div>

                 {/* Testimonial Section */}
                <div className="mt-20 max-w-2xl mx-auto">
                    <Card className="bg-background/50">
                        <CardContent className="p-8">
                            <blockquote className="text-lg italic text-foreground">
                                "Upgrading to Pro was a no-brainer. I saved more on my first booking than the cost of the entire year's subscription. The exclusive deals are amazing!"
                            </blockquote>
                            <div className="flex items-center gap-4 mt-6">
                                <Avatar>
                                    {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} />}
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">John Doe</p>
                                    <p className="text-sm text-muted-foreground">Travonex Pro Member</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                </>
                )}

            </div>
        </div>
    );

    function PricingCard() {
        const annualSavings = (proPriceMonthly * 12) - (proPriceAnnual * 12);

        if (!proSubscriptionEnabled) {
            return (
                <Card className="shadow-2xl relative sticky top-24">
                     <CardHeader>
                        <CardTitle>Pro is Coming Soon</CardTitle>
                        <CardDescription>We're currently not accepting new Pro members. Please check back later!</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button size="lg" className="w-full" disabled>
                           Join the Waitlist
                        </Button>
                    </CardContent>
                </Card>
            )
        }
        
        return (
             <Card className="shadow-2xl relative sticky top-24">
                <Tabs defaultValue="annual">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="annual">Annual</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <TabsContent value="monthly">
                        <CardContent className="text-center">
                            <p className="text-5xl font-bold tracking-tight">₹{proPriceMonthly}<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                            <p className="text-xs text-muted-foreground mt-1">Billed monthly. Cancel anytime.</p>
                        </CardContent>
                        <CardFooter>
                            {user?.subscriptionTier === 'pro' ? (
                                <Button size="lg" className="w-full" disabled>You are a Pro Member</Button>
                            ) : (
                                <Button size="lg" className="w-full" onClick={() => handleGoPro('monthly')}>Go Pro</Button>
                            )}
                        </CardFooter>
                    </TabsContent>
                    <TabsContent value="annual">
                        {annualSavings > 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-full">
                            Save ₹{annualSavings.toLocaleString('en-IN')}
                        </div>}
                        <CardContent className="text-center">
                            <p className="text-5xl font-bold tracking-tight">₹{proPriceAnnual}<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                            <p className="text-xs text-muted-foreground mt-1">Billed as ₹{(proPriceAnnual * 12).toLocaleString('en-IN')} per year.</p>
                        </CardContent>
                        <CardFooter>
                            {user?.subscriptionTier === 'pro' ? (
                                <Button size="lg" className="w-full" disabled>You are a Pro Member</Button>
                            ) : (
                                <Button size="lg" className="w-full" onClick={() => handleGoPro('annual')}>Go Pro & Start Saving</Button>
                            )}
                        </CardFooter>
                    </TabsContent>
                </Tabs>
            </Card>
        )
    }
}

