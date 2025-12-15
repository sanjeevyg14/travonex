
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { OrganizerApplication } from "@/lib/types";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

function AgreementDialog() {
    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Travonex Partner Agreement Summary</DialogTitle>
                <DialogDescription>This is a simplified summary of the terms you accept. A detailed legal agreement will be shared upon application approval.</DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none max-h-[70vh] overflow-y-auto pr-4">
                <h3>SUMMARY: TRIP ORGANIZER AGREEMENT</h3>
                <p><em>(For Treks, Road Trips, Getaways, Camping)</em></p>
                <p>This agreement is for organizers who run multi-day trips, weekend getaways, treks, camping trips, and road trips.</p>

                <h4>1. Eligibility & Onboarding</h4>
                <ul>
                    <li>Organizer must submit ID, GST details (if applicable), bank info, safety certificates, and past trip history.</li>
                    <li>Organizer must pass Travonex’s verification process.</li>
                </ul>

                <h4>2. Trip Listing Rules</h4>
                <ul>
                    <li>Organizer must provide accurate itinerary, inclusions, exclusions, price, safety instructions, and photos.</li>
                    <li>No misleading claims.</li>
                    <li>Any major changes must be approved by Travonex.</li>
                </ul>

                <h4>3. Pricing & Payouts</h4>
                <ul>
                    <li>Organizer sets the base price.</li>
                    <li>Travonex adds a service fee.</li>
                    <li>Payout every Wednesday after the trip ends.</li>
                    <li>Organizer receives settlement via bank transfer.</li>
                </ul>

                <h4>4. Booking Flow</h4>
                <ul>
                    <li>All bookings must happen through Travonex.</li>
                    <li>Organizers cannot override, bypass or give direct booking links to customers.</li>
                    <li>Organizer receives booking details instantly after user payment.</li>
                </ul>

                <h4>5. Cancellation & Refunds</h4>
                <ul>
                    <li>Travonex follows platform-wide refund rules.</li>
                    <li>Organizer must honor the refund policy.</li>
                    <li>Last-minute cancellations by the organizer = full refund + penalty.</li>
                </ul>

                <h4>6. Service-Level Standards</h4>
                <p>Organizers must ensure: On-time start, Verified trip leaders, Safe equipment, No overbooking, Clean stay and transport. Non-compliance leads to penalties or delisting.</p>

                <h4>7. Safety</h4>
                <ul>
                    <li>Mandatory safety briefing at the start.</li>
                    <li>First-aid kit required.</li>
                    <li>Certified trek leads for moderate or difficult treks.</li>
                </ul>

                <h4>8. Liability</h4>
                <p>Organizer is responsible for on-ground operations, safety, and service quality. Travonex is only the booking platform.</p>

                <h4>9. Content Rights</h4>
                <p>Organizer grants Travonex permission to use listing photos/videos for marketing.</p>

                <h4>10. Reviews</h4>
                <p>Organizer cannot manipulate reviews or incentivize positive ratings.</p>

                <h4>11. Termination</h4>
                <p>Travonex can suspend the organizer for misconduct, safety concerns, or poor ratings.</p>
            </div>
        </DialogContent>
    )
}

