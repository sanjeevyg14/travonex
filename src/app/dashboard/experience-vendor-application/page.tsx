
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { OrganizerApplication } from "@/lib/types";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function AgreementDialog() {
    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Travonex Partner Agreement Summary</DialogTitle>
                <DialogDescription>This is a simplified summary of the terms you accept. A detailed legal agreement will be shared upon application approval.</DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none max-h-[70vh] overflow-y-auto pr-4">
                <h3>SUMMARY: EXPERIENCE VENDOR AGREEMENT</h3>
                <p><em>(For Activities & Short Experiences like Scuba, Paragliding, Tours, etc.)</em></p>
                <p>Activities include scuba diving, kayaking, rafting, ATV rides, paragliding, zipline, guided tours, and similar short-duration experiences.</p>

                <h4>1. Vendor Eligibility and Required Documents</h4>
                <p>Before approval, every vendor must submit the following documents:</p>
                <h5>A. Business Documents</h5>
                <ul>
                    <li>Government-issued ID of owner</li>
                    <li>Business registration certificate (if applicable)</li>
                    <li>GST certificate (if applicable)</li>
                    <li>Bank account details with proof</li>
                    <li>PAN card</li>
                </ul>
                <h5>B. Safety and Compliance</h5>
                <ul>
                    <li>Activity-specific licenses (Diving instructor license, paragliding operator license, adventure tourism permits, etc.)</li>
                    <li>Equipment inspection certificates</li>
                    <li>Insurance documents (if required by activity type) Examples: Liability insurance, Equipment insurance, Adventure sports insurance</li>
                    <li>Staff qualification documents (certificates of guides, instructors, rescue staff)</li>
                    <li>First-aid certification (recommended for at least one team member)</li>
                </ul>
                <h5>C. Operational Documents</h5>
                <ul>
                    <li>Standard operating procedure (SOP) for the activity</li>
                    <li>Emergency response plan</li>
                    <li>Latest photos and videos of the activity</li>
                    <li>Exact location and coordinates of the meeting point</li>
                </ul>

                <h4>2. Listing Requirements</h4>
                <p>Vendors must provide complete and accurate details, including: Activity name, Duration, Time slots, Meeting point and directions, What is included and excluded, Safety instructions, Age, weight, and health restrictions, Weather dependency rules, Equipment used, Photos or videos representing the experience. Any major change must be updated through Travonex.</p>

                <h4>3. Pricing</h4>
                <p>Vendor decides the base price per person. Travonex adds a platform commission. Dynamic pricing is allowed during peak periods. Vendor must honor the listed prices at all times.</p>

                <h4>4. Booking and Time Slot Management</h4>
                <p>Vendors must: Keep time slot availability updated at all times, Avoid double booking, Confirm or reject bookings immediately if manual confirmation is enabled, Provide real-time updates for closures or weather impacts. Failure to update slots may result in penalty or delisting.</p>

                <h4>5. Cancellation and Rescheduling</h4>
                <p>Customer cancellations are handled as per Travonex cancellation policy. Vendor cancellations are allowed only for: Unsafe weather, Equipment failure, or Unavoidable safety risks. Vendor must inform Travonex immediately and provide reason and safety justification. Customers will receive a full refund or a free reschedule option.</p>

                <h4>6. Safety Obligations</h4>
                <p>Vendors must: Maintain all equipment in safe, working condition, Follow all state and activity-specific regulations, Conduct mandatory safety briefings before activity, Ensure staff are trained and certified, Maintain first-aid kits and basic rescue gear, Enforce use of helmets, harnesses, jackets, or any required safety gear. Vendors must report injuries, accidents, equipment failures, or safety incidents within 24 hours.</p>

                <h4>7. Liability</h4>
                <p>Vendor is fully responsible for customer safety and proper delivery of the activity. Travonex is only a booking platform and does not operate or supervise the activity. Vendor is responsible for any losses, damages, injuries, or failures caused during the activity.</p>

                <h4>8. Payouts</h4>
                <p>Payouts are processed every Wednesday for all completed activities. Cancellations or disputes may delay payout.</p>

                <h4>9. Fraud, Misconduct, or Violations</h4>
                <p>Travonex may suspend or permanently delist a vendor for: Fake or misleading listings, Unsafe equipment, Non-certified staff, Hidden charges, Overcharging customers, Fake time slots or last-minute cancellations, Poor behavior with customers, Repeated negative reviews, Violation of laws or safety standards. Serious violations may result in legal action.</p>
            </div>
        </DialogContent>
    )
}

