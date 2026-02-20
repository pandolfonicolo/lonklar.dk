# 🇩🇰 lønklar.dk — Danish Salary Calculator

**[Lonklar](https://lonklar.dk)** is a free, open-source web app that calculates your net income in Denmark after taxes and deductions. Built for employees, students, and anyone working in Denmark who wants a clear picture of their take-home pay.

## Features

- **Three calculator modes:** Full-time, Part-time, and Student income
- **Multi-job support** for students with multiple part-time jobs
- **Accurate 2026 Danish tax model:** bundskat, kommuneskat, AM-bidrag, personfradrag, beskæftigelsesfradrag, ATP, church tax, pension, befordringsfradrag, and more
- **Interactive charts** showing net-vs-gross income curves with tax bracket visualization
- **7 languages:** Danish, English, Italian, German, Swedish, Spanish, Norwegian
- **Dark/light theme** with responsive mobile design
- **User feedback system** — vote on accuracy, report actual salary, submit bug reports

## Architecture

```
Browser → Cloudflare DNS → Caddy (HTTPS) → Docker → FastAPI + React SPA
```

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS 4, shadcn/ui, Recharts |
| **Backend** | Python 3.12, FastAPI, Pydantic |
| **Deployment** | Docker (multi-stage build), GitHub Actions CI/CD |
| **Server** | Oracle Cloud Free Tier (Ubuntu 24.04), Caddy reverse proxy |

## Project Structure

```
├── api/                    # FastAPI backend
│   ├── main.py             # App entry, static file serving
│   ├── tax_engine.py       # Danish tax computation logic
│   ├── models.py           # Pydantic request/response models
│   ├── data.py             # Tax rates, kommune data (2026)
│   └── routers/
│       ├── compute.py      # /api/compute/* endpoints
│       ├── feedback.py     # /api/feedback, /api/vote, /api/accuracy-report
│       └── meta.py         # /api/meta (kommune list, rates)
├── frontend/               # React SPA
│   └── src/
│       └── app/
│           ├── pages/      # Home, Wizard, Results, About, Feedback, HowItWorks
│           ├── components/  # Header, ServiceCard, Stepper, shadcn/ui
│           └── utils/
│               ├── api.ts   # Backend API client
│               └── i18n.tsx  # Translations (7 languages)
├── Dockerfile              # Multi-stage: Node build → Python runtime
├── requirements.txt        # Python dependencies
├── start.sh                # Local dev: starts backend + frontend
└── INFRASTRUCTURE.md       # Full infrastructure & ops guide
```

## API Endpoints

### Tax Computation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/compute/fulltime` | Full-time salary → net income breakdown |
| `POST` | `/api/compute/parttime` | Part-time (hourly) → net income breakdown |
| `POST` | `/api/compute/student` | Student income (SU + jobs) → net income breakdown |
| `POST` | `/api/compute/curve` | Net-vs-gross income curve data (for charts) |
| `POST` | `/api/compute/hours-curve` | Net income vs hours worked curve |
| `POST` | `/api/compute/student-hours-curve` | Student net vs hours with fribeløb threshold |

### Meta & Feedback

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meta` | Available municipalities, tax rates, year |
| `POST` | `/api/vote` | Submit 👍/👎 vote on calculation accuracy |
| `GET` | `/api/vote/stats` | Aggregate vote statistics |
| `POST` | `/api/accuracy-report` | Report actual vs estimated salary |
| `POST` | `/api/feedback` | Submit bug report / feature request / general feedback |

## Local Development

### Prerequisites

- **Node.js** 20+
- **Python** 3.12+

### Quick Start

```bash
# Clone
git clone https://github.com/pandolfonicolo/lonklar.dk.git
cd lonklar.dk

# Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..

# Run both (backend :8000, frontend :5173)
./start.sh
```

Or run them separately:

```bash
# Terminal 1 — Backend
uvicorn api.main:app --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Docker

```bash
docker build -t lonklar .
docker run -p 8000:8000 lonklar
# → http://localhost:8000
```

## Tax Model

The tax engine implements the Danish 2026 tax system:

| Component | Description |
|-----------|-------------|
| **AM-bidrag** | 8% labor market contribution (deducted before income tax) |
| **Bundskat** | ~12.01% base state tax |
| **Kommuneskat** | Municipality tax (varies ~23-27%) |
| **Mellemskat** | 7.5% on income above ~641,200 DKK/year |
| **Topskat** | 7.5% on income above ~777,900 DKK/year |
| **Toptopskat** | 5.0% on income above ~2,592,700 DKK/year |
| **Personfradrag** | Personal allowance (~54,100 DKK for adults) |
| **Beskæftigelsesfradrag** | Employment deduction (12.75%, max ~63,300 DKK) |
| **Jobfradrag** | Job deduction (4.50%, max ~3,100 DKK) |
| **ATP** | Mandatory labor market pension (varies by hours) |
| **Kirkeskat** | Optional church tax (~0.4-1.3%) |
| **Pension** | Employer/employee pension contributions |
| **Befordringsfradrag** | Commuter deduction based on daily km |
| **SU** | Student grants (Statens Uddannelsesstøtte) & fribeløb thresholds |
| **Skatteloft** | Tax ceiling at 44.57% (prevents combined marginal rate from exceeding this) |

Municipality-specific rates are loaded from [api/data.py](frontend/../api/data.py) covering all 98 Danish municipalities.

## Deployment

The app auto-deploys on push to `main` via GitHub Actions:

1. GitHub Actions SSHs into the production server
2. Pulls latest code
3. Rebuilds the Docker image
4. Restarts the container

Production runs on Oracle Cloud Free Tier with Caddy as a reverse proxy for automatic HTTPS.

See [INFRASTRUCTURE.md](INFRASTRUCTURE.md) for the full infrastructure & operations guide.

## SEO

The site is set up for Google indexing:

- **`robots.txt`** and **`sitemap.xml`** in `frontend/public/` (served by FastAPI with explicit routes)
- **Open Graph + Twitter Card** meta tags in `index.html` with `og-image.png` (1200×630)
- **JSON-LD structured data** (`WebSite` + `WebApplication` schemas)
- **Per-route `document.title`** with "Lonklar" branding on every page
- **`/about` page** — text-heavy brand page for crawlers
- **Google Search Console** — verify via Cloudflare DNS TXT, submit sitemap

See the [SEO section in INFRASTRUCTURE.md](INFRASTRUCTURE.md#seo--google-indexing) for full details.

## Contributing

Contributions are welcome! Some areas that could use help:

- **Tax accuracy** — verify deductions against official SKAT data
- **New features** — freelancer/self-employed mode, pension projections
- **Translations** — improve existing or add new languages
- **Tests** — automated tests for the tax engine

## License

MIT

---

Built with ☕ in Copenhagen · [Lonklar](https://lonklar.dk)
