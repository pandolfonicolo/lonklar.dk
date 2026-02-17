import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Supported languages ──────────────────────────────────────────────

export type Lang = "en" | "da";

// ── Translation keys ─────────────────────────────────────────────────
// Convention: English is the primary display language.
// Danish terms appear as subtitles/parentheticals in EN mode.
// In DA mode everything is in Danish with English parentheticals for clarity.

const translations = {
  // ── Global / nav ───────────────────────────────────────────────
  "nav.methodology": { en: "How we calculate", da: "Sådan beregner vi" },
  "nav.feedback": { en: "Feedback", da: "Feedback" },
  "nav.language": { en: "DA", da: "EN" },

  // ── Home page ──────────────────────────────────────────────────
  "home.hero.title": {
    en: "Your Danish salary,\nclearly explained",
    da: "Din danske løn,\ntydeligt forklaret",
  },
  "home.hero.subtitle": {
    en: "Accurate tax breakdown for any employment type. Aligned with SKAT 2026 rates, always free, always private.",
    da: "Præcis skatteberegning for enhver ansættelsestype. Baseret på SKAT 2026-satser, altid gratis, altid privat.",
  },
  "home.hero.disclaimer_ref": {
    en: "Estimates only, no guarantees. Your feedback helps.",
    da: "Kun estimater, ingen garanti. Din feedback hjælper.",
  },

  // Trust signals (inline hero)
  "home.trust.noads": { en: "No ads or tracking", da: "Ingen reklamer eller sporing" },
  "home.trust.transparent": { en: "Open methodology", da: "Åben metode" },
  "home.trust.skat": { en: "SKAT 2026 aligned", da: "SKAT 2026-baseret" },

  // Section heading above cards
  "home.cards.heading": { en: "Choose your calculator", da: "Vælg din beregner" },

  // Service cards
  "home.fulltime.title": { en: "Monthly salary", da: "Månedsløn" },
  "home.fulltime.subtitle": { en: "Fuldtidsløn", da: "Full-time salary" },
  "home.fulltime.desc": {
    en: "Monthly salaried position: pension, AM-bidrag, feriepenge and every tax bracket, calculated in seconds.",
    da: "Fuldtidsstilling med fast månedsløn: pension, AM-bidrag, feriepenge og alle skattetrin, beregnet på sekunder.",
  },
  "home.parttime.title": { en: "Hourly pay", da: "Timeløn" },
  "home.parttime.subtitle": { en: "Deltid / timeløn", da: "Part-time / hourly" },
  "home.parttime.desc": {
    en: "Know your hourly rate and weekly hours? See your real take-home pay including 12.5% feriepenge and all deductions.",
    da: "Kender du din timeløn og ugentlige timer? Se din reelle udbetaling inkl. 12,5% feriepenge og alle fradrag.",
  },
  "home.student.title": { en: "Student job", da: "Studiejob" },
  "home.student.subtitle": { en: "Studerende (SU + arbejde)", da: "Student (SU + work)" },
  "home.student.desc": {
    en: "Combine your SU grant with a student job. See your total income and check how close you are to the fribeløb limit.",
    da: "Kombiner din SU med et studiejob. Se din samlede indkomst og tjek hvor tæt du er på fribeløbsgrænsen.",
  },

  // How it works
  "home.how.title": { en: "How it works", da: "Sådan virker det" },
  "home.how.step1.title": { en: "Choose your situation", da: "Vælg din situation" },
  "home.how.step1.desc": {
    en: "Are you salaried, paid hourly, or a student with SU? Pick the calculator that fits.",
    da: "Er du fastansat, timelønnet eller studerende med SU? Vælg den beregner der passer.",
  },
  "home.how.step2.title": { en: "Fill in a few numbers", da: "Indtast et par tal" },
  "home.how.step2.desc": {
    en: "Gross salary, pension split, municipality. A short form, nothing more.",
    da: "Bruttoløn, pensionsfordeling, kommune. En kort formular, intet mere.",
  },
  "home.how.step3.title": { en: "Get your estimate", da: "Få dit estimat" },
  "home.how.step3.desc": {
    en: "See a detailed breakdown of deductions, net pay, and effective tax rate. Instantly.",
    da: "Se en detaljeret opgørelse af fradrag, nettoløn og effektiv skattesats. Med det samme.",
  },
  "home.footer": {
    en: "© 2026 udbetalt.dk. All calculations are indicative and provided without guarantee.",
    da: "© 2026 udbetalt.dk. Alle beregninger er vejledende og uden garanti.",
  },

  // Disclaimer banner (homepage)
  "home.disclaimer": {
    en: "This is a personal project built in my spare time. I strive for accuracy but take no responsibility for the results. If you spot an error or have a suggestion, I'd love to hear from you.",
    da: "Dette er et personligt projekt bygget i min fritid. Jeg stræber efter præcision, men tager intet ansvar for resultaterne. Har du fundet en fejl eller har et forslag, hører jeg gerne fra dig.",
  },
  "home.disclaimer.cta": {
    en: "Give feedback",
    da: "Giv feedback",
  },

  // Feedback page
  "feedback.title": { en: "Feedback", da: "Feedback" },
  "feedback.subtitle": {
    en: "Help improve udbetalt.dk: report errors, suggest features, or share your experience.",
    da: "Hjælp med at forbedre udbetalt.dk: rapportér fejl, foreslå funktioner, eller del din oplevelse.",
  },
  "feedback.type.label": { en: "What kind of feedback?", da: "Hvilken type feedback?" },
  "feedback.type.bug": { en: "Bug / incorrect result", da: "Fejl / forkert resultat" },
  "feedback.type.feature": { en: "Feature suggestion", da: "Funktionsforslag" },
  "feedback.type.general": { en: "General comment", da: "Generel kommentar" },
  "feedback.message.label": { en: "Your message", da: "Din besked" },
  "feedback.message.placeholder": {
    en: "Describe the issue or suggestion…",
    da: "Beskriv problemet eller forslaget…",
  },
  "feedback.email.label": { en: "Email (optional)", da: "E-mail (valgfrit)" },
  "feedback.email.placeholder": { en: "In case I need to follow up", da: "Hvis jeg har behov for opfølgning" },
  "feedback.submit": { en: "Send feedback", da: "Send feedback" },
  "feedback.success": { en: "Thank you! Your feedback has been received.", da: "Tak! Din feedback er modtaget." },
  "feedback.error": { en: "Something went wrong. Please try again.", da: "Noget gik galt. Prøv venligst igen." },

  // Accuracy report (Results page)
  "accuracy.title": { en: "Help us improve", da: "Hjælp os med at forbedre" },
  "accuracy.desc": {
    en: "Know your actual net pay? Share it anonymously so we can improve our calculations.",
    da: "Kender du din faktiske nettoløn? Del den anonymt, så vi kan forbedre vores beregninger.",
  },
  "accuracy.actual.label": { en: "My actual net pay", da: "Min faktiske nettoløn" },
  "accuracy.actual.placeholder": { en: "e.g. 28500", da: "f.eks. 28500" },
  "accuracy.consent": {
    en: "I agree to anonymously share the inputs I entered along with my actual net pay to help improve accuracy.",
    da: "Jeg accepterer at dele mine indtastninger anonymt sammen med min faktiske nettoløn for at forbedre præcisionen.",
  },
  "accuracy.submit": { en: "Submit report", da: "Indsend rapport" },
  "accuracy.success": { en: "Thank you! Your data will help improve future estimates.", da: "Tak! Dine data vil hjælpe med at forbedre fremtidige estimater." },
  "accuracy.per_month": { en: "kr/month", da: "kr/md" },

  // ── Wizard ─────────────────────────────────────────────────────
  "wizard.fulltime.title": { en: "Full-time salary", da: "Fuldtidsløn" },
  "wizard.parttime.title": { en: "Part-time / hourly", da: "Deltid / timeløn" },
  "wizard.student.title": { en: "Student (SU + work)", da: "Studerende (SU + arbejde)" },

  // Steps
  "step.income": { en: "Income", da: "Indkomst" },
  "step.location": { en: "Location & tax", da: "Bopæl & skat" },
  "step.pension": { en: "Pension & extras", da: "Pension & tillæg" },
  "step.review": { en: "Review", da: "Gennemse" },
  "step.work": { en: "Work", da: "Arbejde" },
  "step.education": { en: "Education & SU", da: "Uddannelse & SU" },
  "step.workLocation": { en: "Work & location", da: "Arbejde & bopæl" },
  "step.pensionOnly": { en: "Pension", da: "Pension" },

  // Income input
  "input.mode.annual": { en: "Annual", da: "Årlig" },
  "input.mode.monthly": { en: "Monthly", da: "Månedlig" },
  "input.grossAnnual": { en: "Gross annual salary (DKK)", da: "Bruttoårsløn (DKK)" },
  "input.grossAnnual.tip": {
    en: "The number on your contract. Find it on your lønseddel as 'Årsløn' or 'Grundløn × 12'. Do NOT subtract pension or tax — we handle that.",
    da: "Tallet i din kontrakt. Find det på din lønseddel som 'Årsløn' eller 'Grundløn × 12'. Træk IKKE pension eller skat fra — det gør vi.",
  },
  "input.grossMonthly": { en: "Gross monthly salary (DKK)", da: "Bruttomånedsløn (DKK)" },
  "input.grossMonthly.tip": {
    en: "Your monthly salary as shown on your contract. Before pension, tax, and any other deductions. We'll multiply by 12.",
    da: "Din månedsløn som vist i din kontrakt. Før pension, skat og andre fradrag. Vi ganger med 12.",
  },
  "input.hourlyRate": { en: "Hourly rate (DKK/hour)", da: "Timeløn (DKK/time)" },
  "input.hourlyRate.tip": {
    en: "Your agreed hourly pay before tax. Check your contract or lønseddel under 'Timeløn'. Typical range: 130–250 DKK.",
    da: "Din aftalte timeløn før skat. Tjek din kontrakt eller lønseddel under 'Timeløn'. Typisk interval: 130–250 DKK.",
  },
  "input.hoursMonth": { en: "Hours per month", da: "Timer pr. måned" },
  "input.hoursMonth.tip": {
    en: "How many hours you work per month on average. Examples: 40 h = ~10 h/week, 80 h = ~20 h/week, 160 h = full-time (37 h/week).",
    da: "Hvor mange timer du arbejder pr. måned i gennemsnit. Eksempler: 40 t = ~10 t/uge, 80 t = ~20 t/uge, 160 t = fuldtid (37 t/uge).",
  },

  // Student work input mode
  "input.student.workMode.hourly": { en: "Hourly rate × hours", da: "Timeløn × timer" },
  "input.student.workMode.monthly": { en: "Fixed monthly", da: "Fast månedlig" },
  "input.student.workGross": { en: "Gross work income (DKK/month)", da: "Bruttoindkomst fra arbejde (DKK/md)" },
  "input.student.workGross.tip": {
    en: "Your monthly earnings from part-time work before tax.",
    da: "Din månedlige indkomst fra studiejob før skat.",
  },

  // Student education
  "input.eduType": { en: "Education type", da: "Uddannelsestype" },
  "input.eduType.tip": {
    en: "Affects how much you can earn before repaying SU. Higher education (uni, college) = lower fribeløb. Youth education (gymnasium, HHX, HTX) = higher fribeløb.",
    da: "Påvirker hvor meget du kan tjene før du skal tilbagebetale SU. Videregående (uni, college) = lavere fribeløb. Ungdomsudd. (gymnasium, HHX, HTX) = højere fribeløb.",
  },
  "input.eduType.vid": { en: "Higher education", da: "Videregående" },
  "input.eduType.vid.sub": { en: "Videregående", da: "University, college" },
  "input.eduType.ungdom": { en: "Youth education", da: "Ungdomsuddannelse" },
  "input.eduType.ungdom.sub": { en: "Ungdomsuddannelse", da: "Gymnasium, HHX, HTX" },

  "input.living": { en: "Living situation", da: "Bopælsforhold" },
  "input.living.tip": {
    en: "Living away from parents = ~7,400 kr/month SU. Living with parents = ~2,900 kr/month. You must be registered at a separate address to qualify as udeboende.",
    da: "Udeboende = ~7.400 kr/md i SU. Hjemmeboende = ~2.900 kr/md. Du skal være registreret på en selvstændig adresse for at være udeboende.",
  },
  "input.living.ude": { en: "Living away", da: "Udeboende" },
  "input.living.ude.sub": { en: "Udeboende", da: "Living away from parents" },
  "input.living.hjemme": { en: "With parents", da: "Hjemmeboende" },
  "input.living.hjemme.sub": { en: "Hjemmeboende", da: "Living with parents" },

  "input.children": { en: "Children under 18", da: "Børn under 18" },
  "input.children.tip": {
    en: "Each child increases your annual fribeløb by 34,921 kr.",
    da: "Hvert barn forhøjer dit årlige fribeløb med 34.921 kr.",
  },
  "input.suMonths": { en: "SU months", da: "SU-måneder" },
  "input.suMonths.tip": {
    en: "Months you receive SU this year (laveste fribeløb rate).",
    da: "Måneder du modtager SU i år (laveste fribeløbssats).",
  },
  "input.optedOut": { en: "Opted out months", da: "Fravalgte måneder" },
  "input.optedOut.tip": {
    en: "Months enrolled but no SU (mellemste fribeløb rate). Rest = højeste.",
    da: "Måneder indskrevet uden SU (mellemste fribeløbssats). Resten = højeste.",
  },

  // Student periodisering
  "input.studyPeriod": { en: "Study period this year", da: "Studieperiode i år" },
  "input.studyPeriod.tip": {
    en: "If you start or finish education mid-year, only months you're enrolled count for fribeløb. This can save you from repayment.",
    da: "Hvis du starter eller afslutter uddannelse midt i året, tæller kun de måneder du er indskrevet med i fribeløbet. Det kan forhindre tilbagebetaling.",
  },
  "input.studyPeriod.full": { en: "Full year (Jan – Dec)", da: "Hele året (jan – dec)" },
  "input.studyPeriod.start": { en: "Starting mid-year", da: "Starter midt i året" },
  "input.studyPeriod.finish": { en: "Finishing mid-year", da: "Afslutter midt i året" },
  "input.studyPeriod.startMonth": { en: "Start month", da: "Startmåned" },
  "input.studyPeriod.endMonth": { en: "End month", da: "Slutmåned" },

  // Municipality
  "input.kommune": { en: "Municipality", da: "Kommune" },
  "input.kommune.tip": {
    en: "Your tax municipality = where you live on Jan 1st. Each kommune has a different tax rate (22–27%). Check your skatteoplysninger or look at your lønseddel.",
    da: "Din skattekommune = hvor du bor den 1. januar. Hver kommune har en forskellig skatteprocent (22–27 %). Tjek dine skatteoplysninger eller din lønseddel.",
  },
  "input.church": { en: "Church member", da: "Folkekirkemedlem" },
  "input.church.sub": { en: "Folkekirken", da: "Folkekirken" },
  "input.church.tip": {
    en: "If you're a member of the Danish national church (folkekirken), you pay an extra 0.4–1.3% tax. Check your trækopgørelse — if kirkeskat is listed, you're a member.",
    da: "Hvis du er medlem af folkekirken, betaler du 0,4–1,3 % ekstra i skat. Tjek din trækopgørelse — hvis kirkeskat er anført, er du medlem.",
  },

  // Pension
  "input.pension.title": { en: "Pension", da: "Pension" },
  "input.pension.desc": {
    en: "Typical split: 4% employee + 8% employer. Set both to 0 if none.",
    da: "Typisk fordeling: 4% medarbejder + 8% arbejdsgiver. Sæt begge til 0 hvis ingen.",
  },
  "input.pension.yours": { en: "Your contribution (%)", da: "Dit bidrag (%)" },
  "input.pension.yours.tip": {
    en: "Your share, deducted from gross pay. Check your lønseddel or contract — look for 'Pensionsbidrag medarbejder'. Common: 4%. Set to 0 if you have no pension scheme.",
    da: "Din andel, fratrukket bruttolønnen. Tjek din lønseddel eller kontrakt — se efter 'Pensionsbidrag medarbejder'. Typisk: 4 %. Sæt til 0 hvis ingen pension.",
  },
  "input.pension.employer": { en: "Employer on top (%)", da: "Arbejdsgiver oveni (%)" },
  "input.pension.employer.tip": {
    en: "Paid by your employer on top of your salary — goes straight to your pension fund. Not taxed now. Check your lønseddel for 'Pensionsbidrag arbejdsgiver'. Common: 8%.",
    da: "Betales af din arbejdsgiver oveni din løn — går direkte til din pensionskasse. Beskattes ikke nu. Tjek din lønseddel for 'Pensionsbidrag arbejdsgiver'. Typisk: 8 %.",
  },

  // ATP
  "input.atp": { en: "ATP", da: "ATP" },
  "input.atp.sub": { en: "Arbejdsmarkedets Tillægspension", da: "Labour-market supplementary pension" },
  "input.atp.tip": {
    en: "Mandatory pension contribution. Your share is ~95 kr/month (full-time). Check your lønseddel — look for 'ATP' in the deduction lines. Your employer also pays ~190 kr on top.",
    da: "Obligatorisk pensionsbidrag. Din andel er ~95 kr/md (fuldtid). Tjek din lønseddel — find 'ATP' i fradragslinjerne. Din arbejdsgiver betaler også ~190 kr oveni.",
  },

  // Extras
  "input.extras.title": { en: "Pay, benefits & deductions", da: "Løn, goder & fradrag" },
  "input.extras.optional": { en: "Optional", da: "Valgfrit" },
  "input.otherPay": { en: "Other pay (DKK/month)", da: "Anden løn (DKK/md)" },
  "input.otherPay.tip": {
    en: "Monthly cash you receive on top of base salary. Examples: broadband allowance (~500 kr), regular bonus, transport allowance. Look for extra cash lines on your lønseddel.",
    da: "Månedlig kontant udover grundløn. Eksempler: bredbåndstilskud (~500 kr), fast bonus, transporttilskud. Se efter ekstra kontantposter på din lønseddel.",
  },
  "input.taxBenefits": { en: "Taxable benefits (DKK/month)", da: "Skattepligtige personalegoder (DKK/md)" },
  "input.taxBenefits.tip": {
    en: "Benefits you don't receive as cash but still pay tax on. Check your lønseddel for lines like: fri telefon (~292 kr/mo), sundhedsforsikring (~200 kr/mo), firmabil. Enter the monthly taxable value.",
    da: "Goder du ikke modtager kontant, men stadig beskattes af. Tjek din lønseddel for poster som: fri telefon (~292 kr/md), sundhedsforsikring (~200 kr/md), firmabil. Angiv den månedlige skatteværdi.",
  },
  "input.pretaxDed": { en: "Pre-tax deductions (DKK/month)", da: "Fradrag før skat (DKK/md)" },
  "input.pretaxDed.tip": {
    en: "Amounts your employer deducts from your pay BEFORE calculating tax. Examples: DSB commuter card (~988 kr), company-paid insurance. Look for 'Fradrag før skat' on your lønseddel. Reduces your taxable income.",
    da: "Beløb din arbejdsgiver trækker fra din løn FØR skatteberegning. Eksempler: DSB pendlerkort (~988 kr), firmabetalt forsikring. Se efter 'Fradrag før skat' på din lønseddel. Reducerer din skattepligtige indkomst.",
  },
  "input.aftertaxDed": { en: "After-tax deductions (DKK/month)", da: "Fradrag efter skat (DKK/md)" },
  "input.aftertaxDed.tip": {
    en: "Amounts your employer deducts AFTER tax is calculated. Examples: canteen/frokostordning (300–600 kr), gym membership, parking. Look for 'Fradrag efter skat' on your lønseddel. Does NOT save you tax — just reduces your payout.",
    da: "Beløb din arbejdsgiver trækker EFTER skat er beregnet. Eksempler: frokostordning (300–600 kr), fitness, parkering. Se efter 'Fradrag efter skat' på din lønseddel. Sparer IKKE skat — reducerer kun din udbetaling.",
  },
  "input.personalDeductions": { en: "Personal tax deductions", da: "Personlige skattefradrag" },
  "input.transportKm": { en: "Daily round-trip commute (km)", da: "Daglig transport tur/retur (km)" },
  "input.transportKm.tip": {
    en: "Your daily ROUND-TRIP distance home ↔ work (both ways). Use Google Maps to check. Only kicks in above 24 km. Example: 40 km round-trip → 16 km × 1.98 kr × 218 days = ~6,900 kr/year deduction → saves ~1,800 kr in tax.",
    da: "Din daglige TUR/RETUR-afstand hjem ↔ arbejde (begge veje). Brug Google Maps til at tjekke. Gælder kun over 24 km. Eksempel: 40 km tur/retur → 16 km × 1,98 kr × 218 dage = ~6.900 kr/år fradrag → sparer ~1.800 kr i skat.",
  },
  "input.unionFees": { en: "Union + A-kasse fees (DKK/year)", da: "Fagforening + A-kasse (DKK/år)" },
  "input.unionFees.tip": {
    en: "Total yearly cost for trade union + A-kasse (unemployment insurance). Enter the combined annual amount. Max 7,000 kr is deductible. Example: IDA ~6,000 kr + A-kasse ~5,000 kr → enter 11,000 (capped at 7,000). Saves ~1,800 kr/year in tax.",
    da: "Samlet årlig udgift til fagforening + A-kasse (arbejdsløshedsforsikring). Angiv det samlede årsbeløb. Maks 7.000 kr er fradragsberettiget. Eksempel: IDA ~6.000 kr + A-kasse ~5.000 kr → skriv 11.000 (grænse 7.000). Sparer ~1.800 kr/år i skat.",
  },

  // Warnings
  "warn.atp.noHours": {
    en: "Below 9 hours/week — no ATP obligation. Your employer is not required to pay ATP.",
    da: "Under 9 timer/uge — ingen ATP-pligt. Din arbejdsgiver er ikke forpligtet til at betale ATP.",
  },
  "warn.atp.lowHours": {
    en: "Below 15 hours/week — check if your hourly rate meets the collective agreement minimum (overenskomst).",
    da: "Under 15 timer/uge — tjek om din timeløn opfylder overenskomstens mindsteløn.",
  },

  // Review
  "review.title": { en: "Review your inputs", da: "Gennemse dine indtastninger" },

  // Buttons
  "btn.home": { en: "Home", da: "Hjem" },
  "btn.back": { en: "Back", da: "Tilbage" },
  "btn.next": { en: "Next", da: "Næste" },
  "btn.calculate": { en: "Calculate", da: "Beregn" },
  "btn.calculating": { en: "Calculating…", da: "Beregner…" },
  "btn.adjust": { en: "Adjust & recalculate", da: "Justér & genberegn" },
  "btn.new": { en: "New calculation", da: "Ny beregning" },
  "btn.backHome": { en: "Back to home", da: "Tilbage til forsiden" },

  // ── Results page ───────────────────────────────────────────────
  "results.netMonthly": { en: "Estimated net monthly", da: "Estimeret nettomånedlig" },
  "results.netAnnual": { en: "Estimated net annual", da: "Estimeret nettoårlig" },
  "results.effRate": { en: "Eff. tax rate", da: "Eff. skatteprocent" },
  "results.monthly": { en: "Monthly", da: "Månedlig" },
  "results.annual": { en: "Annual", da: "Årlig" },
  "results.showEur": { en: "Show EUR", da: "Vis EUR" },
  "currency.clear": { en: "Back to DKK only", da: "Tilbage til kun DKK" },
  "currency.loading": { en: "Loading rates…", da: "Henter kurser…" },
  "currency.convert_to": { en: "Convert to", da: "Konvertér til" },
  "currency.source": { en: "Rates from ECB via Frankfurter", da: "Kurser fra ECB via Frankfurter" },
  "currency.error": { en: "Could not load rates", da: "Kunne ikke hente kurser" },
  "results.tab.breakdown": { en: "Breakdown", da: "Opgørelse" },
  "results.tab.charts": { en: "Charts", da: "Grafer" },
  "results.tab.pension": { en: "Pension", da: "Pension" },
  "results.tab.glossary": { en: "Glossary", da: "Ordliste" },
  "results.item": { en: "Item", da: "Post" },
  "results.annualDKK": { en: "Annual (DKK)", da: "Årlig (DKK)" },
  "results.monthlyDKK": { en: "Monthly (DKK)", da: "Månedlig (DKK)" },
  "results.netAnnualIncome": { en: "Net annual income", da: "Netto årsindkomst" },

  // Charts
  "chart.netVsGross": { en: "Net vs gross income", da: "Netto vs brutto indkomst" },
  "chart.netVsGross.desc": {
    en: "Monthly net income across different gross salary levels",
    da: "Månedlig nettoindkomst ved forskellige bruttolønniveauer",
  },
  "chart.netVsHours": { en: "Net income vs hours worked", da: "Nettoindkomst vs arbejdstimer" },

  // Pension tab
  "pension.accrual": { en: "Pension accrual", da: "Pensionsopsparing" },
  "pension.yours": { en: "Your contribution", da: "Dit bidrag" },
  "pension.employer": { en: "Employer on top", da: "Arbejdsgiver oveni" },
  "pension.total": { en: "Total pension", da: "Samlet pension" },

  // Ferie tab
  "results.tab.ferie": { en: "Vacation", da: "Ferie" },
  "ferie.title": { en: "Vacation accrual", da: "Ferieoptjening" },
  "ferie.daysPerYear": { en: "Days / year", da: "Dage / år" },
  "ferie.daysPerMonth": { en: "Days / month", da: "Dage / md" },
  "ferie.ferietillaeg": { en: "Ferietillæg (1%)", da: "Ferietillæg (1%)" },
  "ferie.feriepenge": { en: "Feriepenge (12.5%)", da: "Feriepenge (12,5%)" },
  "ferie.dailyRate": { en: "Daily vacation pay", da: "Daglig feriepenge" },
  "ferie.salaryNote": {
    en: "Salaried employees receive paid leave (ferie med løn) plus 1% ferietillæg on top of gross salary.",
    da: "Funktionærer modtager løn under ferie (ferie med løn) plus 1% ferietillæg oven i bruttolønnen.",
  },
  "ferie.hourlyNote": {
    en: "Hourly workers receive 12.5% of gross earnings as feriepenge, deposited to Feriekonto.",
    da: "Timelønnede modtager 12,5% af bruttoindtjening som feriepenge, indsat på Feriekonto.",
  },
  "ferie.studentNote": {
    en: "Student workers receive 12.5% of work income as feriepenge, deposited to Feriekonto.",
    da: "Studerende modtager 12,5% af arbejdsindkomst som feriepenge, indsat på Feriekonto.",
  },
  "ferie.rule": {
    en: "Everyone accrues 2.08 vacation days per month worked (25 days/year) under the Danish Holiday Act (Ferieloven).",
    da: "Alle optjener 2,08 feriedage pr. arbejdsmåned (25 dage/år) iht. Ferieloven.",
  },

  // Glossary
  "glossary.title": { en: "Tax glossary — what each term means", da: "Skatteordliste — hvad hvert begreb betyder" },

  // Fribeloeb status
  "fribeloeb.title": { en: "Fribeløb status", da: "Fribeløb-status" },
  "fribeloeb.egenindkomst": { en: "Egenindkomst (work after AM)", da: "Egenindkomst (arbejde efter AM)" },

  // Disclaimer
  "disclaimer": {
    en: "All calculations use official SKAT 2026 rates — bundskat 12.01%, AM-bidrag 8%, personfradrag 54,100 kr/year.",
    da: "Alle beregninger bruger officielle SKAT 2026-satser — bundskat 12,01%, AM-bidrag 8%, personfradrag 54.100 kr/år.",
  },

  // Months
  "month.1": { en: "January", da: "Januar" },
  "month.2": { en: "February", da: "Februar" },
  "month.3": { en: "March", da: "Marts" },
  "month.4": { en: "April", da: "April" },
  "month.5": { en: "May", da: "Maj" },
  "month.6": { en: "June", da: "Juni" },
  "month.7": { en: "July", da: "Juli" },
  "month.8": { en: "August", da: "August" },
  "month.9": { en: "September", da: "September" },
  "month.10": { en: "October", da: "Oktober" },
  "month.11": { en: "November", da: "November" },
  "month.12": { en: "December", da: "December" },

  // Student EU worker hours warning
  "input.student.euWorkerWarning": {
    en: "EU/EEA citizens must work at least 10-12 hours/week (~43-52 hours/month) to qualify as an EU worker and be eligible for SU. Working fewer hours may mean you lose your SU grant.",
    da: "EU/EØS-borgere skal arbejde mindst 10-12 timer/uge (ca. 43-52 timer/md) for at opnå arbejdstagerstatus efter EU-retten og være berettiget til SU. Ved færre timer risikerer du at miste din SU.",
  },

  // Student pension step
  "input.student.pension.desc": {
    en: "Most students don't have pension. If your employer contributes, enter the percentages below.",
    da: "De fleste studerende har ikke pension. Hvis din arbejdsgiver bidrager, indtast procenterne herunder.",
  },

  // Quick overview
  "overview.title": { en: "Gross → Net at a glance", da: "Brutto → Netto overblik" },
  "overview.subtitle": {
    en: "See roughly how much net salary you keep at different gross income levels under standard conditions.",
    da: "Se omtrent hvor meget nettoløn du beholder ved forskellige bruttoindkomstniveauer under standardforhold.",
  },
  "overview.warning": {
    en: "This is a rough estimate only — your actual net income depends on many personal factors not accounted for here.",
    da: "Dette er kun et groft estimat — din faktiske nettoindkomst afhænger af mange personlige faktorer, der ikke er medregnet her.",
  },
  "overview.assumptions": {
    en: "Factors that can change your result:",
    da: "Faktorer der kan ændre dit resultat:",
  },
  "overview.factor.kommune": {
    en: "Your kommune tax rate (varies from ~23% to ~27%)",
    da: "Din kommuneskatteprocent (varierer fra ca. 23% til ca. 27%)",
  },
  "overview.factor.pension": {
    en: "Pension contribution percentage and split",
    da: "Pensionsbidragsprocent og fordeling",
  },
  "overview.factor.extras": {
    en: "Additional compensation (bonuses, allowances, 13th month)",
    da: "Ekstra kompensation (bonus, tillæg, 13. månedsløn)",
  },
  "overview.factor.benefits": {
    en: "Taxable benefits (company car, phone, lunch scheme, etc.)",
    da: "Skattepligtige personalegoder (firmabil, telefon, frokostordning osv.)",
  },
  "overview.factor.church": {
    en: "Whether you pay church tax (kirkeskat)",
    da: "Om du betaler kirkeskat",
  },
  "overview.factor.atp": {
    en: "ATP contributions and employment type",
    da: "ATP-bidrag og ansættelsestype",
  },
  "overview.factor.deductions": {
    en: "Personal deductions (transport, union fees, interest, etc.)",
    da: "Personlige fradrag (transport, fagforeningskontingent, renteudgifter osv.)",
  },
  "overview.conditions": {
    en: "Standard conditions used for this chart:",
    da: "Standardforudsætninger brugt i denne graf:",
  },
  "overview.chartTitle": { en: "Net vs gross monthly income", da: "Netto vs brutto månedlig indkomst" },
  "overview.chartDesc": {
    en: "The dashed line shows gross income (no tax). The solid line shows your estimated net take-home pay.",
    da: "Den stiplede linje viser bruttoindkomst (ingen skat). Den fuldt optrukne linje viser din anslåede nettoudbetaling.",
  },
  "overview.rateTable": {
    en: "Effective tax rate at different income levels",
    da: "Effektiv skatteprocent ved forskellige indkomstniveauer",
  },
  "overview.cta": {
    en: "Calculate with your exact numbers →",
    da: "Beregn med dine præcise tal →",
  },
  "overview.link": {
    en: "Quick gross → net overview",
    da: "Hurtigt brutto → netto overblik",
  },
} as const;

export type TranslationKey = keyof typeof translations;

// ── Context ──────────────────────────────────────────────────────────

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dk-income-lang");
      if (saved === "da" || saved === "en") return saved;
    }
    return "en";
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("dk-income-lang", newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.en || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
