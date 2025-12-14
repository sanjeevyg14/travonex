
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMockData } from "@/hooks/use-mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Experience, LogisticsPoint } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Clock, Calendar as CalendarIcon, UploadCloud, Zap, Video } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const experienceCategories = [
  'Water', 'Adventure', 'Aerial', 'Nature', 'Local Tours', 'Workshops', 'Food & Drink', 'Wellness', 'Entertainment'
];

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export default function NewExperiencePage({ experienceToEdit }: { experienceToEdit?: Experience }) {
    const { addExperience, setExperiences, experienceVendors, commissionRate } = useMockData();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const isEditMode = !!experienceToEdit;
    
    // --- FORM STATE ---
    const [title, setTitle] = useState(experienceToEdit?.title || "");
    const [location, setLocation] = useState(experienceToEdit?.location || "");
    const [category, setCategory] = useState<string>(() => {
        if (!experienceToEdit?.category) return "";
        return experienceCategories.includes(experienceToEdit.category) ? experienceToEdit.category : "other";
    });
    const [customCategory, setCustomCategory] = useState(() => {
         if (!experienceToEdit?.category) return "";
        return experienceCategories.includes(experienceToEdit.category) ? "" : experienceToEdit.category;
    });

    const [price, setPrice] = useState(experienceToEdit?.price.toString() || "");
    
    const [taxRate, setTaxRate] = useState('18');
    
    const [duration, setDuration] = useState(experienceToEdit?.duration || "");
    const [difficulty, setDifficulty] = useState<Experience['difficulty'] | "">(experienceToEdit?.difficulty || "");
    const [description, setDescription] = useState(experienceToEdit?.description || "");
    const [videoUrl, setVideoUrl] = useState(experienceToEdit?.videoUrl || ""); // <-- NEW STATE FOR VIDEO
    const [highlights, setHighlights] = useState<string[]>(experienceToEdit?.highlights || [""]);
    const [inclusions, setInclusions] = useState<string[]>(experienceToEdit?.inclusions || [""]);
    const [exclusions, setExclusions] = useState<string[]>(experienceToEdit?.exclusions || [""]);
    const [safetyNotes, setSafetyNotes] = useState(experienceToEdit?.safetyNotes || "");
    const [cancellationPolicy, setCancellationPolicy] = useState(experienceToEdit?.cancellationPolicy || "");
    const [availabilityType, setAvailabilityType] = useState(experienceToEdit?.availability.type || 'daily');
    const [timeSlots, setTimeSlots] = useState<string[]>(experienceToEdit?.availability.timeSlots || [""]);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [pickupPoints, setPickupPoints] = useState<LogisticsPoint[]>(experienceToEdit?.pickupPoints || [{ location: "", time: "", address: "", mapLink: "" }]);
    const [dropoffPoints, setDropoffPoints] = useState<LogisticsPoint[]>(experienceToEdit?.dropoffPoints || [{ location: "", time: "", address: "", mapLink: "" }]);
    const [remarks, setRemarks] = useState(experienceToEdit?.remarks || "");
    
    // --- Payout Calculation ---
    const B = useMemo(() => {
        const cleaned = String(price).replace(/,/g, "").trim();
        const parsed = parseFloat(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }, [price]);
    const g = parseFloat(taxRate) || 0;
    const f = commissionRate;

    const GST_amt = B * (g / 100);
    const Traveler_Price = B * (1 + g / 100);
    const Travonex_Fee = B * (f / 100);
    const Estimated_Payout = B * (1 - f / 100);

    const formatINR = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organizerId) {
            toast({ variant: 'destructive', title: "Error", description: "Could not identify organizer." });
            return;
        }

        const vendor = experienceVendors[user.organizerId];
        if (!vendor) {
            toast({ variant: 'destructive', title: "Error", description: "Organizer profile not found." });
            return;
        }
        
        const finalCategory = category === 'other' ? customCategory : category;
        if (!finalCategory) {
            toast({ variant: 'destructive', title: "Category is required", description: "Please select or specify a category." });
            return;
        }


        const newExperienceData: Omit<Experience, 'id' | 'slug' | 'images' | 'vendor'> = {
            title,
            location,
            category: finalCategory,
            price: Number(price),
            isPriceTaxInclusive: false,
            duration,
            difficulty: difficulty as Experience['difficulty'],
            description,
            videoUrl, // <-- SAVE VIDEO URL
            highlights: highlights.filter(h => h.trim() !== ""),
            inclusions: inclusions.filter(i => i.trim() !== ""),
            exclusions: exclusions.filter(e => e.trim() !== ""),
            safetyNotes,
            cancellationPolicy,
            availability: {
                type: availabilityType as 'daily' | 'weekdays' | 'weekends',
                timeSlots: timeSlots.filter(t => t.trim() !== ''),
            },
            pickupPoints: pickupPoints.filter(p => p.location),
            dropoffPoints: dropoffPoints.filter(p => p.location),
            remarks
        };
        
        if (isEditMode) {
            setExperiences(prev => prev.map(exp => 
                exp.id === experienceToEdit.id ? { ...exp, ...newExperienceData } : exp
            ));
            toast({ title: "Experience Updated!", description: "Your changes have been saved." });
        } else {
             const newExperience: Experience = {
                ...newExperienceData,
                id: `exp-${Date.now()}`,
                slug: title.toLowerCase().replace(/\s+/g, '-'),
                images: ['exp1'], // Mock image
                vendor,
            };
            addExperience(newExperience);
            toast({ title: "Experience Submitted!", description: "Your new experience is now pending review." });
        }
        
        router.push("/vendor/dashboard");
    };

    const handleListChange = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setList(newList);
    };

    const addListItem = (setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setList(prev => [...prev, ""]);
    };

    const removeListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        if (list.length > 1) {
            setList(list.filter((_, i) => i !== index));
        } else {
            setList([""]);
        }
    };

    const handleLogisticsChange = (setter: React.Dispatch<React.SetStateAction<LogisticsPoint[]>>, index: number, field: keyof LogisticsPoint, value: string) => {
        setter(prev => {
            const newList = [...prev];
            newList[index] = { ...newList[index], [field]: value };
            return newList;
        });
    };

    const addLogisticsPoint = (setter: React.Dispatch<React.SetStateAction<LogisticsPoint[]>>) => {
        setter(prev => [...prev, { location: "", time: "", address: "", mapLink: "" }]);
    };

    const removeLogisticsPoint = (setter: React.Dispatch<React.SetStateAction<LogisticsPoint[]>>, index: number) => {
        setter(prev => {
            if (prev.length > 1) return prev.filter((_, i) => i !== index);
            return [{ location: "", time: "", address: "", mapLink: "" }];
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditMode ? 'Edit Experience' : 'Create New Experience'}</CardTitle>
                    <CardDescription>{isEditMode ? 'Update the details for your activity.' : 'Fill in the details for your new activity, tour, or workshop.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Experience Title</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Sunrise Kayaking in Alleppey" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Alleppey, Kerala" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                                <SelectContent>
                                    {experienceCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    <SelectItem value="other">Other...</SelectItem>
                                </SelectContent>
                            </Select>
                            {category === 'other' && (
                                <Input 
                                    className="mt-2"
                                    placeholder="Please specify your category"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    required
                                />
                            )}
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g., 2 Hours" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select value={difficulty} onValueChange={v => setDifficulty(v as Experience['difficulty'])}>
                                <SelectTrigger id="difficulty"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                                <SelectContent>
                                    {difficultyLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price">Your Base Price (₹)</Label>
                            <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 1500" required />
                             <p className="text-xs text-muted-foreground">The amount you want to receive before platform fees.</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="tax-rate">Applicable GST Rate (%)</Label>
                            <Input id="tax-rate" type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="18" required />
                             <p className="text-xs text-muted-foreground">Set to 0 if not applicable.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2 rounded-lg border bg-blue-500/10 p-4 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                            <Label>Traveler Price Preview</Label>
                            <p className="text-2xl font-bold">{formatINR(Traveler_Price)}</p>
                            <p className="text-xs">Your Base: {formatINR(B)} + Tax ({g}%): {formatINR(GST_amt)}</p>
                        </div>
                        <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                            <Label>Estimated Payout (after {f}% Travonex fee)</Label>
                            <p className="text-2xl font-bold text-primary">{formatINR(Estimated_Payout)}</p>
                            <p className="text-xs text-muted-foreground">
                                Payout is calculated on your base price.
                            </p>
                        </div>
                    </div>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><UploadCloud /> Media</CardTitle>
                            <CardDescription>Upload a cover image and additional photos for your experience gallery.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cover-image">Cover Image</Label>
                                <Input id="cover-image" type="file" accept="image/*" />
                                <p className="text-xs text-muted-foreground">This is the main image shown in listings.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gallery-images">Gallery Images</Label>
                                <Input id="gallery-images" type="file" multiple accept="image/*" />
                                <p className="text-xs text-muted-foreground">Upload multiple images to showcase the experience.</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="video-url" className="flex items-center gap-2"><Video /> YouTube Video Link (Optional)</Label>
                                <Input id="video-url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                                <p className="text-xs text-muted-foreground">A link to a YouTube video will be shown on your experience page.</p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>Logistics</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="font-semibold">Pickup Points</Label>
                                {pickupPoints.map((point, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-3 relative bg-muted/50 mt-2">
                                        <div className="flex justify-end">
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive absolute top-1 right-1 h-7 w-7" onClick={() => removeLogisticsPoint(setPickupPoints, index)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1"><Label className="text-xs">Location Name</Label><Input placeholder="e.g., Main Entrance" value={point.location} onChange={e => handleLogisticsChange(setPickupPoints, index, 'location', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Time</Label><Input type="time" value={point.time} onChange={e => handleLogisticsChange(setPickupPoints, index, 'time', e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-1"><Label className="text-xs">Full Address</Label><Input placeholder="Full address for the pickup point" value={point.address} onChange={e => handleLogisticsChange(setPickupPoints, index, 'address', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Google Maps Link</Label><Input placeholder="https://maps.google.com/..." value={point.mapLink} onChange={e => handleLogisticsChange(setPickupPoints, index, 'mapLink', e.target.value)} /></div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => addLogisticsPoint(setPickupPoints)}><PlusCircle className="mr-2 h-4 w-4" />Add Pickup Point</Button>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Availability</CardTitle>
                            <CardDescription>Set when this experience is available and the time slots for booking.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Recurring Availability</Label>
                                <Select value={availabilityType} onValueChange={setAvailabilityType}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekdays">Weekdays Only</SelectItem>
                                        <SelectItem value="weekends">Weekends Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Specific Dates / Block-out Dates</Label>
                                <Calendar
                                    mode="multiple"
                                    selected={availableDates}
                                    onSelect={setAvailableDates}
                                    className="rounded-md border"
                                />
                                 <p className="text-xs text-muted-foreground">Select specific dates your experience is available, or use this to block out dates from your recurring schedule.</p>
                            </div>
                            <div className="space-y-4">
                                <Label className="font-semibold">Time Slots</Label>
                                {timeSlots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <Input type="time" value={slot} onChange={e => handleListChange(timeSlots, setTimeSlots, index, e.target.value)} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(timeSlots, setTimeSlots, index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        {index === timeSlots.length - 1 && <Button type="button" variant="ghost" size="icon" onClick={() => addListItem(setTimeSlots)}><PlusCircle className="h-4 w-4 text-primary"/></Button>}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <div className="space-y-2">
                        <Label htmlFor="description">Full Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the experience in detail..." rows={4} required/>
                    </div>
                    <div className="space-y-4">
                        <Label className="font-semibold">Highlights</Label>
                        {highlights.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={item} onChange={e => handleListChange(highlights, setHighlights, index, e.target.value)} placeholder="e.g., Spot dolphins in their natural habitat" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(highlights, setHighlights, index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                {index === highlights.length - 1 && <Button type="button" variant="ghost" size="icon" onClick={() => addListItem(setHighlights)}><PlusCircle className="h-4 w-4 text-primary"/></Button>}
                            </div>
                        ))}
                    </div>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label className="font-semibold">Inclusions</Label>
                            {inclusions.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={item} onChange={e => handleListChange(inclusions, setInclusions, index, e.target.value)} placeholder="e.g., Kayak and paddle rental" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(inclusions, setInclusions, index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    {index === inclusions.length - 1 && <Button type="button" variant="ghost" size="icon" onClick={() => addListItem(setInclusions)}><PlusCircle className="h-4 w-4 text-primary"/></Button>}
                                </div>
                            ))}
                        </div>
                         <div className="space-y-4">
                            <Label className="font-semibold">Exclusions</Label>
                            {exclusions.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={item} onChange={e => handleListChange(exclusions, setExclusions, index, e.target.value)} placeholder="e.g., Sunscreen and sunglasses" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(exclusions, setExclusions, index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    {index === exclusions.length - 1 && <Button type="button" variant="ghost" size="icon" onClick={() => addListItem(setExclusions)}><PlusCircle className="h-4 w-4 text-primary"/></Button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="safetyNotes">Safety Notes</Label>
                        <Textarea id="safetyNotes" value={safetyNotes} onChange={e => setSafetyNotes(e.target.value)} placeholder="e.g., Life jackets are mandatory. Non-swimmers are welcome." rows={3} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                        <Textarea id="cancellationPolicy" value={cancellationPolicy} onChange={e => setCancellationPolicy(e.target.value)} placeholder="e.g., Full refund on cancellation 48 hours prior." rows={3} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks / Other Details</Label>
                        <Textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any other relevant details or special instructions for this experience." rows={3} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit">{isEditMode ? 'Save Changes' : 'Submit for Review'}</Button>
                </CardFooter>
            </Card>
        </form>
    );
}
