# Visual Specification Sheet

## LønKlar - Danish Salary Tools Web App

---

## 🎨 **Visual Design Concepts**

### **Concept A: Nordic Minimal Utility**
**Philosophy**: Calm, governmental aesthetic inspired by Scandinavian design principles

**Color Palette**:
- Background: #FAFBFC (off-white)
- Foreground: #1A1D29 (dark navy)
- Primary: #2B3A52 (slate blue)
- Accent: #5B7A9E (muted blue)
- Accent Light: #E8EEF5 (pale blue)
- Secondary: #F4F5F7 (light gray)
- Border: #E1E4E8 (soft gray)

**Typography**:
- Font: Inter (Google Fonts)
- Display: 2.5-3rem, 500 weight
- Headings: 1.25-2rem, 500 weight
- Body: 1rem, 400 weight, 1.5 line-height
- Small: 0.875rem, muted color

**Spacing**:
- Corners: 0.5rem (8px) standard
- Card padding: 1.5rem (24px)
- Section padding: 3-4rem vertical
- Grid gaps: 1rem mobile, 1.5rem desktop

**Shadows**:
- SM: 0 1px 2px rgba(0,0,0,0.03)
- MD: 0 2px 8px rgba(0,0,0,0.04)
- LG: 0 4px 16px rgba(0,0,0,0.06)
- XL: 0 8px 32px rgba(0,0,0,0.08)

**Character**: Airy, trustworthy, public utility, minimal

---

### **Concept B: Modern Technical Calm**
**Philosophy**: Contemporary professional with organic warmth

**Color Palette**:
- Background: #FBFBFA (warm off-white)
- Foreground: #1C1E1A (charcoal)
- Primary: #3A4438 (forest green)
- Accent: #6B8F71 (sage green)
- Accent Light: #E8F0EA (mint)
- Secondary: #F5F6F4 (warm gray)
- Border: #E0E3DE (stone gray)

**Typography**:
- Font: Inter (same as Nordic)
- Slightly increased letter-spacing on headings
- Warmer tone, same hierarchy

**Spacing**:
- Corners: 0.625rem (10px) - slightly softer
- Same padding/margins as Nordic
- More generous breathing room

**Shadows**:
- SM: 0 1px 3px rgba(28,30,26,0.04)
- MD: 0 2px 10px rgba(28,30,26,0.05)
- LG: 0 4px 18px rgba(28,30,26,0.07)
- XL: 0 8px 36px rgba(28,30,26,0.09)

**Character**: Refined, technical, approachable, modern

---

## 📐 **Layout & Grid**

### **Responsive Breakpoints**:
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)
- Max container width: 1280px

### **Page Layouts**:

**Home Page**:
```
Header (sticky, 64px height)
├─ Logo + Brand
└─ Nav (Metodologi, Theme Toggle)

Hero Section (py-16)
├─ Animated illustration
├─ H1: Main headline
└─ Subtitle paragraph

Service Grid (pb-16)
└─ 2-column grid (4 cards)
    ├─ Icon (48x48)
    ├─ Title (H3)
    └─ Description (2 lines)

How It Works (py-16, bg-secondary)
└─ 3-column grid
    ├─ Numbered badge
    ├─ Step title
    └─ Description

Trust Bar (border-top/bottom)
└─ 3-column grid
    ├─ Icon
    ├─ Title
    └─ Subtitle

Footer (py-8, border-top)
└─ Copyright text (center)
```

**Wizard Page**:
```
Header (same)

Stepper (mb-12)
├─ Progress indicators
└─ Step labels

Question Card (p-8, rounded-xl, shadow-lg)
├─ Question text (H2)
├─ Tooltip icon
├─ Input/Radio group
└─ Navigation buttons (Back/Next)

Progress text (text-center)
└─ "Step X of Y"
```

**Results Page**:
```
Header (same)

Back button (mb-6)

Primary Result Card (gradient bg, p-8, rounded-xl)
├─ Label (text-sm)
├─ Big number (text-5xl)
├─ Subtitle
└─ Trend badge (optional)

Action buttons (flex gap-3)
├─ Export
└─ Share

Tabs (w-full)
├─ Breakdown
│   └─ List of items with values
├─ Scenarios (if applicable)
│   └─ 3-column comparison grid
└─ Details
    └─ Methodology explanation

New calculation button (center)
```

---

## 🧩 **Component Specifications**

### **Button**:
```
Variants: default, secondary, outline, ghost, destructive
Sizes: sm (32px), default (40px), lg (48px)
States: default, hover, active, disabled, focus

Default:
- bg: var(--primary)
- text: white
- padding: 0.5rem 1rem
- border-radius: var(--radius-md)
- transition: 200ms

Hover:
- Slight darkening
- Shadow elevation

Focus:
- 2px ring, offset 2px
- ring-color: var(--ring)
```

### **Input**:
```
Height: 40px (48px for large)
Padding: 0.5rem 0.75rem
Border: 1px solid var(--border)
Border-radius: var(--radius-md)
Background: var(--input-background)
Focus: ring + border color change

States:
- Default: subtle bg
- Hover: border darkens
- Focus: accent ring
- Error: destructive border + ring
- Disabled: opacity 50%
```

### **Card**:
```
Background: var(--card)
Border: 1px solid var(--border)
Border-radius: var(--radius-lg) (12px / 14px)
Padding: 1.5rem
Shadow: var(--shadow-md) on hover

Hover state:
- Shadow: var(--shadow-lg)
- Border-color: var(--nordic-accent)
- Transition: 200ms
```

