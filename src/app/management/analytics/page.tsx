
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { promises as fs } from 'fs';
import path from 'path';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

async function getMarkdownContent() {
  const filePath = path.join(process.cwd(), 'docs', 'analytics-guide.md');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const htmlContent = micromark(fileContents, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()]
    });
    return htmlContent;
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return "<p>Error: Could not load the Analytics setup guide.</p>";
  }
}

export default async function AnalyticsGuidePage() {
  const content = await getMarkdownContent();

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Analytics & User Tracking Guide</h1>
            <p className="text-muted-foreground">Technical documentation for setting up and using analytics.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Google Analytics & GTM Setup</CardTitle>
                <CardDescription>
                    This guide provides instructions for setting up analytics to track funnels and individual user behavior.
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
