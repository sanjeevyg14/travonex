
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";


const faqItems = [
    {
        question: "How do payouts work?",
        answer: "We have an automated weekly payout system. For every trip batch that completes within a week (Monday to Sunday), our finance team automatically processes your net earnings on the following Wednesday. You don't need to request a payout. Your net earnings (Total Bookings - Platform Commission) for each batch will be transferred directly to your registered bank account. You can track the status of each batch settlement in your 'Payouts' ledger."
    },
    {
        question: "How can I change my bank account details?",
        answer: "For security reasons, bank account details cannot be changed directly from the dashboard. To update your payout account, please send an email with your new account details to our support team at support@travonex.com from your registered email address. Our team will verify the request and update it for you."
    },
    {
        question: "What is the platform commission rate?",
        answer: "Travonex charges a standard commission fee on the final traveler price for each successful booking. This fee covers payment processing, marketing, and platform maintenance. You can view the current commission rate in your 'Settings' under 'Payout & Commission'."
    },
    {
        question: "How do Leads and Lead Credits work?",
        answer: "When a traveler is interested in your trip and asks a question, it generates a 'Lead'. To view their contact details, you must 'unlock' the lead using one Lead Credit. Credits can be purchased from the 'Credits' page. If a lead you unlocked converts into a confirmed booking, the credit used for that lead will be returned to your account automatically."
    },
    {
        question: "How do I handle traveler cancellations?",
        answer: "Cancellation handling depends on your trip's specific cancellation policy. If a traveler cancels and is not eligible for a full refund based on your policy, the non-refunded portion (after deducting platform commission) is added to your payout balance. This compensates you for the blocked slot."
    },
    {
        question: "How can I edit a trip after it's published?",
        answer: "You can edit any of your trips by navigating to the 'My Trips' page and clicking the 'Edit' button next to the desired trip. You can update details, pricing, dates, and more. Note that significant changes to a published trip may require a brief re-approval from our team."
    },
    {
        question: "What does the 'Pending' status on a new trip mean?",
        answer: "When you create a new trip, it is submitted with a 'Pending' status. This means our team is reviewing it to ensure it meets our quality and safety guidelines. Once approved, its status will change to 'Published' and it will be live on the platform for travelers to book."
    },
    {
        question: "How do I respond to traveler reviews?",
        answer: "Currently, the platform does not support direct public replies to reviews. We recommend reaching out to travelers directly if you wish to discuss their feedback. We are working on adding a review management feature in the future."
    },
    {
        question: "Can I offer custom discounts or coupons?",
        answer: "Yes! You can create custom coupons for your trips from the 'Promotions' tab in your dashboard. You can set them as a fixed amount or a percentage, and control their usage limits and expiry dates."
    },
    {
        question: "What happens if a traveler has a complaint during a trip?",
        answer: "As the trip organizer, you are the first point of contact for any issues that arise during a trip. We encourage you to resolve issues directly with the traveler. For serious disputes, travelers can contact Travonex support, and we will mediate based on our platform policies."
    }
]

export default function OrganizerHelpPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFaqs = useMemo(() => {
        if (!searchTerm) {
            return faqItems;
        }
        return faqItems.filter(item => 
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Organizer Help Center</h1>
                <p className="text-muted-foreground">Find answers to common questions about managing your trips on Travonex.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="text"
                    placeholder="Search by keywords (e.g., 'payout', 'commission', 'leads')..."
                    className="w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredFaqs.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {filteredFaqs.map((item, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
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
