import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";

export function DesignSystemShowcase() {
  const [theme, setTheme] = React.useState<"nordic" | "technical">("nordic");

  const toggleTheme = () => {
    const newTheme = theme === "nordic" ? "technical" : "nordic";
    setTheme(newTheme);

    if (newTheme === "technical") {
      document.documentElement.setAttribute("data-theme", "technical");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl mb-2 text-foreground tracking-tight">Design System</h1>
            <p className="text-muted-foreground">Component library for Danish salary tools</p>
          </div>
          <Button onClick={toggleTheme} variant="outline">
            Switch to {theme === "nordic" ? "Technical" : "Nordic"} Theme
          </Button>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="elevation">Elevation</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-8">
            <div>
              <h2 className="text-2xl mb-4 text-foreground">Color Palette</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Background" var="--background" />
                <ColorSwatch name="Foreground" var="--foreground" />
                <ColorSwatch name="Card" var="--card" />
                <ColorSwatch name="Primary" var="--primary" />
                <ColorSwatch name="Secondary" var="--secondary" />
                <ColorSwatch name="Muted" var="--muted" />
                <ColorSwatch name="Accent" var="--accent" />
                <ColorSwatch name="Border" var="--border" />
                <ColorSwatch name="Nordic Accent" var="--nordic-accent" />
                <ColorSwatch name="Nordic Light" var="--nordic-accent-light" />
                <ColorSwatch name="Nordic Dark" var="--nordic-accent-dark" />
                <ColorSwatch name="Destructive" var="--destructive" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl mb-4 text-foreground">Chart Colors</h2>
              <div className="grid grid-cols-5 gap-4">
                <ColorSwatch name="Chart 1" var="--chart-1" />
                <ColorSwatch name="Chart 2" var="--chart-2" />
                <ColorSwatch name="Chart 3" var="--chart-3" />
                <ColorSwatch name="Chart 4" var="--chart-4" />
                <ColorSwatch name="Chart 5" var="--chart-5" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-8">
            <div>
              <h2 className="text-2xl mb-4 text-foreground">Typography Scale</h2>
              <div className="space-y-6 bg-card border border-border rounded-[var(--radius-lg)] p-8">
                <div>
                  <h1 className="text-foreground">Heading 1 - Main page titles</h1>
                  <p className="text-xs text-muted-foreground mt-1">Font size: 2xl, Weight: 500</p>
                </div>
                <div>
                  <h2 className="text-foreground">Heading 2 - Section headers</h2>
                  <p className="text-xs text-muted-foreground mt-1">Font size: xl, Weight: 500</p>
                </div>
                <div>
                  <h3 className="text-foreground">Heading 3 - Subsections</h3>
                  <p className="text-xs text-muted-foreground mt-1">Font size: lg, Weight: 500</p>
                </div>
                <div>
                  <h4 className="text-foreground">Heading 4 - Card titles</h4>
                  <p className="text-xs text-muted-foreground mt-1">Font size: base, Weight: 500</p>
                </div>
                <div>
                  <p className="text-foreground">Body text - Regular paragraph text for content and descriptions</p>
                  <p className="text-xs text-muted-foreground mt-1">Font size: base, Weight: 400</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Small text - Helper text and labels</p>
                  <p className="text-xs text-muted-foreground mt-1">Font size: sm, Color: muted-foreground</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="components" className="space-y-8">
            <div>
              <h2 className="text-2xl mb-4 text-foreground">Buttons</h2>
              <div className="flex flex-wrap gap-4 bg-card border border-border rounded-[var(--radius-lg)] p-8">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl mb-4 text-foreground">Form Elements</h2>
              <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 space-y-6">
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="example">Input Field</Label>
                  <Input id="example" placeholder="Enter text..." />
                </div>

                <div className="space-y-2 max-w-md">
                  <Label htmlFor="number">Number Input</Label>
                  <Input id="number" type="number" placeholder="450000" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="toggle" />
                  <Label htmlFor="toggle">Toggle Switch</Label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl mb-4 text-foreground">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Result Card</CardTitle>
                    <CardDescription>Card with description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-foreground">28.450 kr</p>
                    <p className="text-sm text-muted-foreground">pr. måned</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Info Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Simple information card with content
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-[var(--nordic-accent)]">
                  <CardHeader>
                    <CardTitle>Highlighted Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Card with accent border
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-2xl mb-4 text-foreground">Badges & Progress</h2>
              <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Error</Badge>
                </div>

                <div className="space-y-2 max-w-md">
                  <Label>Progress Bar</Label>
                  <Progress value={65} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-8">
            <div>
              <h2 className="text-2xl mb-4 text-foreground">Spacing Scale</h2>
              <div className="space-y-4 bg-card border border-border rounded-[var(--radius-lg)] p-8">
                <SpacingExample size="xs" value="0.5rem" />
                <SpacingExample size="sm" value="0.75rem" />
                <SpacingExample size="md" value="1rem" />
                <SpacingExample size="lg" value="1.5rem" />
                <SpacingExample size="xl" value="2rem" />
                <SpacingExample size="2xl" value="3rem" />
                <SpacingExample size="3xl" value="4rem" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl mb-4 text-foreground">Border Radius</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RadiusExample size="sm" value="0.375rem / 0.5rem" />
                <RadiusExample size="md" value="0.5rem / 0.625rem" />
                <RadiusExample size="lg" value="0.75rem / 0.875rem" />
                <RadiusExample size="xl" value="1rem / 1.125rem" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="elevation" className="space-y-8">
            <div>
              <h2 className="text-2xl mb-4 text-foreground">Shadow Scale</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]">
                  <h4 className="mb-2 text-foreground">Shadow SM</h4>
                  <p className="text-xs text-muted-foreground">Subtle depth for hover states</p>
                </div>
                <div className="bg-card rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-md)]">
                  <h4 className="mb-2 text-foreground">Shadow MD</h4>
                  <p className="text-xs text-muted-foreground">Standard card elevation</p>
                </div>
                <div className="bg-card rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-lg)]">
                  <h4 className="mb-2 text-foreground">Shadow LG</h4>
                  <p className="text-xs text-muted-foreground">Prominent elements</p>
                </div>
                <div className="bg-card rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xl)]">
                  <h4 className="mb-2 text-foreground">Shadow XL</h4>
                  <p className="text-xs text-muted-foreground">Modals and overlays</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Theme Comparison */}
        <div className="mt-12 p-8 border-t border-border">
          <h2 className="text-2xl mb-6 text-foreground">Current Theme: {theme === "nordic" ? "Nordic Minimal Utility" : "Modern Technical Calm"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="mb-3 text-foreground">Nordic Minimal Utility</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Cool gray palette with muted blue accent (#5B7A9E)</li>
                <li>• Slightly tighter corner radius (0.5rem)</li>
                <li>• Crisp, clean shadows with low opacity</li>
                <li>• Airy spacing and generous whitespace</li>
                <li>• Government utility aesthetic</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="mb-3 text-foreground">Modern Technical Calm</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Warm gray palette with sage green accent (#6B8F71)</li>
                <li>• Softer corner radius (0.625rem)</li>
                <li>• Warmer shadows with subtle depth</li>
                <li>• Refined spacing with subtle technical feel</li>
                <li>• Contemporary professional aesthetic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({ name, var: cssVar }: { name: string; var: string }) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar);

  return (
    <div className="space-y-2">
      <div
        className="h-20 rounded-[var(--radius-md)] border border-border"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className="text-sm text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
      </div>
    </div>
  );
}

function SpacingExample({ size, value }: { size: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm text-muted-foreground">{size}</div>
      <div
        className="h-8 bg-[var(--nordic-accent)]"
        style={{ width: value }}
      />
      <div className="text-xs text-muted-foreground font-mono">{value}</div>
    </div>
  );
}

function RadiusExample({ size, value }: { size: string; value: string }) {
  return (
    <div className="space-y-2">
      <div
        className={`h-20 bg-[var(--nordic-accent)] rounded-${size === "sm" ? "sm" : size === "md" ? "md" : size === "lg" ? "lg" : "xl"}`}
        style={{
          borderRadius: size === "sm" ? "var(--radius-sm)" : size === "md" ? "var(--radius-md)" : size === "lg" ? "var(--radius-lg)" : "var(--radius-xl)"
        }}
      />
      <div>
        <p className="text-sm text-foreground">Radius {size.toUpperCase()}</p>
        <p className="text-xs text-muted-foreground font-mono">{value}</p>
      </div>
    </div>
  );
}
