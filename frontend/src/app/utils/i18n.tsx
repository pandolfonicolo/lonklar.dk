import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Supported languages ──────────────────────────────────────────────

export type Lang = "en" | "da";

// ── Translation keys ─────────────────────────────────────────────────
// Convention: English is the primary display language.
// Danish terms appear as subtitles/parentheticals in EN mode.
// In DA mode everything is in Danish with English parentheticals for clarity.

const translations = {
  // ── Global / nav ───────────────────────────────────────────────
  "nav.methodology": { en: "Methodology", da: "Metode" },
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
  "home.fulltime.title": { en: "Full-time salary", da: "Fuldtidsløn" },
  "home.fulltime.subtitle": { en: "Fuldtidsløn", da: "Full-time salary" },
  "home.fulltime.desc": {
    en: "Monthly salaried position: pension, AM-bidrag, feriepenge and every tax bracket, calculated in seconds.",
    da: "Fuldtidsstilling med fast månedsløn: pension, AM-bidrag, feriepenge og alle skattetrin, beregnet på sekunder.",
  },
  "home.parttime.title": { en: "Part-time / hourly", da: "Deltid / timeløn" },
  "home.parttime.subtitle": { en: "Deltid / timeløn", da: "Part-time / hourly" },
  "home.parttime.desc": {
    en: "Paid by the hour? Enter your rate and weekly hours to see take-home pay with 12.5% feriepenge.",
    da: "Betalt pr. time? Indtast din timeløn og ugentlige timer for at se din udbetaling inkl. 12,5% feriepenge.",
  },
  "home.student.title": { en: "Student (SU + work)", da: "Studerende (SU + arbejde)" },
  "home.student.subtitle": { en: "Studerende (SU + arbejde)", da: "Student (SU + work)" },
  "home.student.desc": {
    en: "SU grant plus part-time work. Track your fribeløb limit and avoid repayment surprises.",
    da: "SU kombineret med studiejob. Hold styr på dit fribeløb og undgå tilbagebetalingsoverraskelser.",
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
    en: "Your total yearly salary before any deductions (pension, tax, etc.).",
    da: "Din samlede årsløn før fradrag (pension, skat, osv.).",
  },
  "input.grossMonthly": { en: "Gross monthly salary (DKK)", da: "Bruttomånedsløn (DKK)" },
  "input.grossMonthly.tip": {
    en: "Your monthly salary before any deductions.",
    da: "Din månedsløn før fradrag.",
  },
  "input.hourlyRate": { en: "Hourly rate (DKK/hour)", da: "Timeløn (DKK/time)" },
  "input.hourlyRate.tip": {
    en: "Your gross hourly rate before any deductions.",
    da: "Din bruttotimeløn før fradrag.",
  },
  "input.hoursMonth": { en: "Hours per month", da: "Timer pr. måned" },
  "input.hoursMonth.tip": {
    en: "Average working hours per month. Full-time (37 h/week) ≈ 160 h/month.",
    da: "Gennemsnitlige arbejdstimer pr. måned. Fuldtid (37 t/uge) ≈ 160 t/måned.",
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
    en: "Determines your fribeløb rate. Videregående = university/college. Ungdomsuddannelse = gymnasium/HHX/HTX etc.",
    da: "Bestemmer dit fribeløb. Videregående = universitet/professionshøjskole. Ungdomsuddannelse = gymnasium/HHX/HTX osv.",
  },
  "input.eduType.vid": { en: "Higher education", da: "Videregående" },
  "input.eduType.vid.sub": { en: "Videregående", da: "University, college" },
  "input.eduType.ungdom": { en: "Youth education", da: "Ungdomsuddannelse" },
  "input.eduType.ungdom.sub": { en: "Ungdomsuddannelse", da: "Gymnasium, HHX, HTX" },

  "input.living": { en: "Living situation", da: "Bopælsforhold" },
  "input.living.tip": {
    en: "Udeboende (living away from parents) receive higher SU.",
    da: "Udeboende (bor ikke hos forældre) modtager højere SU.",
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
    en: "Determines your kommuneskat and kirkeskat rates.",
    da: "Bestemmer din kommuneskat og kirkeskat.",
  },
  "input.church": { en: "Church member", da: "Folkekirkemedlem" },
  "input.church.sub": { en: "Folkekirken", da: "Folkekirken" },
  "input.church.tip": {
    en: "Uncheck to opt out of kirkeskat (church tax, 0.4–1.3%).",
    da: "Fjern flueben for at fravælge kirkeskat (0,4–1,3%).",
  },

  // Pension
  "input.pension.title": { en: "Pension", da: "Pension" },
  "input.pension.desc": {
    en: "Typical split: 4% employee + 8% employer. Set both to 0 if none.",
    da: "Typisk fordeling: 4% medarbejder + 8% arbejdsgiver. Sæt begge til 0 hvis ingen.",
  },
  "input.pension.yours": { en: "Your contribution (%)", da: "Dit bidrag (%)" },
  "input.pension.yours.tip": {
    en: "Deducted from gross salary before tax. Reduces taxable income and builds your pension.",
    da: "Fratrukket bruttoløn før skat. Reducerer skattepligtig indkomst og opbygger din pension.",
  },
  "input.pension.employer": { en: "Employer on top (%)", da: "Arbejdsgiver oveni (%)" },
  "input.pension.employer.tip": {
    en: "Goes to your pension fund, not part of your taxable income. It's free money for your retirement.",
    da: "Går til din pensionskasse, ikke en del af din skattepligtige indkomst. Det er frie penge til din pension.",
  },

  // ATP
  "input.atp": { en: "ATP", da: "ATP" },
  "input.atp.sub": { en: "Arbejdsmarkedets Tillægspension", da: "Labour-market supplementary pension" },
  "input.atp.tip": {
    en: "ATP is a mandatory supplementary pension for most employees. Employee pays ~95 kr/month for full-time, employer pays 2× on top.",
    da: "ATP er en obligatorisk tillægspension for de fleste lønmodtagere. Medarbejder betaler ~95 kr/md for fuldtid, arbejdsgiver betaler 2× oveni.",
  },

  // Extras
  "input.extras.title": { en: "Pay, benefits & deductions", da: "Løn, goder & fradrag" },
  "input.extras.optional": { en: "Optional", da: "Valgfrit" },
  "input.otherPay": { en: "Other pay (DKK/month)", da: "Anden løn (DKK/md)" },
  "input.otherPay.tip": {
    en: "Extra cash on top of base salary — internet/broadband allowance, average bonus, transport allowance, etc.",
    da: "Ekstra kontant udover grundløn — internet-/bredbåndstilskud, gennemsnitlig bonus, transporttilskud, osv.",
  },
  "input.taxBenefits": { en: "Taxable benefits (DKK/month)", da: "Skattepligtige personalegoder (DKK/md)" },
  "input.taxBenefits.tip": {
    en: "Non-cash benefits: fri telefon (3,500 kr/year), sundhedsforsikring, firmabil, etc. You don't receive cash but pay tax on the value.",
    da: "Personalegoder: fri telefon (3.500 kr/år), sundhedsforsikring, firmabil osv. Du modtager ikke kontanter, men beskattes af værdien.",
  },
  "input.pretaxDed": { en: "Pre-tax deductions (DKK/month)", da: "Fradrag før skat (DKK/md)" },
  "input.pretaxDed.tip": {
    en: "Amounts deducted before tax: DSB commuter card, fagforening (union dues, up to 7,000 kr/year deductible), etc. Reduces your taxable income.",
    da: "Beløb fratrukket før skat: DSB pendlerkort, fagforening (op til 7.000 kr/år fradragsberettiget) osv. Reducerer din skattepligtige indkomst.",
  },
  "input.aftertaxDed": { en: "After-tax deductions (DKK/month)", da: "Fradrag efter skat (DKK/md)" },
  "input.aftertaxDed.tip": {
    en: "Amounts deducted after tax: frokostordning (canteen, typically 300–600 kr), fitness, parking. Does not reduce tax — only take-home pay.",
    da: "Beløb fratrukket efter skat: frokostordning (typisk 300–600 kr), fitness, parkering. Reducerer ikke skat — kun udbetaling.",
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
