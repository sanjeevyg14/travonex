

"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useMockData } from "@/hooks/use-mock-data";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Star, Users, TrendingUp, Check, X, ShieldCheck, Minus, Plus, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import type { Review, Experience, Organizer, LogisticsPoint, ExperienceBooking } from "@/lib/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";


const ReviewCard = ({ review }: { review: Review }) => {
  const authorAvatar = PlaceHolderImages.find((p) => p.id === review.avatar);
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="h-10 w-10">
          {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} />}
          <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{review.author}</p>
          <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-2">
        {Array(5).fill(0).map((_, i) => (
          <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30")} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>
    </div>
  )
}

const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: string | null, label: string }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-primary">{icon}</div>
            <p className="font-bold text-lg mt-1">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
};

const HostedByCard = ({ vendor }: { vendor: Organizer }) => {
    const organizerAvatar = PlaceHolderImages.find((p) => p.id === vendor.avatar);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hosted by</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    {organizerAvatar && <AvatarImage src={organizerAvatar.imageUrl} alt={vendor.name} />}
                    <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold">{vendor.name}</h3>
                    {vendor.isVerified && (
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                            <ShieldCheck className="h-5 w-5" />
                            <span>Verified Vendor</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

const LogisticsCard = ({ points, title }: { points: LogisticsPoint[] | undefined, title: string }) => {
    if (!points || points.length === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {points.map((point) => (
                    <div key={point.location} className="text-sm">
                        <p className="font-semibold">{point.location}</p>
                        {point.address && <p className="text-muted-foreground text-xs">{point.address}</p>}
                        <div className="flex justify-between items-center mt-1">
                             <p className="text-muted-foreground text-xs">Time: {point.time}</p>
                             <Button variant="outline" size="sm" asChild>
                                <a href={point.mapLink} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="mr-2 h-3 w-3" />
                                    View Map
                                </a>
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function VideoPlayerDialog({ open, onOpenChange, videoUrl }: { open: boolean, onOpenChange: (open: boolean) => void, videoUrl: string }) {
    if (!videoUrl) return null;

    // Convert youtube.com/watch?v= to youtube.com/embed/ for embedding
    const videoId = new URL(videoUrl).searchParams.get("v");
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0">
                <DialogHeader>
                    <DialogTitle className="sr-only">Experience Video Player</DialogTitle>
                </DialogHeader>
                <div className="aspect-video">
                    {embedUrl && (
                        <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}


function BookingFormDialog({ experience, date, timeSlot, participants, onOpenChange }: { experience: Experience, date: Date, timeSlot: string, participants: number, onOpenChange: (open: boolean) => void }) {
    const { user } = useAuth();
    const { setExperienceBookings } = useMockData();
    const router = useRouter();
    const { toast } = useToast();

    // The name and phone are now managed by state, pre-filled from the user profile.
    const [travelerName, setTravelerName] = useState(user?.name || "");
    const [travelerPhone, setTravelerPhone] = useState(user?.phone || "");

    const totalPrice = experience.price * participants;

    const handleConfirmBooking = () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!travelerName || !travelerPhone) {
            toast({ variant: 'destructive', title: "Missing Information", description: "Please enter your name and phone number."});
            return;
        }
        
        const newBooking: ExperienceBooking = {
            id: `exp-booking-${Date.now()}`,
            experienceId: experience.id,
            experienceTitle: experience.title,
            travelerId: user.id,
            travelerName: travelerName,
            travelerPhone: travelerPhone,
            bookingDate: new Date().toISOString(),
            activityDate: date.toISOString(),
            timeSlot,
            participants,
            totalPrice,
            amountPaid: totalPrice, // Assuming full payment for experiences for now
            status: 'Confirmed'
        };
        
        setExperienceBookings(prev => [newBooking, ...prev]);
        onOpenChange(false);
        toast({
            title: "Booking Confirmed!",
            description: "Your experience has been successfully booked."
        });
        // In a real app, you would redirect to a confirmation page.
        // For now, we just show a toast.
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Your Experience</DialogTitle>
                <DialogDescription>Review your details before confirming your booking.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">{experience.title}</h3>
                    <p className="text-sm text-muted-foreground">{experience.location}</p>
                    <p className="text-sm text-muted-foreground">Date: {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">Time: {timeSlot}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={travelerName} onChange={(e) => setTravelerName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={travelerPhone} onChange={(e) => setTravelerPhone(e.target.value)} />
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground px-1">A confirmation will be sent to your registered email and phone number.</p>
                 <div className="flex justify-between items-center font-bold text-lg p-4 bg-muted rounded-lg">
                    <span>Total Amount</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleConfirmBooking}>Confirm & Pay</Button>
            </DialogFooter>
        </DialogContent>
    )
}


export default function ExperienceDetails({ experience }: { experience: Experience }) {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [participants, setParticipants] = useState(1);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
        setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);
  
  useEffect(() => {
    if (isCalendarOpen && calendarRef.current) {
        calendarRef.current.focus();
    }
  }, [isCalendarOpen]);
  
  const { totalReviews, averageRating } = useMemo(() => {
    const reviews = experience?.reviews || [];
    const total = reviews.length;
    if (total === 0) {
      return { totalReviews: 0, averageRating: 0 };
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / total;
    return { totalReviews: total, averageRating: parseFloat(avg.toFixed(1)) };
  }, [experience?.reviews]);
  
  if (!isClient) {
    return (
        <div className="container py-12">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-8 w-1/4 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!experience) {
    notFound();
  }
  
  const hasVideo = !!experience.videoUrl;
  const galleryImages = experience.images;
  const carouselItems = hasVideo ? [experience.images[0], ...galleryImages] : galleryImages;


  return (
    <>
      {hasVideo && <VideoPlayerDialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen} videoUrl={experience.videoUrl!} />}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
      <div className="container py-12">

        {/* --- Header Section --- */}
        <section className="mb-8">
          <Badge variant="secondary" className="mb-2">{experience.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">{experience.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
             <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-5 w-5"/> {experience.location}</div>
             {totalReviews > 0 && <div className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500 fill-yellow-500"/> <span className="font-bold">{averageRating}</span> ({totalReviews} reviews)</div>}
          </div>
        </section>

        {/* --- Image Carousel --- */}
        <section className="mb-4 relative">
            <Carousel setApi={setCarouselApi} className="w-full">
              <CarouselContent>
                {carouselItems.map((imgId, index) => {
                  const placeholder = PlaceHolderImages.find((p) => p.id === imgId);
                  if (!placeholder) return null;
                  const isVideoThumbnail = hasVideo && index === 0;
                  return (
                    <CarouselItem key={`${imgId}-${index}`}>
                      <div className="relative h-[60vh] w-full overflow-hidden rounded-xl cursor-pointer" onClick={isVideoThumbnail ? () => setIsVideoDialogOpen(true) : undefined}>
                        <Image
                          src={placeholder.imageUrl}
                          alt={placeholder.description}
                          fill
                          className="object-cover"
                          data-ai-hint={placeholder.imageHint}
                          priority
                        />
                         {isVideoThumbnail && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <PlayCircle className="h-20 w-20 text-white/80" />
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            </Carousel>
        </section>
        
         {/* --- Carousel Dots --- */}
        <div className="flex justify-center gap-2 py-4">
            {carouselItems.map((_, index) => (
                <button
                    key={index}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={cn(
                        "h-2 w-2 rounded-full bg-muted transition-all",
                        currentSlide === index ? "w-4 bg-primary" : "hover:bg-muted-foreground"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>

        {/* --- Main Content & Booking --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
            <div className="lg:col-span-2 space-y-12">
                
                <section id="overview" className="scroll-mt-24">
                    <h2 className="text-3xl font-bold">About this Experience</h2>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                        <StatItem icon={<Clock className="h-6 w-6"/>} label="Duration" value={experience.duration} />
                        <StatItem icon={<TrendingUp className="h-6 w-6"/>} label="Difficulty" value={experience.difficulty} />
                        <StatItem icon={<ShieldCheck className="h-6 w-6"/>} label="Safety" value="Verified" />
                    </div>
                     <p className="text-muted-foreground text-lg leading-relaxed">{experience.description}</p>
                     <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">What's Included</h3>
                            <div className="space-y-3">
                                {experience.inclusions.map(item => (
                                <div key={item} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                                    <span className="text-muted-foreground">{item}</span>
                                </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">What's Not Included</h3>
                            <div className="space-y-3">
                                {experience.exclusions.map(item => (
                                <div key={item} className="flex items-start gap-3">
                                    <X className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                                    <span className="text-muted-foreground">{item}</span>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                
                <Separator />
                
                {(experience.pickupPoints && experience.pickupPoints.length > 0) && (
                  <section id="logistics" className="space-y-8 scroll-mt-24">
                      <LogisticsCard title="Meeting & Reporting Point" points={experience.pickupPoints} />
                  </section>
                )}

                <Separator />


                {experience.highlights && experience.highlights.length > 0 && (
                    <section id="highlights">
                         <h2 className="text-3xl font-bold mb-6">Highlights</h2>
                         <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {experience.highlights.map(item => (
                            <li key={item} className="flex items-start gap-3">
                                <Star className="h-5 w-5 text-primary mt-1 shrink-0" />
                                <span className="text-muted-foreground text-lg">{item}</span>
                            </li>
                            ))}
                        </ul>
                    </section>
                )}
                
                <Separator/>
            
                {/* --- Reviews Section --- */}
                <section id="reviews" className="space-y-8 scroll-mt-24">
                    <h2 className="text-3xl font-bold">Reviews</h2>
                    {totalReviews > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {experience.reviews?.map(review => <ReviewCard key={review.id} review={review} />)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Be the first to review this experience!</p>
                    )}
                </section>
                
                <Separator/>

                 {/* --- Policies and FAQs --- */}
                <section id="policies" className="space-y-8 scroll-mt-24">
                    <h2 className="text-3xl font-bold">Good to Know</h2>
                     <div className="grid md:grid-cols-2 gap-8">
                         <Card>
                            <CardHeader><CardTitle>Safety Information</CardTitle></CardHeader>
                            <CardContent className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground">
                                <p>{experience.safetyNotes}</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Cancellation Policy</CardTitle></CardHeader>
                            <CardContent className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground">
                                <p>{experience.cancellationPolicy}</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

            </div>

            {/* --- Right Sticky Column --- */}
             <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Book Your Spot</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label>Select Date</Label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? selectedDate.toLocaleDateString() : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                         <div ref={calendarRef} tabIndex={-1}>
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(date) => {
                                                    setSelectedDate(date);
                                                    setIsCalendarOpen(false);
                                                }}
                                                
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                             </div>
                             <div className="space-y-2">
                                <Label>Select Time Slot</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {experience.availability.timeSlots.map(slot => (
                                        <Button 
                                            key={slot} 
                                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                                            onClick={() => setSelectedTimeSlot(slot)}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                             </div>
                             <div className="space-y-2">
                                    <Label>Number of Participants</Label>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="icon" onClick={() => setParticipants(p => Math.max(1, p - 1))} disabled={participants <= 1}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xl font-bold w-12 text-center">{participants}</span>
                                        <Button variant="outline" size="icon" onClick={() => setParticipants(p => p + 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                             <Separator />
                             <div className="flex justify-between items-center font-bold text-xl">
                                <span>Total Price:</span>
                                <span>₹{(experience.price * participants).toLocaleString('en-IN')}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full" disabled={!selectedDate || !selectedTimeSlot} onClick={() => setIsBookingDialogOpen(true)}>
                                Book Now
                            </Button>
                        </CardFooter>
                    </Card>
                    {isBookingDialogOpen && selectedDate && selectedTimeSlot && (
                         <BookingFormDialog
                            experience={experience}
                            date={selectedDate}
                            timeSlot={selectedTimeSlot}
                            participants={participants}
                            onOpenChange={setIsBookingDialogOpen}
                        />
                    )}
                  <HostedByCard vendor={experience.vendor as Organizer} />
                </div>
            </div>
        </div>
      </div>
    </Dialog>
    </>
  );
}
