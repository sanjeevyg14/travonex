
"use client";

import { BlogCard } from "@/components/blog-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import Link from "next/link";
import { useMockData } from "@/hooks/use-mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useMemo } from "react";
import { BlogStory } from "@/lib/types";

// A new card component that includes an Edit button
function MyStoryCard({ story }: { story: BlogStory }) {
    return (
        <Card className="flex flex-col">
            <div className="flex-grow">
                 <BlogCard story={story} />
            </div>
            <CardFooter className="p-2 border-t">
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/my-stories/edit/${story.slug}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Story
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function MyStoriesPage() {
    const { blogStories } = useMockData();
    const { user } = useAuth();

    const userStories = useMemo(() => {
        if (!user) return [];
        return blogStories.filter(story => story.author === user.name);
    }, [blogStories, user]);

    if (!user) {
        return (
             <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Please Log In</h1>
                <p className="text-muted-foreground mt-2">You need to be logged in to view your stories.</p>
                <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
            </div>
        )
    }

    return (
        <div className="container py-12 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">My Stories</h1>
                    <p className="text-muted-foreground">Share your travel experiences with the community.</p>
                </div>
                <Button asChild>
                    <Link href="/blog/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Write a New Story
                    </Link>
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Your Published Stories</CardTitle>
                    <CardDescription>A collection of your adventures shared on Travonex.</CardDescription>
                </CardHeader>
                <CardContent>
                    {userStories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userStories.map(story => (
                                <MyStoryCard key={story.id} story={story} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold">You haven't written any stories yet.</h3>
                            <p className="text-muted-foreground mt-2">Why not share your last adventure?</p>
                            <Button asChild className="mt-4">
                                <Link href="/blog/new">Write Your First Story</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