### **Service Card** (custom):
```
Structure:
├─ Icon container (48x48)
│   - bg: accent-light
│   - rounded: var(--radius-md)
│   - transition: bg, color
├─ Title (H3)
└─ Description (text-sm, 2 lines)

Hover state:
- Icon bg → accent color
- Icon color → white
- Card border → accent
- Card shadow → elevated
```

### **Stepper** (custom):
```
Structure:
├─ Step circles (40x40)
│   - bg: muted (inactive)
│   - bg: accent (active/complete)
│   - ring: accent-light (active)
├─ Connecting lines (2px)
│   - bg: border (inactive)
│   - bg: accent (complete)
└─ Labels (text-xs, below)

States:
- Complete: checkmark icon
- Active: number, accent bg, ring
- Inactive: number, muted bg
```

### **Trust Bar** (custom):
```
Structure:
├─ Border top/bottom
├─ Background: card/50 with backdrop-blur
└─ 3-column grid
    ├─ Icon badge (32x32)
    │   - bg: accent-light
    │   - rounded-full
    ├─ Title (text-sm)
    └─ Subtitle (text-xs, muted)
```

---

## 🎭 **Interaction & Motion**

### **Transitions**:
- Duration: 200ms (standard)
- Easing: ease-in-out
- Properties: color, background-color, border-color, opacity, transform, box-shadow

### **Hover Effects**:
- **Cards**: Lift with shadow increase + border accent
- **Buttons**: Background darken 10% + subtle lift
- **Links**: Color → accent color
- **Icons**: Background fill + color invert

### **Animations**:
- **Page load**: Fade in + slight upward motion (20px)
- **Stepper progress**: Slide + color transition
- **Loading**: Pulse on skeleton elements
- **Error shake**: Horizontal shake (5px, 3 cycles)

### **Focus States**:
- All interactive elements: 2px ring, 2px offset
- Ring color: var(--ring)
- Visible on keyboard navigation
- Removed on mouse click

---

## ♿ **Accessibility Requirements**

### **Color Contrast**:
- Body text: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### **Keyboard Navigation**:
- Tab order: logical, follows visual flow
- Enter/Space: activate buttons
- Escape: close modals/dropdowns
- Arrow keys: navigate lists

### **Screen Readers**:
- Semantic HTML: header, nav, main, section, footer
- ARIA labels: all icon-only buttons
- Status messages: live regions for loading
- Alt text: decorative images use aria-hidden

### **Touch Targets**:
- Minimum: 44x44px (mobile)
- Spacing: 8px between targets
- Visible feedback on touch

---

## 📱 **Responsive Behavior**

### **Mobile (< 768px)**:
- Single column layouts
- Full-width cards
- Stacked form fields
- Hamburger menu (if needed)
- Larger touch targets (48px)
- Font scaling: slightly reduced

### **Tablet (768px - 1024px)**:
- 2-column grids
- Side-by-side form elements
- Horizontal stepper
- Reduced padding (1rem)

### **Desktop (> 1024px)**:
- 3-4 column grids
- Max-width containers (1280px)
- Generous padding (2-3rem)
- Hover states active
- Keyboard shortcuts visible

---

## 🎯 **Brand Voice & Copy**

### **Tone**:
- Professional but warm
- Direct and clear
- Trustworthy
- Helpful without being condescending

### **Writing Style**:
- Short sentences (< 20 words)
- Active voice
- Second person ("din", "du")
- Plain Danish (no jargon)
- Scandinavian directness

### **Example Copy**:
✅ "Beregn din nettoløn på 2 minutter"
❌ "Vi kan hjælpe dig med at få overblik over din totale kompensationspakke"

✅ "Alle beregninger er vejledende"
❌ "Bemærk venligst at beregningerne er estimater baseret på generelle forudsætninger"

---

## 🔧 **Technical Implementation Notes**

### **Tech Stack**:
- React 18.3.1
- TypeScript
- Tailwind CSS 4.1.12
- React Router 7.13.0
- Radix UI components
- Motion/React for animations
- Lucide React for icons

### **CSS Variables**:
All colors and tokens defined in `/src/styles/theme.css`
Toggle theme via `document.documentElement.setAttribute("data-theme", "technical")`

### **File Structure**:
```
/src/app/
  components/    # Reusable UI components
  pages/         # Route-level pages
  utils/         # Helper functions
  routes.ts      # Router config
  App.tsx        # Root
/src/styles/
  theme.css      # Design tokens
  fonts.css      # Typography
  tailwind.css   # Framework entry
```

### **Performance**:
- Lazy load images
- Code splitting by route
- Minimize bundle size
- Optimize animations (GPU-accelerated)

---

## ✅ **Design Deliverables Checklist**

- [x] Two complete visual concepts (Nordic & Technical)
- [x] Full color palettes with CSS variables
- [x] Typography system with hierarchy
- [x] Spacing and layout grids
- [x] Complete component library
- [x] All key screens implemented
  - [x] Home / Service Picker
  - [x] Interview Wizard
  - [x] Results Dashboard
  - [x] Methodology page
  - [x] Error/Loading/Empty states
  - [x] 404 page
- [x] Responsive breakpoints tested
- [x] Accessibility compliance (WCAG AA)
- [x] Theme switcher functionality
- [x] Motion and interaction patterns
- [x] Design system documentation
- [x] Component showcase page
- [x] Brand guidelines
- [x] Technical implementation notes

---

**Status**: ✅ Ready for developer handoff
**Version**: 1.0.0
**Date**: February 14, 2026
**Designer**: Figma Make AI
