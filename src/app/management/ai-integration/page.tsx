
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { promises as fs } from 'fs';
import path from 'path';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

async function getMarkdownContent() {
  // Construct the full path to the new markdown file
  const filePath = path.join(process.cwd(), 'docs', 'ai-integration-guide.md');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const htmlContent = micromark(fileContents, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()]
    });
    return htmlContent;
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return "<p>Error: Could not load the AI integration guide.</p>";
  }
}

export default async function AiIntegrationPage() {
  const content = await getMarkdownContent();

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">AI Integration Guide</h1>
            <p className="text-muted-foreground">Technical documentation for setting up and managing the Genkit AI backend.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Genkit Architecture & Local Setup</CardTitle>
                <CardDescription>
                    This guide provides an overview of the Genkit framework and instructions for running the AI services locally.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:p-1 prose-code:rounded-sm"
                    dangerouslySetInnerHTML={{ __html: content }} 
                />
            </CardContent>
        </Card>
    </div>
  );
}
