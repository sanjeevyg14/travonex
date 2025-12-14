
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { useToast } from "@/hooks/use-toast";
import type { BlogStory } from "@/lib/types";

// This component now handles both creating and editing a story.
export default function NewStoryPage({ storyToEdit }: { storyToEdit?: BlogStory }) {
    const isEditMode = !!storyToEdit;
    const { user } = useAuth();
    const { addBlogStory, setBlogStories } = useMockData();
    const router = useRouter();
    const { toast } = useToast();

    const [title, setTitle] = useState(storyToEdit?.title || "");
    const [excerpt, setExcerpt] = useState(storyToEdit?.excerpt || "");
    const [content, setContent] = useState(storyToEdit?.content || "");
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: "destructive", title: "You must be logged in to create or edit a story." });
            return;
        }
        if (!title || !excerpt || !content) {
            toast({ variant: "destructive", title: "Please fill out all fields." });
            return;
        }

        if (isEditMode) {
            // Logic for updating an existing story
            const updatedStory: BlogStory = {
                ...storyToEdit,
                title,
                excerpt,
                content,
                // In a real app, you'd handle image updates here
            };
            setBlogStories(prev => prev.map(s => s.id === storyToEdit.id ? updatedStory : s));
            toast({
                title: "Story Updated!",
                description: "Your changes have been saved.",
            });
            router.push("/my-stories");
        } else {
            // Logic for creating a new story
            const newStory: BlogStory = {
                id: `story-${Date.now()}`,
                slug: title.toLowerCase().replace(/\s+/g, '-'),
                title,
                author: user.name,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                image: "blog" + (Math.floor(Math.random() * 3) + 1),
                excerpt,
                content,
            };
            addBlogStory(newStory);
            toast({
                title: "Story Published!",
                description: "Your travel story is now live for the community to see.",
            });
            router.push("/my-stories");
        }
    };

    return (
        <div className="container py-12 max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditMode ? "Edit Your Travel Story" : "Write Your Travel Story"}</CardTitle>
                        <CardDescription>
                            {isEditMode ? "Make changes to your story and save them." : "Share your adventure, tips, and experiences with the Travonex community."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Story Title</Label>
                            <Input id="title" placeholder="e.g., My Unforgettable Trip to the Himalayas" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Short Excerpt</Label>
                            <Textarea id="excerpt" placeholder="A brief, catchy summary of your story to appear on the blog page." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required rows={2} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Your Full Story</Label>
                            <Textarea id="content" placeholder="Tell us all about your journey..." value={content} onChange={(e) => setContent(e.target.value)} required rows={10} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cover-image">Cover Image</Label>
                            <Input id="cover-image" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />
                            <p className="text-xs text-muted-foreground">Upload a beautiful cover image for your story. Video is not yet supported.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit">{isEditMode ? "Save Changes" : "Publish Story"}</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
