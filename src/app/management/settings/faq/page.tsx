
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockData } from "@/hooks/use-mock-data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { FAQ } from "@/lib/types";

function FaqDialog({
  faq,
  onSave,
  children,
}: {
  faq?: FAQ | null;
  onSave: (faqData: Omit<FAQ, 'id'>) => void;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");

  const handleSave = () => {
    if (question && answer) {
      onSave({ question, answer });
      setIsOpen(false);
      // Reset form if it was for a new FAQ
      if (!faq) {
        setQuestion("");
        setAnswer("");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{faq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
          <DialogDescription>
            {faq ? "Make changes to this FAQ." : "Add a new question and answer to the platform's FAQ page."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How does the booking process work?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a clear and concise answer..."
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save FAQ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ManageFaqsPage() {
  const { faqs, setFaqs } = useMockData();
  const { toast } = useToast();

  const handleAddFaq = (faqData: Omit<FAQ, 'id'>) => {
    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      ...faqData,
    };
    setFaqs((prev) => [...prev, newFaq]);
    toast({ title: "FAQ Added", description: "The new FAQ is now live on the platform." });
  };

  const handleUpdateFaq = (faqId: string, faqData: Omit<FAQ, 'id'>) => {
    setFaqs((prev) =>
      prev.map((faq) => (faq.id === faqId ? { ...faq, ...faqData } : faq))
    );
    toast({ title: "FAQ Updated", description: "Your changes have been saved." });
  };

  const handleDeleteFaq = (faqId: string) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== faqId));
    toast({ variant: "destructive", title: "FAQ Deleted" });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Manage Platform FAQs</h1>
            <p className="text-muted-foreground">Add, edit, or remove questions from the main traveler-facing FAQ page.</p>
          </div>
          <FaqDialog onSave={handleAddFaq}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add New FAQ
            </Button>
          </FaqDialog>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Current FAQs</CardTitle>
            <CardDescription>This is the list of questions that appear on the /faq page for travelers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {faqs.map(faq => (
                <Card key={faq.id} className="p-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                           <h3 className="font-semibold">{faq.question}</h3>
                           <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                        <div className="flex gap-2">
                            <FaqDialog faq={faq} onSave={(data) => handleUpdateFaq(faq.id, data)}>
                                <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </FaqDialog>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteFaq(faq.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
            {faqs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No FAQs have been added yet.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