export default function ExperienceVendorApplicationPage() {
    const { user, updateUser } = useAuth();
    const { setOrganizers, addAuditLog } = useMockData();
    const router = useRouter();
    const { toast } = useToast();
    const [organizerType, setOrganizerType] = useState<'individual' | 'business'>('business');

    async function handleSubmit(formData: FormData) {
        if (!user) return;

        const application: OrganizerApplication = {
            partnerType: 'experience',
            organizerType,
            companyName: formData.get('companyName') as string,
            experience: formData.get('experience') as string,
            website: formData.get('website') as string,
            contactName: formData.get('contactName') as string,
            contactEmail: formData.get('contactEmail') as string,
            contactPhone: formData.get('contactPhone') as string,
            // Business Docs
            businessPan: (formData.get('businessPan') as File)?.name,
            gstCertificate: (formData.get('gstCertificate') as File)?.name,
            businessRegistration: (formData.get('businessRegistration') as File)?.name,
            // Safety Docs
            activityLicenses: (formData.get('activityLicenses') as File)?.name,
            equipmentCertificates: (formData.get('equipmentCertificates') as File)?.name,
            insuranceDocs: (formData.get('insuranceDocs') as File)?.name,
            staffCerts: (formData.get('staffCerts') as File)?.name,
            // Universal Doc
            bankStatement: (formData.get('bankStatement') as File)?.name || 'not-provided.pdf'
        };
        
        updateUser({ ...user, organizerApplication: application, organizerStatus: 'pending' });

        const newOrganizerId = `org-exp-${user.id}`; 
        setOrganizers(prev => ({
            ...prev,
            [newOrganizerId]: {
                id: newOrganizerId,
                name: application.companyName || user.name,
                avatar: 'organizer1',
                isVerified: false,
                status: 'pending',
                partnerType: 'experience',
                application,
            }
        }));
        
        addAuditLog({
            adminName: "System",
            action: 'Organizer Application Received',
            entityType: 'Organizer',
            entityId: newOrganizerId,
            entityName: application.companyName || user.name,
            details: `New experience vendor application from ${user.name}. Sent confirmation email.`,
        });

        toast({
            title: "Application Submitted!",
            description: "Your application is now under review. A confirmation email with next steps has been sent to your registered email address.",
        });

        router.push("/dashboard");
    }

    return (
        <Dialog>
            <div className="max-w-2xl mx-auto py-12">
                <Card>
                    <form action={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Become an Experience Vendor</CardTitle>
                            <CardDescription>Join Travonex to list your single-day activities, workshops, or tours.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="space-y-4">
                                <Label>Are you a registered business or an individual?</Label>
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
                                    Your Name / Brand Name
                                </Label>
                                <Input id="companyName" name="companyName" placeholder="e.g., Aqua Adventures" required />
                            </div>
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="font-semibold">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactName">Contact Person Name</Label>
                                        <Input id="contactName" name="contactName" placeholder="e.g., Priya Singh" defaultValue={user?.name} required />
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
                                <Label htmlFor="experience">Your Experience & Offerings</Label>
                                <Textarea id="experience" name="experience" placeholder="Describe the activities you offer, your safety standards, and what makes your experience unique..." rows={5} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website or Social Media (Optional)</Label>
                                <Input id="website" name="website" placeholder="https://example.com" />
                            </div>

                             <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                                <h3 className="font-semibold">Business Documents</h3>
                                <p className="text-xs text-muted-foreground">Upload your business registration and tax documents.</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessPan">PAN Card / Business PAN</Label>
                                        <Input id="businessPan" name="businessPan" type="file" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gstCertificate">GST Certificate (if applicable)</Label>
                                        <Input id="gstCertificate" name="gstCertificate" type="file" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="businessRegistration">Business Registration (if applicable)</Label>
                                        <Input id="businessRegistration" name="businessRegistration" type="file" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="bankStatement">Bank Statement / Cancelled Cheque</Label>
                                        <Input id="bankStatement" name="bankStatement" type="file" required />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                                <h3 className="font-semibold">Safety & Compliance Documents</h3>
                                <p className="text-xs text-muted-foreground">Please upload all relevant safety and operational licenses for your activities.</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="activityLicenses">Activity-specific Licenses</Label>
                                        <Input id="activityLicenses" name="activityLicenses" type="file" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="equipmentCertificates">Equipment Inspection Certificates</Label>
                                        <Input id="equipmentCertificates" name="equipmentCertificates" type="file" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="insuranceDocs">Liability Insurance Documents</Label>
                                        <Input id="insuranceDocs" name="insuranceDocs" type="file" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="staffCerts">Staff & Guide Certifications</Label>
                                        <Input id="staffCerts" name="staffCerts" type="file" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox id="terms" required/>
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
                            <Button type="submit">Submit Application</Button>
                        </CardFooter>
                    </form>
                </Card>
                 <AgreementDialog/>
            </div>
        </Dialog>
    );
}
