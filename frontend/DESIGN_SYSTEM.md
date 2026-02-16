# LønKlar Design System

A premium, calm design system for Danish salary calculation tools. Built with React, TypeScript, and Tailwind CSS v4.

## 🎨 Design Concepts

### Concept A: Nordic Minimal Utility
- **Philosophy**: Clean, governmental aesthetic with subtle elegance
- **Color**: Cool grays with muted blue accent (#5B7A9E)
- **Feel**: Airy, trustworthy, public utility
- **Corners**: Slightly tighter (0.5rem)
- **Shadows**: Crisp, low opacity (2-8% black)
- **Best for**: Official feel, maximized credibility

### Concept B: Modern Technical Calm
- **Philosophy**: Contemporary professional with organic warmth
- **Color**: Warm grays with sage green accent (#6B8F71)
- **Feel**: Refined, technical, approachable
- **Corners**: Softer (0.625rem)
- **Shadows**: Warmer depth (4-9% opacity)
- **Best for**: Modern tech aesthetic, slightly more personality

## 🏗️ Architecture

### File Structure
```
/src/app/
├── components/
│   ├── Header.tsx          # Global header with theme switcher
│   ├── ServiceCard.tsx     # Service selection cards
│   ├── TrustBar.tsx        # Privacy/trust indicators
│   ├── Stepper.tsx         # Wizard progress stepper
│   └── States.tsx          # Loading, error, empty states
├── pages/
│   ├── Home.tsx            # Landing page with service grid
│   ├── Wizard.tsx          # Multi-step interview
│   ├── Results.tsx         # Results dashboard
│   ├── Methodology.tsx     # Transparency page
│   ├── NotFound.tsx        # 404 error page
│   └── DesignSystem.tsx    # Component showcase
├── routes.ts               # React Router configuration
└── App.tsx                 # Root component

/src/styles/
├── theme.css               # Design tokens (CSS variables)
├── fonts.css               # Font imports
└── tailwind.css            # Tailwind entry
```

## 🎯 Key Screens

### 1. Home / Service Picker
- Hero section with value proposition
- 4 service cards with icons
- "How it works" 3-step guide
- Trust bar component
- Mobile-first responsive grid

### 2. Interview Wizard
- Progress stepper (4-5 steps)
- One question per view
- Tooltips for helper text
- Review step before calculation
- Clean navigation (Back/Next)

### 3. Results Dashboard
- Prominent primary result card with gradient background
- Tabbed interface (Breakdown, Scenarios, Details)
- Export/Share buttons (placeholder)
- Visual breakdown with color-coded items
- Scenario comparison cards

### 4. Methodology / About
- Transparent calculation explanations
- Data source documentation
- Privacy policy statements
- Disclaimers and limitations

### 5. Error/Loading States
- Skeleton loaders with pulse animation
- Friendly error banners
- Empty state illustrations
- Consistent messaging

## 🧱 Component Library

### Buttons
```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Error</Button>
<Button size="sm|lg">Sizes</Button>
```

### Form Elements
```tsx
<Input placeholder="..." />
<Label htmlFor="...">Label</Label>
<Switch />
<RadioGroup>...</RadioGroup>
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Custom Components
- **ServiceCard**: Hover effect, icon + title + description
- **TrustBar**: 3-column trust indicators
- **Stepper**: Progress visualization with numbered steps
- **LoadingState**: Skeleton UI with animations
- **ErrorState**: Alert-style error display
- **EmptyState**: Centered empty message

## 🎨 Design Tokens

### Colors (CSS Variables)
```css
--background: Page background
--foreground: Primary text
--card: Card background
--primary: Primary action color
--secondary: Secondary surfaces
--muted: Disabled/subtle elements
--accent: Hover states
--border: Divider lines
--nordic-accent: Brand accent color
--nordic-accent-light: Accent backgrounds
--nordic-accent-dark: Accent text/hover
--destructive: Error states
```

### Spacing Scale
```css
--space-xs: 0.5rem
--space-sm: 0.75rem
--space-md: 1rem
--space-lg: 1.5rem
--space-xl: 2rem
--space-2xl: 3rem
--space-3xl: 4rem
```

### Border Radius
```css
--radius-sm: 0.375rem / 0.5rem (Nordic/Technical)
--radius-md: 0.5rem / 0.625rem
--radius-lg: 0.75rem / 0.875rem
--radius-xl: 1rem / 1.125rem
```

### Shadows (Elevation)
```css
--shadow-sm: Subtle hover
--shadow-md: Standard cards
--shadow-lg: Prominent elements
--shadow-xl: Modals/dialogs
```

## 📐 Layout Guidelines

### Grid System
- **Mobile**: Single column (< 768px)
- **Tablet**: 2 columns (768px - 1024px)
- **Desktop**: 3-4 columns (> 1024px)
- **Max Width**: 1280px (7xl) for content

### Spacing
- Section padding: 3-4rem vertical
- Card padding: 1.5-2rem
- Stack spacing: 1-1.5rem between elements
- Grid gaps: 1rem mobile, 1.5rem desktop

### Typography
- **H1**: 2.5-3rem, 500 weight, tight tracking
- **H2**: 1.5-2rem, 500 weight
- **H3**: 1.25rem, 500 weight
- **Body**: 1rem, 400 weight, 1.5 line-height
- **Small**: 0.875rem for helper text

## 🎭 Motion & Interaction

### Transitions
- **Duration**: 200ms for most interactions
- **Easing**: ease-in-out (default)
- **Properties**: color, background, opacity, transform

### Hover States
- Cards: Lift with shadow + border color change
- Buttons: Background darkening/lightening
- Links: Color shift to accent
- Icon backgrounds: Fill with accent color

### Micro-interactions
- Stepper: Progress bar slides
- Theme toggle: Instant color transitions
- Form validation: Subtle shake on error
- Loading: Pulse animation on skeletons

## 🌐 Accessibility

### WCAG AA Compliance
- **Contrast**: 4.5:1 minimum for body text
- **Focus**: Visible ring on all interactive elements
- **Labels**: Every form input has associated label
- **Alt Text**: Decorative icons use aria-hidden

### Keyboard Navigation
- Tab order follows visual hierarchy
- Enter/Space activates buttons
- Escape closes modals/tooltips

### Screen Readers
- Semantic HTML (header, nav, main, footer)
- ARIA labels on icon-only buttons
- Status announcements for loading states

## 📱 Responsive Behavior

### Mobile (< 768px)
- Single column layouts
- Full-width cards
- Stacked navigation
- Larger touch targets (44px min)

### Tablet (768px - 1024px)
- 2-column grids
- Side-by-side form fields
- Horizontal stepper

### Desktop (> 1024px)
- 3-4 column grids
- Max-width containers
- More generous spacing

## 🎨 Brand Guidelines

### Logo
- **Mark**: "DK" in white on accent color
- **Type**: "LønKlar" wordmark
- **Usage**: Always paired, never separated

### Tone of Voice
- **Professional**: Serious but not stiff
- **Clear**: Plain Danish, no jargon
- **Trustworthy**: Transparent about limitations
- **Helpful**: Guidance without condescension

### Copy Principles
- Short sentences (< 20 words)
- Active voice
- Direct address ("din løn", not "lønnen")
- Scandinavian directness

## 🔧 Implementation Notes

### Theme Switching
Toggle between concepts by setting `data-theme="technical"` on `<html>`:
```javascript
document.documentElement.setAttribute("data-theme", "technical");
```

### Custom Styling
Use Tailwind utilities to override base styles:
```tsx
<Button className="bg-[var(--nordic-accent)]">
  Custom accent button
</Button>
```

### Motion Support
Respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📦 Dependencies

- React 18.3.1
- React Router 7.13.0
- Tailwind CSS 4.1.12
- Radix UI (various @radix-ui/* packages)
- Lucide React (icons)

## 🚀 Usage

1. **Install dependencies**: `npm install`
2. **Run dev server**: `npm run dev`
3. **Toggle themes**: Use header switcher or visit `/design-system`
4. **View components**: Navigate to `/design-system` for full showcase

## 📝 Notes

- All calculations are **placeholder/mock data**
- No backend logic implemented
- Focus is on **visual design and UX patterns**
- Ready for future implementation of real calculations
- Optimized for Danish language and cultural context

## 🎯 Success Criteria

✅ Exceptionally polished visual design
✅ Professional, trustworthy aesthetic
✅ Two distinct, coherent design concepts
✅ Complete component library
✅ Responsive on all screen sizes
✅ Accessible to WCAG AA standards
✅ Clear design system documentation
✅ Ready for developer handoff

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Design System Author**: Figma Make AI
