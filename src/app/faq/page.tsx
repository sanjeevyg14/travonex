

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useMockData } from "@/hooks/use-mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about booking, payments, refunds, and using the Travonex platform.',
};


export default function GeneralFaqPage() {
    const [searchTerm, setSearchTerm] = useState("");
    // The component now gets its data directly from the global context.
    const { faqs } = useMockData();

    // The filtering logic remains the same, but it now operates on dynamic data.
    const filteredFaqs = useMemo(() => {
        if (!searchTerm) {
            return faqs;
        }
        return faqs.filter(item => 
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, faqs]);

    return (
        <div className="container py-12 max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
                <p className="text-muted-foreground mt-2">Find answers to common questions about booking, payments, and using Travonex.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="text"
                    placeholder="Search by keywords (e.g., 'booking', 'wallet', 'cancellation')..."
                    className="w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <Card>
                <CardContent className="p-6">
                    {filteredFaqs.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {filteredFaqs.map((item, index) => (
                                <AccordionItem key={item.id} value={`item-${index}`}>
                                    <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No results found for "{searchTerm}".</p>
                            <p className="text-sm">Try searching for a different keyword.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
