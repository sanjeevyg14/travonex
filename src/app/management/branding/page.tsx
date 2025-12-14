import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colorPalette = [
    { name: "Primary", hex: "#FF6300", className: "bg-primary" },
    { name: "Accent", hex: "#FFF2E6", className: "bg-accent" },
    { name: "Foreground", hex: "#1F1F1F", className: "bg-foreground" },
    { name: "Background", hex: "#FAFAFA", className: "bg-background border" },
    { name: "Card", hex: "#FFFFFF", className: "bg-card border" },
];

const typography = {
    headers: { family: "Poppins", weight: "Bold" },
    body: { family: "Poppins", weight: "Regular" },
}

export default function BrandingPage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Brand Guidelines</h1>
            <p className="text-muted-foreground">A central place for all of Travonex's branding assets and guidelines.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {colorPalette.map((color) => (
                    <div key={color.name}>
                        <div className={`h-24 w-full rounded-lg ${color.className} shadow-inner`}></div>
                        <h3 className="mt-2 font-semibold">{color.name}</h3>
                        <p className="text-sm text-muted-foreground">{color.hex}</p>
                    </div>
                ))}
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Headings (Poppins)</h3>
                    <div className="space-y-2 p-4 bg-muted rounded-lg">
                        <h1 className="text-4xl font-bold">Display Heading One</h1>
                        <h2 className="text-2xl font-semibold">Subheading Two</h2>
                        <h3 className="text-xl font-medium">Section Header Three</h3>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Body Text (Poppins)</h3>
                    <div className="space-y-2 p-4 bg-muted rounded-lg text-foreground/80">
                       <p>This is standard body text. It is clean, readable, and used for most paragraphs and descriptions throughout the application to ensure a smooth reading experience for all our users.</p>
                       <p className="text-sm text-muted-foreground">This is smaller, secondary text, often used for captions or less important details.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
