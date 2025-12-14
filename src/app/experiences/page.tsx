
'use client';

import type { Experience, Review } from '@/lib/types';
import { useMockData } from '@/hooks/use-mock-data';
import { useLocation } from '@/hooks/use-location';
import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Activity, Waves, Mountain, Wind, Trees, Building2, SprayCan, UtensilsCrossed, Sparkles, Beer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';


const experienceCategories = [
  { name: 'Water', icon: <Waves className="h-5 w-5" /> },
  { name: 'Adventure', icon: <Mountain className="h-5 w-5" /> },
  { name: 'Aerial', icon: <Wind className="h-5 w-5" /> },
  { name: 'Nature', icon: <Trees className="h-5 w-5" /> },
  { name: 'Local Tours', icon: <Building2 className="h-5 w-5" /> },
  { name: 'Workshops', icon: <SprayCan className="h-5 w-5" /> },
  { name: 'Food & Drink', icon: <UtensilsCrossed className="h-5 w-5" /> },
  { name: 'Wellness', icon: <Sparkles className="h-5 w-5" /> },
  { name: 'Entertainment', icon: <Beer className="h-5 w-5" /> },
] as const;


function ExperienceCard({ experience }: { experience: Experience }) {
    const placeholder = PlaceHolderImages.find(p => p.id === experience.images[0]);

    const { totalReviews, averageRating } = useMemo(() => {
        const reviews = experience.reviews || [];
        const total = reviews.length;
        if (total === 0) {
            return { totalReviews: 0, averageRating: 0 };
        }
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        const avg = sum / total;
        return { totalReviews: total, averageRating: parseFloat(avg.toFixed(1)) };
    }, [experience.reviews]);

    const categoryIcon = experienceCategories.find(c => c.name === experience.category)?.icon || <Activity className="h-4 w-4" />;

    return (
        <Link href={`/experiences/${experience.slug}`} className="group block">
            <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                <CardHeader className="p-0">
                    <div className="relative h-52 w-full">
                        {placeholder && (
                            <Image
                                src={placeholder.imageUrl}
                                alt={placeholder.description}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={placeholder.imageHint}
                            />
                        )}
                         <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                                {categoryIcon}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2 flex-grow">
                    <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary">
                        {experience.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {experience.location}
                    </p>
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center bg-muted/50 border-t">
                    <div>
                         <p className="text-sm text-muted-foreground">Starts from</p>
                         <p className="text-lg font-bold">₹{experience.price.toLocaleString('en-IN')}</p>
                    </div>
                    {totalReviews > 0 ? (
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{averageRating}</span>
                            <span className="text-muted-foreground">({totalReviews})</span>
                        </div>
                    ) : (
                        <Badge variant="outline">New</Badge>
                    )}
                </CardFooter>
                 <div className="h-1 bg-primary w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
        </Link>
    );
}

export default function ExperiencesHubPage() {
    const { experiences, travelCities } = useMockData();
    const { selectedCity: autoDetectedCity } = useLocation();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState(autoDetectedCity || 'all');
    const [category, setCategory] = useState<'all' | Experience['category']>('all');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredExperiences = useMemo(() => {
        if (!experiences) return [];
        return experiences.filter(exp => {
            const matchesSearch = !searchTerm || exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || exp.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = location === 'all' || exp.location === location;
            const matchesCategory = category === 'all' || exp.category === category;
            return matchesSearch && matchesLocation && matchesCategory;
        });
    }, [experiences, searchTerm, location, category]);

    const topNearYou = useMemo(() => {
        if (!autoDetectedCity || !experiences) return [];
        return experiences.filter(exp => exp.location === autoDetectedCity).slice(0, 5);
    }, [experiences, autoDetectedCity]);

    const popularThisWeek = useMemo(() => {
        if (!experiences) return [];
        return [...experiences].sort((a,b) => (b.reviews?.length || 0) - (a.reviews?.length || 0)).slice(0, 5);
    }, [experiences]);
    
    return (
        <div className="container py-12 space-y-12">
            <section className="text-center max-w-2xl mx-auto space-y-4">
                 <h1 className="text-4xl font-bold tracking-tight">Discover Experiences</h1>
                <p className="text-xl text-muted-foreground">
                    Book unique activities, adventures, and local tours instantly.
                </p>
                <div className="flex w-full items-center space-x-2 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search for activities or locations..."
                            className="w-full pl-10 h-12"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="w-[180px] h-12">
                            <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {travelCities.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </section>
            
            <section>
                <div className="flex justify-center flex-wrap gap-2">
                    <Button variant={category === 'all' ? 'default' : 'outline'} onClick={() => setCategory('all')}>All</Button>
                    {experienceCategories.map(cat => (
                         <Button key={cat.name} variant={category === cat.name ? 'default' : 'outline'} onClick={() => setCategory(cat.name)}>
                             {cat.icon}
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </section>
            
            {isClient && topNearYou.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-6">Top Near You in {autoDetectedCity}</h2>
                    <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent>
                            {topNearYou.map(exp => (
                                <CarouselItem key={exp.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"><ExperienceCard experience={exp} /></CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                    </Carousel>
                </section>
            )}

            {isClient && popularThisWeek.length > 0 ? (
                 <section>
                    <h2 className="text-2xl font-bold mb-6">Popular This Week</h2>
                     <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent>
                            {popularThisWeek.map(exp => (
                                <CarouselItem key={exp.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"><ExperienceCard experience={exp} /></CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                    </Carousel>
                </section>
            ) : !isClient ? (
                 <section>
                    <h2 className="text-2xl font-bold mb-6">Popular This Week</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-52 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </section>
            ): null }

            <section>
                <h2 className="text-2xl font-bold mb-6">All Experiences</h2>
                 {filteredExperiences.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredExperiences.map(exp => (
                            <ExperienceCard key={exp.id} experience={exp} />
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">No Experiences Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                 )}
            </section>
        </div>
    );
}