export default function OrganizerApplicationPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [organizerType, setOrganizerType] = useState<'individual' | 'business'>('business');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (!user) return;
        setIsSubmitting(true);

        try {
            // Generate organizer ID
            const organizerId = `org-${user.id}`;

            // Prepare FormData with all fields
            const submitFormData = new FormData();
            submitFormData.append('partnerType', 'trip');
            submitFormData.append('organizerType', organizerType);
            submitFormData.append('companyName', formData.get('companyName') as string);
            submitFormData.append('experience', formData.get('experience') as string);
            submitFormData.append('website', formData.get('website') as string || '');
            submitFormData.append('contactName', formData.get('contactName') as string);
            submitFormData.append('contactEmail', formData.get('contactEmail') as string);
            submitFormData.append('contactPhone', formData.get('contactPhone') as string);
            submitFormData.append('bankAccountName', formData.get('bankAccountName') as string);
            submitFormData.append('bankAccountNumber', formData.get('bankAccountNumber') as string);
            submitFormData.append('bankIfscCode', formData.get('bankIfscCode') as string);

            // Add files
            const bankStatement = formData.get('bankStatement') as File;
            if (bankStatement && bankStatement.size > 0) {
                submitFormData.append('bankStatement', bankStatement);
            }

            if (organizerType === 'business') {
                const businessPan = formData.get('businessPan') as File;
                const gstCertificate = formData.get('gstCertificate') as File;
                const businessRegistration = formData.get('businessRegistration') as File;

                if (businessPan && businessPan.size > 0) submitFormData.append('businessPan', businessPan);
                if (gstCertificate && gstCertificate.size > 0) submitFormData.append('gstCertificate', gstCertificate);
                if (businessRegistration && businessRegistration.size > 0) submitFormData.append('businessRegistration', businessRegistration);
            } else {
                const panCard = formData.get('panCard') as File;
                const idProof = formData.get('idProof') as File;

                if (panCard && panCard.size > 0) submitFormData.append('panCard', panCard);
                if (idProof && idProof.size > 0) submitFormData.append('idProof', idProof);
            }

            // Submit to API
            const response = await fetch(`/api/organizers/${organizerId}/application`, {
                method: 'POST',
                body: submitFormData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit application');
            }

            // Update user context to reflect pending status immediately (optimistic UI)
            updateUser({
                ...user,
                organizerId,
                organizerStatus: 'pending',
            });

            toast({
                title: "Application Submitted!",
                description: "Your application is now under review. A confirmation email with next steps has been sent to your registered email address.",
            });

            router.push("/dashboard");

        } catch (error: any) {
            console.error("Application error:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.message || "There was an error submitting your application. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog>
            <div className="max-w-2xl mx-auto py-12">
                <Card>
                    <form action={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Become a Travonex Partner</CardTitle>
                            <CardDescription>Share your passion for travel. Complete the application to start listing your trips and grow your business with us.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <Label>What type of organizer are you?</Label>
                                <RadioGroup defaultValue="business" onValueChange={(value) => setOrganizerType(value as 'individual' | 'business')} className="flex gap-4">
                                    <Label htmlFor="business" className="flex items-center gap-2 p-4 border rounded-md cursor-pointer hover:bg-muted has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                        <RadioGroupItem value="business" id="business" />
                                        <span>Registered Business</span>
                                    </Label>
                                    <Label htmlFor="individual" className="flex items-center gap-2 p-4 border rounded-md cursor-pointer hover:bg-muted has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                        <RadioGroupItem value="individual" id="individual" />
                                        <span>Individual / Freelancer</span>
                                    </Label>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyName">
                                    {organizerType === 'business' ? "Registered Company / Brand Name" : "Your Name / Brand Name"}
                                </Label>
                                <Input id="companyName" name="companyName" placeholder="e.g., Adventure Seekers Inc." required />
                            </div>
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="font-semibold">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactName">Contact Person Name</Label>
                                        <Input id="contactName" name="contactName" placeholder="e.g., Rohan Sharma" defaultValue={user?.name} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Contact Phone</Label>
                                        <Input id="contactPhone" name="contactPhone" type="tel" placeholder="e.g., +91 9876543210" defaultValue={user?.phone} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input id="contactEmail" name="contactEmail" type="email" placeholder="e.g., contact@yourbrand.com" defaultValue={user?.email} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Your Experience in Organizing Trips</Label>
                                <Textarea id="experience" name="experience" placeholder="Describe your expertise, the types of trips you conduct, and what makes your experiences unique..." rows={5} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website or Social Media (Optional)</Label>
                                <Input id="website" name="website" placeholder="https://example.com" />
                            </div>

                            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                                <h3 className="font-semibold">KYC Documents ({organizerType === 'individual' ? 'Individual' : 'Business'})</h3>
                                {organizerType === 'individual' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="panCard">PAN Card</Label>
                                            <Input id="panCard" name="panCard" type="file" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="idProof">Aadhaar / ID Proof</Label>
                                            <Input id="idProof" name="idProof" type="file" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bankStatement">Bank Statement / Cancelled Cheque</Label>
                                            <Input id="bankStatement" name="bankStatement" type="file" required />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="businessPan">Business PAN Card</Label>
                                            <Input id="businessPan" name="businessPan" type="file" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gstCertificate">GST Certificate</Label>
                                            <Input id="gstCertificate" name="gstCertificate" type="file" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="businessRegistration">Company/LLP Registration Certificate</Label>
                                            <Input id="businessRegistration" name="businessRegistration" type="file" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bankStatement">Business Bank Statement / Cancelled Cheque</Label>
                                            <Input id="bankStatement" name="bankStatement" type="file" required />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox id="terms" required />
                                <label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I have read and agree to the{' '}
                                    <DialogTrigger asChild>
                                        <span className="underline text-primary cursor-pointer">Vendor Onboarding Agreement</span>
                                    </DialogTrigger>
                                </label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <AgreementDialog />
            </div>
        </Dialog>
    );
}
