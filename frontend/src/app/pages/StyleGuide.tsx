export function StyleGuide() {
  return (
    <div className="min-h-screen bg-background p-8 print:p-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 print:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--nordic-accent)] flex items-center justify-center">
              <span className="text-white font-semibold text-lg">DK</span>
            </div>
            <div>
              <h1 className="text-3xl text-foreground">LønKlar Style Guide</h1>
              <p className="text-sm text-muted-foreground">Visual design system for Danish salary tools</p>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl mb-4 text-foreground">🎨 Concept A: Nordic Minimal Utility</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Primary Accent</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: '#5B7A9E' }} />
                  <code className="text-xs">#5B7A9E</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Background</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: '#FAFBFC' }} />
                  <code className="text-xs">#FAFBFC</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Foreground</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: '#1A1D29' }} />
                  <code className="text-xs">#1A1D29</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Corner Radius</span>
                <code className="text-xs">0.5rem (8px)</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shadow Style</span>
                <span className="text-xs">Crisp, cool tone</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                Clean governmental aesthetic • Airy spacing • Minimal decoration • High trust factor
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl mb-4 text-foreground">🌿 Concept B: Modern Technical Calm</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Primary Accent</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: '#6B8F71' }} />
                  <code className="text-xs">#6B8F71</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Background</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: '#FBFBFA' }} />
                  <code className="text-xs">#FBFBFA</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Foreground</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: '#1C1E1A' }} />
                  <code className="text-xs">#1C1E1A</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Corner Radius</span>
                <code className="text-xs">0.625rem (10px)</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shadow Style</span>
                <span className="text-xs">Soft, warm tone</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                Contemporary professional • Refined details • Organic warmth • Technical precision
              </p>
            </div>
          </div>
        </div>

        {/* Typography Scale */}
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 mb-8">
          <h2 className="text-xl mb-6 text-foreground">Typography Hierarchy</h2>
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <div className="flex items-baseline justify-between mb-2">
                <h1 className="text-foreground">Display / H1</h1>
                <span className="text-xs text-muted-foreground">2.5-3rem • 500 weight</span>
              </div>
              <p className="text-xs text-muted-foreground">Used for main page titles and hero headlines</p>
            </div>
            <div className="border-b border-border pb-4">
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-foreground">Heading 2</h2>
                <span className="text-xs text-muted-foreground">1.5-2rem • 500 weight</span>
              </div>
              <p className="text-xs text-muted-foreground">Section headers and major divisions</p>
            </div>
            <div className="border-b border-border pb-4">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-foreground">Heading 3</h3>
                <span className="text-xs text-muted-foreground">1.25rem • 500 weight</span>
              </div>
              <p className="text-xs text-muted-foreground">Subsection titles and card headers</p>
            </div>
            <div className="border-b border-border pb-4">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-foreground">Body / Paragraph</p>
                <span className="text-xs text-muted-foreground">1rem • 400 weight • 1.5 line-height</span>
              </div>
              <p className="text-xs text-muted-foreground">Standard text for content and descriptions</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-sm text-muted-foreground">Small / Helper Text</p>
                <span className="text-xs text-muted-foreground">0.875rem • muted color</span>
              </div>
              <p className="text-xs text-muted-foreground">Captions, labels, and supplementary information</p>
            </div>
          </div>
        </div>

        {/* Component Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h3 className="mb-4 text-foreground">Primary Components</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Button Styles</p>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-sm">
                    Primary
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-[var(--radius-md)] text-sm">
                    Secondary
                  </button>
                  <button className="px-4 py-2 border border-border rounded-[var(--radius-md)] text-sm">
                    Outline
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Form Elements</p>
                <input
                  type="text"
                  placeholder="Input field..."
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-[var(--radius-md)] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h3 className="mb-4 text-foreground">Service Card Example</h3>
            <div className="border border-border rounded-[var(--radius-lg)] p-4 hover:border-[var(--nordic-accent)] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--nordic-accent-light)] flex items-center justify-center text-[var(--nordic-accent)]">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h4 className="mb-1 text-foreground text-sm">Nettolønberegner</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Beregn din nettoløn baseret på bruttoløn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 mb-8">
          <h2 className="text-xl mb-6 text-foreground">Extended Color Palette</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <ColorSwatch name="Primary" hex="#2B3A52 / #3A4438" />
            <ColorSwatch name="Accent" hex="#5B7A9E / #6B8F71" />
            <ColorSwatch name="Secondary" hex="#F4F5F7 / #F5F6F4" />
            <ColorSwatch name="Muted" hex="#E8EAED / #E9EBE7" />
            <ColorSwatch name="Border" hex="#E1E4E8 / #E0E3DE" />
            <ColorSwatch name="Destructive" hex="#C93A3A" />
          </div>
        </div>

        {/* Spacing & Layout */}
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 mb-8">
          <h2 className="text-xl mb-6 text-foreground">Spacing Scale</h2>
          <div className="space-y-3">
            {[
              { name: 'XS', value: '0.5rem', px: '8px' },
              { name: 'SM', value: '0.75rem', px: '12px' },
              { name: 'MD', value: '1rem', px: '16px' },
              { name: 'LG', value: '1.5rem', px: '24px' },
              { name: 'XL', value: '2rem', px: '32px' },
              { name: '2XL', value: '3rem', px: '48px' },
            ].map((space) => (
              <div key={space.name} className="flex items-center gap-4">
                <span className="w-12 text-xs text-muted-foreground">{space.name}</span>
                <div className="h-6 bg-[var(--nordic-accent)]" style={{ width: space.value }} />
                <span className="text-xs text-muted-foreground font-mono">{space.value} ({space.px})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h3 className="mb-4 text-foreground">✅ Do's</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use generous whitespace for clarity</li>
              <li>• Maintain consistent corner radius</li>
              <li>• Apply subtle shadows for depth</li>
              <li>• Keep copy short and direct</li>
              <li>• Ensure 4.5:1 contrast for text</li>
              <li>• Use accent color sparingly</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h3 className="mb-4 text-foreground">❌ Don'ts</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Avoid aggressive colors (red/green)</li>
              <li>• Don't clutter interfaces</li>
              <li>• No excessive animations</li>
              <li>• Avoid banking app clichés</li>
              <li>• Don't mix both theme colors</li>
              <li>• No marketing language</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>LønKlar Style Guide v1.0 • February 2026 • Built with Figma Make</p>
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  // Extract the first color if there are two
  const primaryColor = hex.split(' / ')[0];
  
  return (
    <div className="space-y-2">
      <div className="h-16 rounded-[var(--radius-md)] border border-border" style={{ backgroundColor: primaryColor }} />
      <div>
        <p className="text-xs text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{hex}</p>
      </div>
    </div>
  );
}
