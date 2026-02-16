# Quick Start Guide for Developers

This guide helps developers understand and implement the LønKlar design system.

## 🚀 30-Second Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and explore the app.

---

## 🎨 Understanding the Design System

### 1. Theme Switching

The app has two visual concepts that can be toggled:

**Nordic Minimal Utility** (default):
- Cool blue accent (#5B7A9E)
- Clean governmental feel
- Tighter corners (8px)

**Modern Technical Calm**:
- Sage green accent (#6B8F71)
- Warmer professional feel
- Softer corners (10px)

Toggle via:
```javascript
// Enable Technical theme
document.documentElement.setAttribute("data-theme", "technical");

// Remove (back to Nordic)
document.documentElement.removeAttribute("data-theme");
```

### 2. Using Design Tokens

All colors, spacing, and other values are CSS variables:

```tsx
// Use in inline styles
<div style={{ color: 'var(--nordic-accent)' }}>Text</div>

// Use in Tailwind classes
<div className="bg-[var(--nordic-accent)] text-white">Button</div>

// Available tokens (see /src/styles/theme.css)
--background, --foreground, --card, --primary, --secondary
--nordic-accent, --nordic-accent-light, --nordic-accent-dark
--space-xs through --space-3xl
--radius-sm through --radius-xl
--shadow-sm through --shadow-xl
```

### 3. Component Patterns

**Service Card** (clickable card with icon):
```tsx
import { ServiceCard } from "./components/ServiceCard";

<ServiceCard
  icon={<Calculator className="w-6 h-6" />}
  title="Title"
  description="Description text"
  onClick={() => navigate('/path')}
/>
```

**Stepper** (progress indicator):
```tsx
import { Stepper } from "./components/Stepper";

<Stepper 
  steps={["Step 1", "Step 2", "Step 3"]} 
  currentStep={1} 
/>
```

**Trust Bar** (3-column trust indicators):
```tsx
import { TrustBar } from "./components/TrustBar";

<TrustBar /> // Self-contained, no props needed
```

**Loading/Error States**:
```tsx
import { LoadingState, ErrorState, EmptyState } from "./components/States";

{isLoading && <LoadingState />}
{error && <ErrorState message="Custom error" />}
{!data && <EmptyState title="No data" description="..." />}
```

---

## 📐 Layout Guidelines

### Responsive Container
```tsx
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Grid Patterns
```tsx
{/* 2-column on tablet+, 1-column mobile */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card />
  <Card />
</div>

{/* 3-column on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

### Section Spacing
```tsx
{/* Standard section */}
<section className="py-16 px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto">
    {/* Content */}
  </div>
</section>
```

---

## 🎯 Common Patterns

### Card with Border Radius
```tsx
<div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
  Content
</div>
```

### Hover Effect
```tsx
<div className="transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-[var(--nordic-accent)]">
  Hoverable element
</div>
```

### Icon Badge
```tsx
<div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--nordic-accent-light)] text-[var(--nordic-accent)] flex items-center justify-center">
  <Icon className="w-6 h-6" />
</div>
```

### Button with Icon
```tsx
import { Button } from "./components/ui/button";
import { Download } from "lucide-react";

<Button>
  <Download className="w-4 h-4 mr-2" />
  Export
</Button>
```

---

## 🔍 Finding Components

### UI Components (Radix-based)
Location: `/src/app/components/ui/`

Common ones:
- `button.tsx` - Button variants
- `input.tsx` - Text inputs
- `card.tsx` - Card containers
- `tabs.tsx` - Tabbed interfaces
- `dialog.tsx` - Modal dialogs
- `tooltip.tsx` - Hover tooltips
- `select.tsx` - Dropdown selects
- `radio-group.tsx` - Radio buttons
- `switch.tsx` - Toggle switches
- `progress.tsx` - Progress bars

### Custom Components
Location: `/src/app/components/`

- `Header.tsx` - Global navigation
- `ServiceCard.tsx` - Service selection cards
- `TrustBar.tsx` - Trust indicators
- `Stepper.tsx` - Wizard progress
- `States.tsx` - Loading/Error/Empty
- `HeroIllustration.tsx` - Animated SVG

### Pages
Location: `/src/app/pages/`

- `Home.tsx` - Landing page
- `Wizard.tsx` - Multi-step form
- `Results.tsx` - Results dashboard
- `Methodology.tsx` - About/transparency
- `DesignSystem.tsx` - Component showcase
- `StyleGuide.tsx` - Print reference

---

## 🎨 Styling Best Practices

### 1. Use Design Tokens
```tsx
// ✅ Good - uses design token
<div className="bg-[var(--nordic-accent)]">

// ❌ Avoid - hardcoded color
<div className="bg-blue-500">
```

### 2. Consistent Border Radius
```tsx
// ✅ Good - uses token
<div className="rounded-[var(--radius-lg)]">

// ❌ Avoid - arbitrary value
<div className="rounded-xl">
```

### 3. Standard Transitions
```tsx
// ✅ Good - consistent duration
<div className="transition-all duration-200">

// ❌ Avoid - inconsistent timing
<div className="transition-all duration-500">
```

### 4. Semantic Colors
```tsx
// ✅ Good - semantic meaning
<div className="text-muted-foreground">

// ❌ Avoid - arbitrary gray
<div className="text-gray-500">
```

---

## 📱 Responsive Patterns

### Mobile-First Approach
```tsx
{/* Base = mobile, then add desktop */}
<div className="text-sm md:text-base lg:text-lg">
  Text scales up on larger screens
</div>

<div className="flex-col md:flex-row">
  Stack on mobile, row on desktop
</div>
```

### Hide/Show Elements
```tsx
{/* Show only on mobile */}
<div className="block md:hidden">Mobile only</div>

{/* Hide on mobile */}
<div className="hidden md:block">Desktop only</div>
```

---

## ♿ Accessibility Checklist

When creating components:

- [ ] All buttons/links have proper focus states
- [ ] Form inputs have associated labels
- [ ] Icon-only buttons have aria-label
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announcements for dynamic content
- [ ] Touch targets are 44x44px minimum (mobile)

Example:
```tsx
<button
  className="..."
  aria-label="Close dialog"
  onClick={handleClose}
>
  <X className="w-4 h-4" />
</button>
```

---

## 🎭 Adding Animations

Use Motion/React for complex animations:

```tsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

For simple transitions, use CSS:
```tsx
<div className="transition-all duration-200 hover:scale-105">
  Subtle scale on hover
</div>
```

---

## 🔧 Common Tasks

### Add a New Service
1. Add to `services` array in `Home.tsx`
2. Add steps to `wizardSteps` in `Wizard.tsx`
3. Add mock results to `mockResults` in `Results.tsx`

### Create a New Page
1. Create file in `/src/app/pages/NewPage.tsx`
2. Add route in `/src/app/routes.ts`
3. Add navigation link in `Header.tsx` (if needed)

### Add a Custom Color
1. Define in `/src/styles/theme.css` under `:root` and `:root[data-theme="technical"]`
2. Add to `@theme inline` section
3. Use via `var(--your-color)` or `text-[var(--your-color)]`

---

## 🐛 Debugging Tips

### Theme Not Switching?
Check if `data-theme="technical"` is on `<html>` element:
```javascript
console.log(document.documentElement.getAttribute('data-theme'));
```

### CSS Variable Not Working?
Inspect element and check computed styles:
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--nordic-accent');
```

### Component Not Updating?
Check React DevTools for state changes and re-renders.

---

## 📚 Reference Pages

Visit these routes for design reference:

- `/` - Live application demo
- `/design-system` - Interactive component showcase
- `/style-guide` - Print-ready reference sheet
- `/methodology` - Content/copy examples

---

## 💡 Pro Tips

1. **Use the design system page** (`/design-system`) as a component reference while coding
2. **Check both themes** when building new components
3. **Test on mobile** frequently (use browser DevTools device emulation)
4. **Use placeholder text** from existing pages to maintain tone
5. **Copy-paste patterns** from existing components rather than starting from scratch

---

## 🎯 Next Steps

1. **Explore the app**: Click through all pages and interactions
2. **Read the docs**: Check `DESIGN_SYSTEM.md` for full details
3. **Inspect components**: Open DevTools and see how styles are applied
4. **Modify safely**: Change colors/spacing via CSS variables first
5. **Build confidently**: Follow patterns established in existing code

---

## 🆘 Need Help?

- **Component examples**: Visit `/design-system`
- **Visual reference**: Visit `/style-guide`
- **Full documentation**: Read `DESIGN_SYSTEM.md`
- **Detailed specs**: Read `VISUAL_SPEC.md`
- **Code patterns**: Browse `/src/app/pages/` for examples

---

**Happy coding! 🚀**
