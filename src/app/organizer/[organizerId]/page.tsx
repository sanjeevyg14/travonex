
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, MapPin } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import { Card, CardContent } from "@/components/ui/card";
import { initialOrganizers, initialTrips } from "@/lib/data";

// This is now a Server Component. The 'use client' directive has been removed.

// This function tells Next.js which organizer pages to build at build time.
export async function generateStaticParams() {
  // In a real app, this would fetch all organizer IDs from a database.
  // For the mock, we get them from our initial data.
  return Object.keys(initialOrganizers).map(organizerId => ({
    organizerId: organizerId,
  }));
}

// This function fetches the data for a specific organizer page.
// Because this is a Server Component, we can't use hooks directly here.
// We will pass the data as props to a client component or render directly.
async function getOrganizerData(organizerId: string) {
    // In a real app, this would be a database call.
    // For this mock, we simulate data fetching.
    const organizer = initialOrganizers[organizerId as keyof typeof initialOrganizers];
    if (!organizer) {
        return { organizer: null, organizerTrips: [] };
    }
    const organizerTrips = initialTrips.filter(trip => trip.organizer.id === organizerId && trip.status === 'published');
    return { organizer, organizerTrips };
}


export default async function OrganizerProfilePage({ params }: { params: { organizerId: string } }) {
    const { organizerId } = params;
    const { organizer, organizerTrips } = await getOrganizerData(organizerId);

    if (!organizer) {
        notFound();
    }

    const organizerAvatar = PlaceHolderImages.find((p) => p.id === organizer.avatar);
    const coverImage = PlaceHolderImages.find(p => p.id === 'hero2');

    return (
        <div className="flex flex-col">
            <section className="relative h-48 md:h-64 w-full bg-muted">
                 {coverImage && (
                    <Image
                        src={coverImage.imageUrl}
                        alt="Organizer cover image"
                        fill
                        className="object-cover"
                        data-ai-hint="landscape abstract"
                    />
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50" />
            </section>
            
            <div className="container -mt-16 md:-mt-24 pb-12">
                <div className="flex flex-col md:flex-row items-end gap-6 mb-8 relative z-10">
                    <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-background">
                        {organizerAvatar && <AvatarImage src={organizerAvatar.imageUrl} alt={organizer.name} />}
                        <AvatarFallback className="text-5xl">{organizer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="pb-4">
                        <div className="flex items-center gap-2">
                             <h1 className="text-3xl md:text-4xl font-bold text-card-foreground md:text-white md:drop-shadow-lg">{organizer.name}</h1>
                            {organizer.isVerified && (
                                <ShieldCheck className="h-7 w-7 text-green-500" />
                            )}
                        </div>
                        <p className="text-muted-foreground md:text-white/90">Verified Organizer</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-4">About {organizer.name}</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {organizer.bio || 'This organizer has not yet provided a bio.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="space-y-4">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-2">Based in</h3>
                                <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4"/> Bangalore, India</p>
                            </CardContent>
                        </Card>
                     </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-6">Trips by {organizer.name}</h2>
                     {organizerTrips.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organizerTrips.map(trip => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">{organizer.name} has no trips listed at the moment.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
