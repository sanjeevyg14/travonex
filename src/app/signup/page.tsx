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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
  { code: "+61", country: "Australia" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+7", country: "Russia" },
  { code: "+82", country: "South Korea" },
  { code: "+34", country: "Spain" },
  { code: "+52", country: "Mexico" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+65", country: "Singapore" },
  { code: "+41", country: "Switzerland" },
  { code: "+46", country: "Sweden" },
  { code: "+31", country: "Netherlands" },
  { code: "+64", country: "New Zealand" },
  { code: "+972", country: "Israel" },
  { code: "+47", country: "Norway" },
  { code: "+358", country: "Finland" },
  { code: "+45", country: "Denmark" },
  { code: "+353", country: "Ireland" },
  { code: "+43", country: "Austria" },
  { code: "+32", country: "Belgium" },
  { code: "+351", country: "Portugal" },
  { code: "+90", country: "Turkey" },
];

export default function SignupPage() {
  const { signInWithPhone, verifyOtp } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const bgImage = PlaceHolderImages.find((p) => p.id === "hero2");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const fullPhoneNumber = `${countryCode}${phone}`;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || !name) {
      toast({ variant: "destructive", title: "Please enter your name and a valid phone number." });
      return;
    }
    setIsLoading(true);

    try {
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });

      const result = await signInWithPhone(fullPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      toast({ title: "OTP Sent!", description: `Enter the 6-digit code sent to ${fullPhoneNumber}.` });

    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Failed to send OTP", description: error.message });
      setStep("phone"); // Reset on error
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
      toast({ variant: "destructive", title: "Something went wrong. Please try sending OTP again." });
      setStep("phone");
      return;
    }

    setIsLoading(true);
    try {
      // Pass name and referral code as additional data for signup
      await verifyOtp(confirmationResult, otp, { name, referralCode });
      toast({ title: "Welcome to Travonex!", description: "Account created successfully." });
      // Redirection handled in useAuth
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Invalid OTP", description: "Please check the code and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <Card className="w-full max-w-sm z-10 bg-background/80 backdrop-blur-sm">
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl">Your Adventure Starts Here</CardTitle>
              <CardDescription>
                Join our community of explorers. Create an account to save your adventures and book trips.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
              <div className="grid gap-2">
                <Label htmlFor="referral">Referral Code (Optional)</Label>
                <Input
                  id="referral"
                  placeholder="e.g., TRAV5NEX123"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
              <div id="recaptcha-container"></div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the <a href="#" className="underline text-primary">Terms & Privacy Policy</a>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl">Verify Your Number</CardTitle>
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
                Create Account
              </Button>
              <Button variant="link" size="sm" onClick={() => setStep('phone')} className="text-muted-foreground">
                Use a different number
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
