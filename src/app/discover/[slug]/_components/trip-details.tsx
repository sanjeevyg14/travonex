

"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useMockData } from "@/hooks/use-mock-data";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, UserCheck, Check, X, Users, TrendingUp, Heart, HelpCircle, MessageSquare, ShieldCheck, ExternalLink, Instagram, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { AdminActionBar } from "./admin-action-bar";
import { BookingSummaryCard } from "./booking-summary-card";
import { Progress } from "@/components/ui/progress";
import type { Review, Trip, Lead, Organizer, LogisticsPoint } from "@/lib/types";
import { IntegratedBookingCard } from "./integrated-booking-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";


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

const StatItem = ({ icon, value }: { icon: React.ReactNode, value: string | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span className="font-medium">{value}</span>
        </div>
    );
};

const HostedByCard = ({ organizer }: { organizer: Organizer }) => {
    const organizerAvatar = PlaceHolderImages.find((p) => p.id === organizer.avatar);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hosted by</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    {organizerAvatar && <AvatarImage src={organizerAvatar.imageUrl} alt={organizer.name} />}
                    <AvatarFallback>{organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                    <h3 className="text-xl font-bold">{organizer.name}</h3>
                    {organizer.isVerified && (
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                            <ShieldCheck className="h-5 w-5" />
                            <span>Verified Organizer</span>
                        </div>
                    )}
                </div>
                 <div className="flex items-center gap-2">
                    {organizer.websiteUrl && (
                        <a href={organizer.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon">
                                <ExternalLink className="h-5 w-5" />
                            </Button>
                        </a>
                    )}
                    {organizer.instagramUrl && (
                        <a href={organizer.instagramUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon">
                                <Instagram className="h-5 w-5" />
                            </Button>
                        </a>
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
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {points.map((point) => (
                    <div key={point.location} className="flex justify-between items-center text-sm">
                        <div>
                            <p className="font-semibold">{point.location}</p>
                            <p className="text-muted-foreground">Time: {point.time}</p>
                        </div>
                         <Button variant="outline" size="sm" asChild>
                            <a href={point.mapLink} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4" />
                                View Map
                            </a>
                        </Button>
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
                    <DialogTitle className="sr-only">Trip Video Player</DialogTitle>
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

export default function TripDetails({ trip, slug }: { trip: Trip, slug: string }) {
  const { savedTrips, toggleSaveTrip, bookings, addLead } = useMockData();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // State for reviews section
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
  
  const userBooking = user ? bookings.find(b => b.tripId === trip?.id && b.travelerPhone === user.phone) : undefined;
  
  const { totalReviews, averageRating, ratingDistribution } = useMemo(() => {
    const reviews = trip?.reviews || [];
    const total = reviews.length;
    if (total === 0) {
      return { totalReviews: 0, averageRating: 0, ratingDistribution: [] };
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / total;
    const distribution = [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(r => r.rating === star).length;
      return { star, count, percentage: (count / total) * 100 };
    });
    return { totalReviews: total, averageRating: parseFloat(avg.toFixed(1)), ratingDistribution: distribution };
  }, [trip?.reviews]);

  const filteredReviews = useMemo(() => {
    if (!trip?.reviews) return [];
    return trip.reviews.filter(review => {
      const matchesRating = selectedRating === null || review.rating === selectedRating;
      const matchesTag = selectedTag === null || review.comment.toLowerCase().includes(selectedTag.toLowerCase());
      return matchesRating && matchesTag;
    });
  }, [trip?.reviews, selectedRating, selectedTag]);

  const displayedReviews = useMemo(() => {
      return showAllReviews ? filteredReviews : filteredReviews.slice(0, 4);
  }, [filteredReviews, showAllReviews]);
  
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

  if (!trip) {
    notFound();
  }
  
  const isSaved = savedTrips.includes(trip.id);
  const showAdminBar = user?.role === 'admin' && trip.status === 'pending';
  
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveTrip(trip.id);
  }

  const handleRatingFilterClick = (rating: number | null) => {
    setSelectedRating(rating);
    if (!showAllReviews) setShowAllReviews(true);
  }
  
  const handleTagFilterClick = (tag: string | null) => {
      setSelectedTag(tag);
      if (!showAllReviews) setShowAllReviews(true);
  }

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return; // Should not happen if form is visible

    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      tripId: trip.id,
      tripTitle: trip.title,
      organizerId: trip.organizer.id,
      travelerId: user.id,
      travelerName: user.name,
      travelerPhone: user.phone,
      message,
      date: new Date().toISOString(),
      status: 'new',
    };

    addLead(newLead);
  }
  
  const hasVideo = !!trip.videoUrl;
  const galleryImages = [trip.image, ...(trip.gallery || [])].slice(0, 5);

  const carouselItems = hasVideo ? [trip.image, ...galleryImages] : galleryImages;

  return (
    <>
      {showAdminBar && <AdminActionBar trip={trip} />}
      {hasVideo && <VideoPlayerDialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen} videoUrl={trip.videoUrl!} />}
      <div className="container py-12">

        {/* --- Header Section --- */}
        <section className="mb-8">
          <Badge variant="secondary" className="mb-2">{trip.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">{trip.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
             <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-5 w-5"/> {trip.location}</div>
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
                          priority={index === 0}
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
             <div className="absolute top-4 right-4 z-10">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-12 w-12 shrink-0 bg-background/70 hover:bg-background"
                onClick={handleSaveClick}
              >
                <Heart className={cn("h-6 w-6 text-primary transition-colors", isSaved ? 'fill-primary' : 'fill-transparent')} />
              </Button>
            </div>
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
                
                {/* --- About Section --- */}
                <section id="overview" className="scroll-mt-24">
                  <h2 className="text-3xl font-bold">About this trip</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6 text-lg">
                      <StatItem icon={<Clock />} value={trip.duration} />
                      <StatItem icon={<TrendingUp />} value={trip.difficulty || null} />
                      <StatItem icon={<Users />} value={trip.minAge && trip.maxAge ? `${trip.minAge}-${trip.maxAge} yrs` : null} />
                  </div>
                  
                  <p className="text-muted-foreground text-lg leading-relaxed">{trip.description}</p>
                  
                  {trip.highlights && trip.highlights.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-4">Highlights</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {trip.highlights.map(item => (
                          <li key={item} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                   <div className="grid md:grid-cols-2 gap-8 mt-8">
                      <div>
                          <h3 className="text-xl font-bold mb-4">What's Included</h3>
                          <div className="space-y-3">
                            {trip.inclusions.map(item => (
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
                            {trip.exclusions.map(item => (
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

                 {/* --- Location & Logistics Section --- */}
                {(trip.pickupPoints && trip.pickupPoints.length > 0) && (
                  <section id="logistics" className="space-y-8 scroll-mt-24">
                      <h2 className="text-3xl font-bold">Location &amp; Logistics</h2>
                      <div className="grid md:grid-cols-2 gap-8">
                          <LogisticsCard title="Pickup Points" points={trip.pickupPoints} />
                          <LogisticsCard title="Drop-off Points" points={trip.dropoffPoints} />
                      </div>
                  </section>
                )}

                <Separator />

                {/* --- Itinerary Section --- */}
                <section id="itinerary" className="space-y-8 scroll-mt-24">
                  <h2 className="text-3xl font-bold">Day-by-Day Itinerary</h2>
                  <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                    {trip.itinerary.map((item, index) => (
                      <AccordionItem value={`item-${index}`} key={item.day}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-4 text-lg">
                            <div className="bg-primary/10 text-primary h-12 w-12 flex items-center justify-center rounded-full font-bold shrink-0">
                              {item.day}
                            </div>
                            <div className="text-left font-bold">
                              Day {item.day}: {item.title}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-16 text-muted-foreground text-base">
                          {item.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
                
                <Separator />
            
                {/* --- Reviews Section --- */}
                <section id="reviews" className="space-y-8 scroll-mt-24">
                    <h2 className="text-3xl font-bold">Traveler Reviews</h2>
                    {totalReviews > 0 ? (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
                                    <div className="text-center shrink-0">
                                        <p className="text-5xl font-bold text-primary">{averageRating}</p>
                                        <div className="flex justify-center items-center gap-1">
                                            {Array(5).fill(0).map((_, i) => <Star key={i} className={cn("h-5 w-5", i < Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20")} />)}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">Based on {totalReviews} reviews</p>
                                    </div>
                                    <div className="w-full flex-1">
                                        <h3 className="font-semibold mb-2">Rating Distribution</h3>
                                        <div className="space-y-2">
                                            {ratingDistribution.map(({ star, count, percentage }) => (
                                                <div key={star} className="flex items-center gap-2 cursor-pointer" onClick={() => handleRatingFilterClick(star)}>
                                                    <span className="text-xs text-muted-foreground w-12">{star} star{star > 1 ? 's' : ''}</span>
                                                    <Progress value={percentage} className="h-2 flex-1" />
                                                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {trip.reviewTags && (
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">What travelers are talking about</h3>
                                    <div className="flex flex-wrap gap-2">
                                      {trip.reviewTags.map(tag => (
                                        <Badge key={tag.tag} variant={selectedTag === tag.tag ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => handleTagFilterClick(tag.tag === selectedTag ? null : tag.tag)}>
                                          {tag.tag} ({tag.count})
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <Separator/>

                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold">
                                        {selectedRating ? `Showing ${selectedRating}-star reviews` : (selectedTag ? `Showing reviews mentioning "${selectedTag}"` : 'Recent Reviews')}
                                    </h3>
                                    {(selectedRating || selectedTag) && <Button variant="ghost" size="sm" onClick={() => {setSelectedRating(null); setSelectedTag(null)}}>Clear Filters</Button>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {displayedReviews.map(review => <ReviewCard key={review.id} review={review} />)}
                                </div>

                                {!showAllReviews && filteredReviews.length > 4 && (
                                    <div className="text-center pt-4">
                                        <Button variant="outline" onClick={() => setShowAllReviews(true)}>Show All {filteredReviews.length} Reviews</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent className="space-y-2">
                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="text-xl font-semibold">Be the First to Review!</h3>
                                <p className="text-muted-foreground">No reviews have been left for this trip yet. Book now and share your experience!</p>
                            </CardContent>
                        </Card>
                    )}
                </section>
                
                <Separator/>

                {/* --- Policies and FAQs --- */}
                <section id="policies" className="space-y-8 scroll-mt-24">
                  <h2 className="text-3xl font-bold">Policies &amp; FAQs</h2>
                  {trip.cancellationPolicy && (
                      <Card>
                        <CardHeader><CardTitle>Cancellation Policy</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground">
                            <p>{trip.cancellationPolicy}</p>
                        </CardContent>
                      </Card>
                    )}
                    {trip.faqs && trip.faqs.length > 0 && (
                      <Card>
                        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible>
                            {trip.faqs.map((faq, index) => (
                              <AccordionItem value={`faq-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    )}
                </section>
            </div>

            {/* --- Right Sticky Column --- */}
             <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {userBooking ? (
                    <BookingSummaryCard booking={userBooking} />
                  ) : (
                    <IntegratedBookingCard trip={trip} />
                  )}
                  <HostedByCard organizer={trip.organizer} />
                  <Card>
                    <CardHeader>
                      <CardTitle>Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Have questions? Contact the organizer directly for a quick response.</p>
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" className="w-full" disabled={!user}>
                                  <HelpCircle className="mr-2 h-5 w-5" />
                                  {user ? "Contact Organizer" : "Login to Contact"}
                              </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Contact {trip.organizer.name}</DialogTitle>
                                  <DialogDescription>
                                      Your question will be sent to the organizer and will appear as a "lead" in their dashboard.
                                  </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleSendMessage}>
                                  <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                          <Label htmlFor="name">Your Name</Label>
                                          <Input id="name" name="name" defaultValue={user?.name} required disabled />
                                      </div>
                                      <div className="grid gap-2">
                                          <Label htmlFor="phone">Your WhatsApp Number</Label>
                                          <Input id="phone" name="phone" type="tel" defaultValue={user?.phone} required disabled/>
                                      </div>
                                      <div className="grid gap-2">
                                          <Label htmlFor="message">Your Message</Label>
                                          <Textarea id="message" name="message" placeholder="Ask about itinerary details, inclusions, or any other questions..." required />
                                      </div>
                                  </div>
                                  <DialogFooter>
                                      <DialogClose asChild>
                                          <Button type="submit">Send Message</Button>
                                      </DialogClose>
                                  </DialogFooter>
                              </form>
                          </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
            </div>
        </div>

      </div>
    </>
  );
}
