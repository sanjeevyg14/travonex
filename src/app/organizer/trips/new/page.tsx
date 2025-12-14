

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMockData } from "@/hooks/use-mock-data";
import type { Trip, ItineraryItem, FAQ as TripFAQ, Batch } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Trash2, ArrowLeft, Mountain, Car, Tent, Briefcase, Wand2, Info, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";


// This component serves as both a "Create New Trip" and "Edit Trip" page.
// It accepts an optional `tripToEdit` prop. If the prop is provided, the component
// enters "Edit Mode" and pre-populates all form fields with the existing trip data.
// If the prop is absent, it renders a blank form for creating a new trip.
export default function NewTripPage({ tripToEdit }: { tripToEdit?: Trip }) {
    // --- HOOKS ---
    const { addTrip, setTrips, organizers, tripCategories, tripDifficulties, commissionRate, travelCities } = useMockData();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    // Determine if the component is in edit mode based on the presence of tripToEdit.
    const isEditMode = !!tripToEdit;

    // Find the current organizer from mock data based on the logged-in user's name.
    const currentOrganizer = Object.values(organizers).find(o => o.name === user?.name) || organizers['adventure-seekers'];

    // --- MULTI-STEP WIZARD STATE ---
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;
    
    // --- STATE INITIALIZATION ---
    // Basic Trip Details (Step 1)
    const [title, setTitle] = useState(tripToEdit?.title || "");
    const [location, setLocation] = useState(tripToEdit?.location || "");
    const [departureCity, setDepartureCity] = useState(tripToEdit?.departureCity || "");
    const [duration, setDuration] = useState(tripToEdit?.duration || "");
    const [minAge, setMinAge] = useState(tripToEdit?.minAge?.toString() || "18");
    const [maxAge, setMaxAge] = useState(tripToEdit?.maxAge?.toString() || "60");
    const [price, setPrice] = useState(tripToEdit?.price.toString() || "");

    const TAX_RATE = 18; // Defaulting to 18% GST for now

    const B = useMemo(() => {
        const cleaned = String(price).replace(/,/g, "").trim();
        const parsed = parseFloat(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }, [price]);

    const GST_amt = B * (TAX_RATE / 100);
    const Traveler_Price = B + GST_amt;
    const Travonex_Fee = B * (commissionRate / 100);
    const Estimated_Payout = B - Travonex_Fee;

    const formatINR = (v: number) => v <= 0 ? "₹0" : `₹${Math.round(v).toLocaleString("en-IN")}`;
    
    // Category state
    const [category, setCategory] = useState(tripToEdit?.category || "");
    const [customCategory, setCustomCategory] = useState("");
    const isCustomCategory = useMemo(() => {
        if (!tripToEdit?.category) return false;
        return !tripCategories.includes(tripToEdit.category);
    }, [tripToEdit, tripCategories]);

    useEffect(() => {
        if (isEditMode && tripToEdit) {
            if (isCustomCategory) {
                setCategory("other");
                setCustomCategory(tripToEdit.category);
            } else {
                setCategory(tripToEdit.category);
            }
        }
    }, [tripToEdit, isEditMode, isCustomCategory]);
    
    // Difficulty State
    const [difficulty, setDifficulty] = useState(tripToEdit?.difficulty || "N/A");
    const [customDifficulty, setCustomDifficulty] = useState("");
    const isCustomDifficulty = useMemo(() => {
        if (!tripToEdit?.difficulty) return false;
        // If there's a difficulty but it's not in the predefined list, it's custom.
        // Also checks if the initial value is not 'N/A'.
        return !tripDifficulties.includes(tripToEdit.difficulty) && tripToEdit.difficulty !== 'N/A';
    }, [tripToEdit, tripDifficulties]);

     useEffect(() => {
        if (isEditMode && tripToEdit) {
            if (isCustomDifficulty) {
                setDifficulty("other");
                setCustomDifficulty(tripToEdit.difficulty!);
            } else {
                setDifficulty(tripToEdit.difficulty || "N/A");
            }
        }
    }, [tripToEdit, isEditMode, isCustomDifficulty]);


    // The Story (Step 2)
    const [shortDescription, setShortDescription] = useState(tripToEdit?.shortDescription || "");
    const [description, setDescription] = useState(tripToEdit?.description || "");
    const [image, setImage] = useState<File | null>(null);
    const [gallery, setGallery] = useState<File[]>([]);
    const [highlights, setHighlights] = useState<string[]>(tripToEdit?.highlights || [""]);

    // The Schedule (Step 3)
    const [batches, setBatches] = useState<Batch[]>(tripToEdit?.batches || [{ id: `batch-${Date.now()}`, startDate: "", endDate: "", availableSlots: 15, status: 'Active' }]);

    // The Logistics (Step 4)
    const [itinerary, setItinerary] = useState<ItineraryItem[]>(tripToEdit?.itinerary || [{ day: 1, title: "", description: "" }]);
    const [inclusions, setInclusions] = useState<string[]>(tripToEdit?.inclusions || [""]);
    const [exclusions, setExclusions] = useState<string[]>(tripToEdit?.exclusions || [""]);
    
    // The Fine Print (Step 5)
    const [faqs, setFaqs] = useState<TripFAQ[]>(tripToEdit?.faqs || [{ question: "", answer: "" }]);
    const [cancellationPolicy, setCancellationPolicy] = useState(tripToEdit?.cancellationPolicy || "");
    const [isSpotReservationEnabled, setIsSpotReservationEnabled] = useState(tripToEdit?.spotReservationEnabled ?? true);
    const [spotReservationPercentage, setSpotReservationPercentage] = useState(tripToEdit?.spotReservationPercentage?.toString() || "10");
    const [balanceDueDays, setBalanceDueDays] = useState(tripToEdit?.balanceDueDays?.toString() || "15");
    const [remarks, setRemarks] = useState(tripToEdit?.remarks || "");
    
    const categoryIcons: { [key: string]: React.ReactNode } = {
        "Treks": <Mountain />,
        "Road Trips": <Car />,
        "Camping": <Tent />,
        "Weekend Getaways": <Briefcase />,
        "other": <Wand2 />
    };

    // --- WIZARD NAVIGATION ---
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));


    // --- DYNAMIC LIST HANDLERS ---
    const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string | number) => {
        const newItinerary = [...itinerary];
        newItinerary[index] = { ...newItinerary[index], [field]: value };
        setItinerary(newItinerary);
    };

    const handleFaqChange = (index: number, field: keyof TripFAQ, value: string) => {
        const newFaqs = [...faqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setFaqs(newFaqs);
    };

    const handleBatchChange = (index: number, field: keyof Batch, value: string | number | boolean | undefined) => {
        const newBatches = [...batches];
        const updatedBatch = { ...newBatches[index], [field]: value };

        // If a deal is turned off, clear the deal price
        if (field === 'isLastMinuteDeal' && value === false) {
            delete updatedBatch.dealPrice;
        }

        newBatches[index] = updatedBatch;
        setBatches(newBatches);
    }

    const addItineraryDay = () => {
        setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "" }]);
    };
    
    const removeItineraryDay = (index: number) => {
        if (itinerary.length > 1) {
            const newItinerary = itinerary.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 }));
            setItinerary(newItinerary);
        }
    };
    
    const handleStringListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        setter(prevList => {
            const newList = [...prevList];
            newList[index] = value;
            return newList;
        });
    };

    const addStringListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, ""]);
    };

    const removeStringListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter(prev => {
            if (prev.length <= 1) return [""];
            return prev.filter((_, i) => i !== index);
        });
    };

    const addFaqItem = () => {
        setFaqs([...faqs, { question: "", answer: "" }]);
    };
    
    const removeFaqItem = (index: number) => {
        if (faqs.length > 1) {
            setFaqs(faqs.filter((_, i) => i !== index));
        } else {
            setFaqs([{ question: "", answer: "" }]);
        }
    };

    const addBatch = () => {
        setBatches([...batches, { id: `batch-${Date.now()}`, startDate: "", endDate: "", availableSlots: 15, status: 'Active' }]);
    };
    
    const removeBatch = (index: number) => {
        if (batches.length > 1) {
            setBatches(batches.filter((_, i) => i !== index));
        }
    };
    
    // --- FORM SUBMISSION ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalCategory = category === 'other' ? customCategory : category;
        let finalDifficulty: string | undefined;

        if (difficulty === 'other') {
            finalDifficulty = customDifficulty;
        } else if (difficulty === 'N/A') {
            finalDifficulty = undefined; // Set to undefined if N/A
        } else {
            finalDifficulty = difficulty;
        }

        // Basic validation
        if (!title || !location || !departureCity || !finalCategory || !duration || !price || !description || !shortDescription || !user) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all required basic details."});
            setCurrentStep(1);
            return;
        }

        // Construct the core trip data object from the current state.
        const tripData: Omit<Trip, 'id' | 'slug' | 'rating' | 'reviewsCount' | 'image' | 'status'> = {
            title,
            location,
            departureCity,
            category: finalCategory,
            duration,
            price: Number(price),
            isPriceTaxInclusive: false, // Standardizing to pre-tax
            description,
            shortDescription,
            organizer: currentOrganizer,
            itinerary: itinerary.filter(item => item.title && item.description),
            inclusions: inclusions.filter(item => item),
            exclusions: exclusions.filter(item => item),
            difficulty: finalDifficulty,
            minAge: Number(minAge),
            maxAge: Number(maxAge),
            highlights: highlights.filter(item => item),
            batches: batches.filter(batch => batch.startDate && batch.endDate),
            cancellationPolicy,
            faqs: faqs.filter(f => f.question && f.answer),
            spotReservationEnabled: isSpotReservationEnabled,
            spotReservationPercentage: isSpotReservationEnabled ? Number(spotReservationPercentage) : undefined,
            balanceDueDays: isSpotReservationEnabled ? Number(balanceDueDays) : undefined,
            remarks,
        };

        if (isEditMode) {
            setTrips(prevTrips => prevTrips.map(trip => 
                trip.id === tripToEdit.id ? { ...trip, ...tripData, status: 'pending', adminRemarks: undefined } : trip
            ));
            toast({ title: "Trip Resubmitted!", description: "Your trip details have been updated and sent for review." });
        } else {
            const newTrip: Trip = {
                ...tripData,
                id: `trip-${Date.now()}`,
                slug: title.toLowerCase().replace(/\s+/g, '-'),
                image: "trip" + (Math.floor(Math.random() * 6) + 1), // Assign random image
                status: "pending",
                rating: (Math.random() * (5 - 4) + 4).toFixed(1),
                reviewsCount: Math.floor(Math.random() * 100),
            };
            addTrip(newTrip);
            toast({ title: "Trip Submitted!", description: "Your new trip has been submitted for review." });
        }
        router.push("/organizer/trips");
    };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
        {isEditMode && tripToEdit.adminRemarks && (
            <Alert variant="destructive" className="mb-8">
                <Info className="h-4 w-4" />
                <AlertTitle>Action Required: Feedback from Travonex</AlertTitle>
                <AlertDescription>
                    Your trip was returned to drafts. Please review the feedback below, make the necessary changes, and resubmit.
                    <div className="mt-2 p-2 bg-background/50 rounded-md text-sm font-semibold">
                        {tripToEdit.adminRemarks}
                    </div>
                </AlertDescription>
            </Alert>
        )}
        {/* --- Progress Indicator --- */}
        <div className="mb-8">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-primary">Step {currentStep} of {totalSteps}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- STEP 1: The Essentials --- */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>The Essentials</CardTitle>
                        <CardDescription>Let's start with the basics. What is your trip about?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Trip Title</Label>
                            <Input id="title" placeholder="e.g., Himalayan Peak Adventure" value={title} onChange={(e) => setTitle(e.target.value)} required/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="departureCity">Departure City</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                        >
                                            {departureCity ? departureCity : "Select a city..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search city..." />
                                            <CommandList>
                                                <CommandEmpty>No city found.</CommandEmpty>
                                                <CommandGroup>
                                                    {travelCities.map((city) => (
                                                        <CommandItem
                                                            key={city}
                                                            value={city}
                                                            onSelect={(currentValue) => {
                                                                setDepartureCity(currentValue === departureCity ? "" : currentValue);
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", departureCity === city ? "opacity-100" : "opacity-0")}/>
                                                            {city}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Main Location / Destination</Label>
                                <Input id="location" placeholder="e.g., Manali, Himachal Pradesh" value={location} onChange={(e) => setLocation(e.target.value)} required/>
                            </div>
                        </div>
                        
                         {/* Visual Category Selection */}
                        <div className="space-y-4">
                            <Label>Category</Label>
                             <RadioGroup value={category} onValueChange={setCategory} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {tripCategories.map((cat) => (
                                <Label key={cat} htmlFor={cat} className="flex flex-col items-center justify-center gap-2 p-4 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:bg-primary/10 has-[:checked]:border-primary aspect-square">
                                    <RadioGroupItem value={cat} id={cat} className="sr-only" />
                                    {categoryIcons[cat] || <Briefcase />}
                                    <span className="font-medium text-center">{cat}</span>
                                </Label>
                                ))}
                                <Label htmlFor="other-category" className="flex flex-col items-center justify-center gap-2 p-4 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:bg-primary/10 has-[:checked]:border-primary aspect-square">
                                    <RadioGroupItem value="other" id="other-category" className="sr-only" />
                                    {categoryIcons['other']}
                                    <span className="font-medium text-center">Other</span>
                                </Label>
                            </RadioGroup>
                             {category === 'other' && (
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="customCategory" className="text-muted-foreground">Please specify your category</Label>
                                    <Input 
                                        id="customCategory" 
                                        placeholder="e.g., Spiritual Retreat" 
                                        value={customCategory} 
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input id="duration" placeholder="e.g., 3 Days, 2 Nights" value={duration} onChange={(e) => setDuration(e.target.value)} required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="price">Your Base Price (per person, ex-GST) in ₹</Label>
                                <Input id="price" type="text" inputMode="decimal" placeholder="e.g., 4999" value={price} onChange={(e) => setPrice(e.target.value)} required/>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 rounded-lg border bg-blue-500/10 p-4 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                                <Label>Traveler Price Preview</Label>
                                <p className="text-2xl font-bold">{formatINR(Traveler_Price)}</p>
                                <p className="text-xs">Your Base: {formatINR(B)} + Tax ({TAX_RATE}%): {formatINR(GST_amt)}</p>
                            </div>
                            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                                <Label>Estimated Payout (after {commissionRate}% Travonex fee)</Label>
                                <p className="text-2xl font-bold text-primary">{formatINR(Estimated_Payout)}</p>
                                <p className="text-xs text-muted-foreground">
                                    Payout is calculated on your base price. You are responsible for remitting your own taxes.
                                </p>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Difficulty Level</Label>
                                <RadioGroup value={difficulty} onValueChange={setDifficulty} className="space-y-2">
                                    {tripDifficulties.map((level) => (
                                        <div key={level} className="flex items-center space-x-2">
                                            <RadioGroupItem value={level} id={`difficulty-${level}`} />
                                            <Label htmlFor={`difficulty-${level}`} className="font-normal">{level}</Label>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="other" id="difficulty-other" />
                                        <Label htmlFor="difficulty-other" className="font-normal">Other</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="N/A" id="difficulty-na" />
                                        <Label htmlFor="difficulty-na" className="font-normal">N/A</Label>
                                    </div>
                                </RadioGroup>
                                {difficulty === 'other' && (
                                    <div className="pt-2">
                                        <Input
                                            id="customDifficulty"
                                            placeholder="e.g., Very Easy"
                                            value={customDifficulty}
                                            onChange={(e) => setCustomDifficulty(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                             <div className="space-y-4">
                                <Label>Age Group</Label>
                                <div className="flex items-center gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="minAge" className="text-xs text-muted-foreground">Min Age</Label>
                                        <Input id="minAge" type="number" placeholder="18" value={minAge} onChange={(e) => setMinAge(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxAge" className="text-xs text-muted-foreground">Max Age</Label>
                                        <Input id="maxAge" type="number" placeholder="60" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="remarks">Other Details / Remarks (Optional)</Label>
                            <Textarea id="remarks" placeholder="e.g., This trip involves high-altitude and may not be suitable for people with respiratory issues. Please consult a doctor." rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- STEP 2: The Story --- */}
            {currentStep === 2 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>The Story</CardTitle>
                        <CardDescription>Tell travelers why your trip is amazing. Add beautiful photos and highlight the key experiences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="short-description">Short Description (Teaser)</Label>
                            <Input id="short-description" placeholder="A catchy one-liner for the trip card." value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required maxLength={120}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Full Trip Description</Label>
                            <Textarea id="description" placeholder="Describe the amazing experience travelers will have..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cover-image">Cover Image</Label>
                            <Input id="cover-image" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*"/>
                            <p className="text-xs text-muted-foreground">Main image for your trip. If updating, this will replace the old one.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gallery-images">Gallery Images</Label>
                            <Input id="gallery-images" type="file" multiple onChange={(e) => setGallery(Array.from(e.target.files || []))} accept="image/*" />
                            <p className="text-xs text-muted-foreground">Upload additional photos to showcase the trip.</p>
                        </div>
                        <div className="space-y-4">
                            <Label className="font-semibold">Highlights</Label>
                            {highlights.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input placeholder="e.g., Sunrise from the peak" value={item} onChange={(e) => handleStringListChange(setHighlights, index, e.target.value)}/>
                                    {highlights.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeStringListItem(setHighlights, index)}>
                                            <Trash2 />
                                        </Button>
                                    )}
                                    {index === highlights.length - 1 && 
                                        <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary shrink-0" onClick={() => addStringListItem(setHighlights)}>
                                            <PlusCircle />
                                        </Button>
                                    }
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* --- STEP 3: The Schedule --- */}
            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Schedule</CardTitle>
                        <CardDescription>Add the dates your trip is available. You can create multiple batches for different dates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {batches.map((batch, index) => (
                            <div key={batch.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/50">
                                <div className="flex justify-between items-start">
                                    <Label className="font-semibold pt-2">Batch {index + 1}</Label>
                                    <div className="flex items-center gap-2">
                                        {batches.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeBatch(index)}>
                                                <Trash2 />
                                            </Button>
                                        )}
                                        {index === batches.length - 1 && 
                                            <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary" onClick={addBatch}>
                                                <PlusCircle />
                                            </Button>
                                        }
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !batch.startDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {batch.startDate ? format(new Date(batch.startDate), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={batch.startDate ? new Date(batch.startDate) : undefined} onSelect={(date) => handleBatchChange(index, 'startDate', date ? format(date, 'yyyy-MM-dd') : '')} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !batch.endDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                     {batch.endDate ? format(new Date(batch.endDate), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={batch.endDate ? new Date(batch.endDate) : undefined} onSelect={(date) => handleBatchChange(index, 'endDate', date ? format(date, 'yyyy-MM-dd') : '')} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`slots-${index}`}>Available Slots</Label>
                                    <Input id={`slots-${index}`} type="number" placeholder="15" value={batch.availableSlots} onChange={(e) => handleBatchChange(index, 'availableSlots', Number(e.target.value))}/>
                                </div>

                                <div className="p-4 border rounded-lg bg-background/50 space-y-4">
                                     <div className="flex items-center space-x-2">
                                        <Switch 
                                            id={`deal-switch-${index}`}
                                            checked={batch.isLastMinuteDeal}
                                            onCheckedChange={(checked) => handleBatchChange(index, 'isLastMinuteDeal', checked)}
                                        />
                                        <Label htmlFor={`deal-switch-${index}`} className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary"/> Offer a Last-Minute Deal</Label>
                                    </div>
                                    {batch.isLastMinuteDeal && (
                                         <div className="space-y-2 pl-8 border-l-2 ml-3">
                                            <Label htmlFor={`deal-price-${index}`}>Deal Price (₹)</Label>
                                            <Input 
                                                id={`deal-price-${index}`} 
                                                type="number" 
                                                placeholder="e.g., 3999" 
                                                value={batch.dealPrice || ''}
                                                onChange={(e) => handleBatchChange(index, 'dealPrice', e.target.value ? Number(e.target.value) : undefined)}
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">This price will override the main trip price for this batch only.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* --- STEP 4: The Logistics --- */}
            {currentStep === 4 && (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Itinerary Builder</CardTitle>
                            <CardDescription>Outline the day-by-day plan for the trip.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {itinerary.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 relative bg-muted/50">
                                    <div className="flex justify-between items-center">
                                        <Label className="font-semibold">Day {item.day}</Label>
                                        <div className="flex items-center gap-2">
                                            {itinerary.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItineraryDay(index)}>
                                                    <Trash2 />
                                                </Button>
                                            )}
                                            {index === itinerary.length - 1 && 
                                                <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary" onClick={addItineraryDay}>
                                                    <PlusCircle />
                                                </Button>
                                            }
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Input placeholder="Day Title, e.g., Arrival and Acclimatization" value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} required/>
                                        <Textarea placeholder="Detailed description of the day's activities." value={item.description} rows={3} onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} required/>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader><CardTitle>Inclusions</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {inclusions.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input placeholder="e.g., All meals" value={item} onChange={(e) => handleStringListChange(setInclusions, index, e.target.value)}/>
                                        {inclusions.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeStringListItem(setInclusions, index)}>
                                                <Trash2 />
                                            </Button>
                                        )}
                                        {index === inclusions.length - 1 && 
                                            <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary shrink-0" onClick={() => addStringListItem(setInclusions)}>
                                                <PlusCircle />
                                            </Button>
                                        }
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Exclusions</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {exclusions.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input placeholder="e.g., Personal expenses" value={item} onChange={(e) => handleStringListChange(setExclusions, index, e.target.value)}/>
                                        {exclusions.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeStringListItem(setExclusions, index)}>
                                                <Trash2 />
                                            </Button>
                                        )}
                                        {index === exclusions.length - 1 && 
                                            <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary shrink-0" onClick={() => addStringListItem(setExclusions)}>
                                                <PlusCircle />
                                            </Button>
                                        }
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            
             {/* --- STEP 5: Fine Print --- */}
            {currentStep === 5 && (
                <div className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Policies &amp; FAQs</CardTitle>
                            <CardDescription>Provide clear information to build trust with travelers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                                <Textarea id="cancellation-policy" placeholder="Describe your cancellation and refund policy clearly." rows={4} value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold">Frequently Asked Questions (FAQs)</h3>
                                {faqs.map((faq, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-3 relative bg-muted/50">
                                        <div className="flex justify-between items-center">
                                            <Label className="font-semibold">Question {index + 1}</Label>
                                            <div className="flex items-center gap-2">
                                                {faqs.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFaqItem(index)}>
                                                        <Trash2 />
                                                    </Button>
                                                )}
                                                {index === faqs.length - 1 && 
                                                    <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary" onClick={addFaqItem}>
                                                        <PlusCircle />
                                                    </Button>
                                                }
                                            </div>
                                        </div>
                                        <Input placeholder="Question" value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                                        <Textarea placeholder="Answer" value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment &amp; Booking Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label htmlFor="spot-reservation" className="font-medium">Enable Spot Reservation</Label>
                                    <p className="text-sm text-muted-foreground">Allow travelers to book by paying an upfront percentage.</p>
                                </div>
                                <Switch id="spot-reservation" checked={isSpotReservationEnabled} onCheckedChange={setIsSpotReservationEnabled} />
                            </div>
                            {isSpotReservationEnabled && (
                                <div className="space-y-4 pl-4 border-l-2 ml-6">
                                     <div className="space-y-2">
                                        <Label htmlFor="spot-reservation-percentage">Reservation Percentage</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="spot-reservation-percentage" type="number" value={spotReservationPercentage} onChange={(e) => setSpotReservationPercentage(e.target.value)} className="w-24" min="5" max="50" required/>
                                            <span className="text-muted-foreground">%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Percentage of total price to be paid upfront (e.g., 10%).</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="balance-due">Balance Payment Deadline</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="balance-due" type="number" value={balanceDueDays} onChange={(e) => setBalanceDueDays(e.target.value)} className="w-24" required/>
                                            <span className="text-muted-foreground">days before trip start date.</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">If the balance isn't paid by this time, the booking may be cancelled.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
           
            {/* --- NAVIGATION FOOTER --- */}
            <div className="flex justify-between items-center pt-8">
                <div>
                  {currentStep > 1 && (
                      <Button variant="outline" type="button" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous Step
                      </Button>
                  )}
                </div>
                 <div>
                  {currentStep < totalSteps ? (
                      <Button type="button" onClick={nextStep}>
                          Next Step
                      </Button>
                  ) : (
                      <Button type="submit">
                          {isEditMode ? "Resubmit for Review" : "Submit for Review"}
                      </Button>
                  )}
                </div>
            </div>
        </form>
    </div>
  );
}
