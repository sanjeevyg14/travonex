
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function ProSuccessPage() {
    const { width, height } = useWindowSize();
    return (
         <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Confetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={500}
                tweenDuration={10000}
            />
            <Card className="max-w-md text-center shadow-lg">
                <CardHeader className="items-center">
                    <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                    <CardTitle className="text-3xl">Welcome to Travonex Pro!</CardTitle>
                    <CardDescription>Your new benefits are active. Get ready to explore more, for less.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-left space-y-4 p-4 bg-muted rounded-lg">
                         <p className="flex items-start gap-3"><Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5"/><span>Unlimited AI trip planning to spark your next journey.</span></p>
                         <p className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5"/><span>An automatic 5% discount on every booking, sitewide.</span></p>
                         <p className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5"/><span>Exclusive access to last-minute deals.</span></p>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Button asChild className="w-full" size="lg">
                            <Link href="/discover">Explore Pro Deals</Link>
                        </Button>
                        <Button asChild className="w-full" size="lg" variant="outline">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

