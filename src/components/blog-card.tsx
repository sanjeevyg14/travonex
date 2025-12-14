
import type { BlogStory } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  story: BlogStory;
  orientation?: "vertical" | "horizontal";
}

export function BlogCard({ story, orientation = "vertical" }: BlogCardProps) {
  const placeholder = PlaceHolderImages.find((p) => p.id === story.image);
  
  if (orientation === "horizontal") {
    return (
       <Link href={`/blog/${story.slug}`} className="group block">
         <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-muted/50 h-full flex flex-col md:flex-row">
           <CardHeader className="p-0 w-full md:w-2/5">
             <div className="relative aspect-video md:aspect-square h-full w-full">
               {placeholder && (
                 <Image
                   src={placeholder.imageUrl}
                   alt={placeholder.description}
                   fill
                   className="object-cover transition-transform duration-300 group-hover:scale-105"
                   data-ai-hint={placeholder.imageHint}
                 />
               )}
             </div>
           </CardHeader>
           <div className="flex flex-col flex-1">
            <CardContent className="p-4 md:p-6 space-y-3 flex-grow">
              <CardTitle className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary">
                {story.title}
              </CardTitle>
              <p className="text-muted-foreground line-clamp-3">{story.excerpt}</p>
            </CardContent>
            <CardFooter className="p-4 md:p-6 pt-0 flex justify-between items-center text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{story.date}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                Read Story
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </CardFooter>
           </div>
         </Card>
      </Link>
    );
  }

  // Default vertical card
  return (
    <Link href={`/blog/${story.slug}`} className="group block">
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
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2 flex-grow">
          <CardTitle className="text-lg md:text-xl font-semibold leading-tight group-hover:text-primary">
            {story.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center text-sm">
           <div className="text-muted-foreground">
            <span>By {story.author}</span>
          </div>
          <div className="flex items-center gap-1 text-primary font-medium">
            Read More
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
