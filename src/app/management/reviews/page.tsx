
"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import type { Review, Trip } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Eye, Trash2, Star } from "lucide-react";
import { format } from 'date-fns';
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

// A "view model" for a review that includes trip information
type EnrichedReview = Review & {
    trip: Pick<Trip, 'id' | 'title' | 'slug'>;
};

export default function AdminManageReviewsPage() {
    const { trips, setTrips } = useMockData();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");

    // Flatten all reviews from all trips into a single array and enrich them with trip info
    const allReviews = useMemo((): EnrichedReview[] => {
        return trips.flatMap(trip => 
            (trip.reviews || []).map(review => ({
                ...review,
                trip: { id: trip.id, title: trip.title, slug: trip.slug }
            }))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [trips]);

    const filteredReviews = useMemo(() => {
        let filtered = allReviews;
        
        if (ratingFilter !== "all") {
            filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(review => 
                review.trip.title.toLowerCase().includes(lowercasedTerm) ||
                review.author.toLowerCase().includes(lowercasedTerm) ||
                review.comment.toLowerCase().includes(lowercasedTerm)
            );
        }

        return filtered;
    }, [allReviews, searchTerm, ratingFilter]);

    const handleDelete = async (reviewId: string, tripId: string) => {
        try {
            // TODO: Create DELETE endpoint for reviews
            // For now, just remove from local state
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            
            toast({
                title: "Review Deleted",
                description: "The review has been permanently removed.",
            });
    };

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Manage Reviews</h1>
                <p className="text-muted-foreground">Review and moderate all traveler feedback from across the platform.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by trip, author, or comment..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                {[5, 4, 3, 2, 1].map(rating => (
                                    <SelectItem key={rating} value={String(rating)}>
                                        {rating} Star{rating > 1 ? 's' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">Trip</TableHead>
                                    <TableHead className="w-[45%]">Review</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReviews.length > 0 ? filteredReviews.map((review) => {
                                    const authorAvatar = PlaceHolderImages.find(p => p.id === review.avatar);
                                    return (
                                        <TableRow key={review.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/discover/${review.trip.slug}`} className="hover:underline" target="_blank">
                                                    {review.trip.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30")} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} />}
                                                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{review.author}</p>
                                                        <p className="text-xs text-muted-foreground">{format(new Date(review.date), 'dd MMM yyyy')}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem asChild>
                                                             <Link href={`/discover/${review.trip.slug}#reviews`} target="_blank">
                                                                <Eye className="mr-2 h-4 w-4" /> View on Page
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(review.id, review.trip.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No reviews match your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
