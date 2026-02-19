# lønklar.dk — Frontend

Danish income calculator. React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + Recharts.

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
```

Backend must be running on port 8000 (`uvicorn api.main:app`).

## Stack

| Layer | Tech |
|-------|------|
| Framework | React 19, Vite 6 |
| Styling | Tailwind CSS 4, CSS custom properties |
| Components | shadcn/ui (MIT) |
| Charts | Recharts |
| Animations | Motion (Framer Motion) |
| Routing | React Router 7 |
| i18n | Custom — 7 languages (en, da, it, de, sv, es, nb) |

## Structure

```
src/
  main.tsx                  # Entry
  app/
    App.tsx                 # Provider wrapper
    routes.ts               # Route definitions
    components/             # Reusable components (Header, ServiceCard, SalaryPreview, etc.)
      ui/                   # shadcn/ui primitives
    pages/                  # Route pages (Home, Wizard, Results, HowItWorks, etc.)
    utils/
      api.ts                # Backend API client
      i18n.tsx              # Translations & language context
  styles/
    theme.css               # Design tokens (light + dark themes)
    tailwind.css            # Tailwind directives
    fonts.css               # Font imports
    index.css               # Global styles
```

## Credits

- UI components from [shadcn/ui](https://ui.shadcn.com/) — MIT license
