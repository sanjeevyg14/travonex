"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/layout/logo";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
];

export default function OrganizerLoginPage() {
  const { user, signInWithPhone, verifyOtp, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // If the user is already logged in, redirect them away from the login page.
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/management');
      } else if (user.role === 'organizer') {
        router.push('/organizer/trips');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);


  const fullPhoneNumber = `${countryCode}${phone}`;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast({ variant: "destructive", title: "Please enter a valid phone number." });
      return;
    }
    setIsLoading(true);

    try {
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-organizer', {
        'size': 'invisible',
      });

      const result = await signInWithPhone(fullPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      toast({ title: "OTP Sent!", description: `Enter the 6-digit code sent to ${fullPhoneNumber}.` });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Failed to send OTP", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ variant: "destructive", title: "Please enter a valid 6-digit OTP." });
      return;
    }
    if (!confirmationResult) {
      toast({ variant: "destructive", title: "Session expired. Please try again." });
      setStep('phone');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(confirmationResult, otp);
      toast({ title: "Welcome Partner!", description: "Successfully logged in." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Invalid OTP", description: "Please check the code and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // If loading or user is already logged in, don't render the form
  if (loading || user) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md">
        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl">Partner Portal</CardTitle>
              <CardDescription>
                Sign in to manage your trips, bookings, and payouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.country} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div id="recaptcha-container-organizer"></div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl">Enter OTP</CardTitle>
              <CardDescription>
                A 6-digit code was sent to {fullPhoneNumber}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Login
              </Button>
              <Button variant="link" size="sm" onClick={() => setStep('phone')} className="text-muted-foreground">
                Go back
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
      <div className="text-center text-sm text-muted-foreground mt-8">
        Not a partner? <Link href="/partner-with-us" className="underline hover:text-primary">Become a Partner</Link> or <Link href="/" className="underline hover:text-primary">go back to the main site</Link>.
      </div>
    </div>
  );
}
