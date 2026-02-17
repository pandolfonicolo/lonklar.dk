import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Supported languages ──────────────────────────────────────────────

export type Lang = "en" | "da" | "it" | "de";

// ── Translation keys ─────────────────────────────────────────────────
// Convention: English is the primary display language.
// Danish terms appear as subtitles/parentheticals in EN mode.
// In DA mode everything is in Danish with English parentheticals for clarity.

const translations = {
  // ── Global / nav ───────────────────────────────────────────────
  "nav.methodology": { en: "How it works", da: "Sådan fungerer det", it: "Come funziona", de: "So funktioniert es" },
  "nav.feedback": { en: "Feedback", da: "Feedback", it: "Feedback", de: "Feedback" },
  "nav.language": { en: "DA", da: "EN", it: "EN", de: "EN" },

  // ── Home page ──────────────────────────────────────────────────
  "home.hero.title": {
    en: "Your Danish salary,\nclearly explained",
    da: "Din danske løn,\ntydeligt forklaret",
    it: "Il tuo stipendio danese,\nspiegato chiaramente",
    de: "Dein dänisches Gehalt,\nklar erklärt",
  },
  "home.hero.subtitle": {
    en: "Accurate tax breakdown for any employment type. Aligned with SKAT 2026 rates, always free, always private.",
    da: "Præcis skatteberegning for enhver ansættelsestype. Baseret på SKAT 2026-satser, altid gratis, altid privat.",
    it: "Calcolo fiscale preciso per qualsiasi tipo di impiego. Allineato alle aliquote SKAT 2026, sempre gratuito, sempre privato.",
    de: "Genaue Steueraufschlüsselung für jede Beschäftigungsart. Basierend auf SKAT 2026-Sätzen, immer kostenlos, immer privat.",
  },
  "home.hero.disclaimer_ref": {
    en: "Estimates only, no guarantees. Your feedback helps.",
    da: "Kun estimater, ingen garanti. Din feedback hjælper.",
    it: "Solo stime, nessuna garanzia. Il tuo feedback è utile.",
    de: "Nur Schätzungen, keine Garantie. Dein Feedback hilft.",
  },

  // Trust signals (inline hero)
  "home.trust.noads": { en: "No ads or tracking", da: "Ingen reklamer eller sporing", it: "Nessuna pubblicità né tracciamento", de: "Keine Werbung oder Tracking" },
  "home.trust.transparent": { en: "Open & transparent", da: "Åben og gennemsigtig", it: "Aperto e trasparente", de: "Offen und transparent" },
  "home.trust.skat": { en: "SKAT 2026 aligned", da: "SKAT 2026-baseret", it: "Allineato a SKAT 2026", de: "SKAT 2026 konform" },

  // Section heading above cards
  "home.cards.heading": { en: "Choose your calculator", da: "Vælg din beregner", it: "Scegli il calcolatore", de: "Wähle deinen Rechner" },

  // Service cards
  "home.fulltime.title": { en: "Full-time job", da: "Fuldtidsjob", it: "Lavoro full-time", de: "Vollzeitjob" },
  "home.fulltime.subtitle": { en: "Fuldtidsløn", da: "Full-time salary", it: "Stipendio mensile", de: "Monatsgehalt" },
  "home.fulltime.desc": {
    en: "Monthly salaried position: pension, AM-bidrag, feriepenge and every tax bracket, calculated in seconds.",
    da: "Fuldtidsstilling med fast månedsløn: pension, AM-bidrag, feriepenge og alle skattetrin, beregnet på sekunder.",
    it: "Posizione a stipendio mensile: pensione, AM-bidrag, feriepenge e tutti gli scaglioni fiscali, calcolati in pochi secondi.",
    de: "Monatliche Festanstellung: Rente, AM-Beitrag, Urlaubsgeld und alle Steuerstufen, in Sekunden berechnet.",
  },
  "home.parttime.title": { en: "Part-time job", da: "Deltidsjob", it: "Lavoro part-time", de: "Teilzeitjob" },
  "home.parttime.subtitle": { en: "Deltid / timeløn", da: "Part-time / hourly", it: "Part-time / a ore", de: "Teilzeit / Stundenlohn" },
  "home.parttime.desc": {
    en: "Know your hourly rate and weekly hours? See your real take-home pay including 12.5% feriepenge and all deductions.",
    da: "Kender du din timeløn og ugentlige timer? Se din reelle udbetaling inkl. 12,5% feriepenge og alle fradrag.",
    it: "Conosci la tua paga oraria e le ore settimanali? Vedi il tuo netto reale incluso il 12,5% di feriepenge e tutte le deduzioni.",
    de: "Kennst du deinen Stundenlohn und die wöchentlichen Stunden? Sieh dein tatsächliches Nettogehalt inkl. 12,5% Urlaubsgeld und aller Abzüge.",
  },
  "home.student.title": { en: "Student job", da: "Studiejob", it: "Lavoro studentesco", de: "Studentenjob" },
  "home.student.subtitle": { en: "Studerende (SU + arbejde)", da: "Student (SU + work)", it: "Studente (SU + lavoro)", de: "Student (SU + Arbeit)" },
  "home.student.desc": {
    en: "Combine your SU grant with a student job. See your total income and check how close you are to the fribeløb limit.",
    da: "Kombiner din SU med et studiejob. Se din samlede indkomst og tjek hvor tæt du er på fribeløbsgrænsen.",
    it: "Combina la borsa SU con un lavoro studentesco. Vedi il tuo reddito totale e controlla quanto sei vicino al limite del fribeløb.",
    de: "Kombiniere dein SU-Stipendium mit einem Studentenjob. Sieh dein Gesamteinkommen und prüfe, wie nah du am Freibetrag bist.",
  },

  // How it works
  "home.how.title": { en: "How it works", da: "Sådan virker det", it: "Come funziona", de: "So funktioniert es" },
  "home.how.step1.title": { en: "Choose your situation", da: "Vælg din situation", it: "Scegli la tua situazione", de: "Wähle deine Situation" },
  "home.how.step1.desc": {
    en: "Are you salaried, paid hourly, or a student with SU? Pick the calculator that fits.",
    da: "Er du fastansat, timelønnet eller studerende med SU? Vælg den beregner der passer.",
    it: "Sei stipendiato, pagato a ore o studente con SU? Scegli il calcolatore adatto.",
    de: "Bist du festangestellt, Stundenlöhner oder Student mit SU? Wähle den passenden Rechner.",
  },
  "home.how.step2.title": { en: "Fill in a few numbers", da: "Indtast et par tal", it: "Inserisci alcuni numeri", de: "Gib ein paar Zahlen ein" },
  "home.how.step2.desc": {
    en: "Gross salary, pension split, municipality. A short form, nothing more.",
    da: "Bruttoløn, pensionsfordeling, kommune. En kort formular, intet mere.",
    it: "Stipendio lordo, ripartizione pensione, comune. Un breve modulo, nient'altro.",
    de: "Bruttogehalt, Rentenaufteilung, Kommune. Ein kurzes Formular, mehr nicht.",
  },
  "home.how.step3.title": { en: "Get your estimate", da: "Få dit estimat", it: "Ottieni la tua stima", de: "Erhalte deine Schätzung" },
  "home.how.step3.desc": {
    en: "See a detailed breakdown of deductions, net pay, and effective tax rate. Instantly.",
    da: "Se en detaljeret opgørelse af fradrag, nettoløn og effektiv skattesats. Med det samme.",
    it: "Vedi una ripartizione dettagliata delle deduzioni, stipendio netto e aliquota fiscale effettiva. Istantaneamente.",
    de: "Sieh eine detaillierte Aufschlüsselung der Abzüge, Nettogehalt und effektiven Steuersatz. Sofort.",
  },
  "home.footer": {
    en: "© 2026 udbetalt.dk. All calculations are indicative and provided without guarantee.",
    da: "© 2026 udbetalt.dk. Alle beregninger er vejledende og uden garanti.",
    it: "© 2026 udbetalt.dk. Tutti i calcoli sono indicativi e forniti senza garanzia.",
    de: "© 2026 udbetalt.dk. Alle Berechnungen sind indikativ und ohne Gewähr.",
  },

  // Disclaimer banner (homepage)
  "home.disclaimer": {
    en: "This is a personal project built in my spare time. I strive for accuracy but take no responsibility for the results. If you spot an error or have a suggestion, I'd love to hear from you.",
    da: "Dette er et personligt projekt bygget i min fritid. Jeg stræber efter præcision, men tager intet ansvar for resultaterne. Har du fundet en fejl eller har et forslag, hører jeg gerne fra dig.",
    it: "Questo è un progetto personale costruito nel mio tempo libero. Mi impegno per la precisione ma non mi assumo responsabilità per i risultati. Se trovi un errore o hai un suggerimento, mi farebbe piacere sentirti.",
    de: "Dies ist ein persönliches Projekt, das in meiner Freizeit erstellt wurde. Ich strebe nach Genauigkeit, übernehme aber keine Verantwortung für die Ergebnisse. Wenn du einen Fehler findest oder einen Vorschlag hast, freue ich mich über deine Nachricht.",
  },
  "home.disclaimer.cta": {
    en: "Give feedback",
    da: "Giv feedback",
    it: "Invia feedback",
    de: "Feedback geben",
  },

  // Feedback page
  "feedback.title": { en: "Feedback", da: "Feedback", it: "Feedback", de: "Feedback" },
  "feedback.subtitle": {
    en: "Help improve udbetalt.dk: report errors, suggest features, or share your experience.",
    da: "Hjælp med at forbedre udbetalt.dk: rapportér fejl, foreslå funktioner, eller del din oplevelse.",
    it: "Aiuta a migliorare udbetalt.dk: segnala errori, suggerisci funzionalità o condividi la tua esperienza.",
    de: "Hilf udbetalt.dk zu verbessern: melde Fehler, schlage Funktionen vor oder teile deine Erfahrung.",
  },
  "feedback.type.label": { en: "What kind of feedback?", da: "Hvilken type feedback?", it: "Che tipo di feedback?", de: "Welche Art von Feedback?" },
  "feedback.type.bug": { en: "Bug / incorrect result", da: "Fejl / forkert resultat", it: "Bug / risultato errato", de: "Fehler / falsches Ergebnis" },
  "feedback.type.feature": { en: "Feature suggestion", da: "Funktionsforslag", it: "Suggerimento funzionalità", de: "Funktionsvorschlag" },
  "feedback.type.general": { en: "General comment", da: "Generel kommentar", it: "Commento generale", de: "Allgemeiner Kommentar" },
  "feedback.message.label": { en: "Your message", da: "Din besked", it: "Il tuo messaggio", de: "Deine Nachricht" },
  "feedback.message.placeholder": {
    en: "Describe the issue or suggestion…",
    da: "Beskriv problemet eller forslaget…",
    it: "Descrivi il problema o il suggerimento…",
    de: "Beschreibe das Problem oder den Vorschlag…",
  },
  "feedback.email.label": { en: "Email (optional)", da: "E-mail (valgfrit)", it: "Email (facoltativo)", de: "E-Mail (optional)" },
  "feedback.email.placeholder": { en: "In case I need to follow up", da: "Hvis jeg har behov for opfølgning", it: "Nel caso debba ricontattarti", de: "Falls ich nachfassen muss" },
  "feedback.submit": { en: "Send feedback", da: "Send feedback", it: "Invia feedback", de: "Feedback senden" },
  "feedback.success": { en: "Thank you! Your feedback has been received.", da: "Tak! Din feedback er modtaget.", it: "Grazie! Il tuo feedback è stato ricevuto.", de: "Danke! Dein Feedback wurde empfangen." },
  "feedback.error": { en: "Something went wrong. Please try again.", da: "Noget gik galt. Prøv venligst igen.", it: "Qualcosa è andato storto. Riprova.", de: "Etwas ist schiefgelaufen. Bitte versuche es erneut." },

  // Accuracy report (Results page)
  "accuracy.title": { en: "Help us improve", da: "Hjælp os med at forbedre", it: "Aiutaci a migliorare", de: "Hilf uns, besser zu werden" },
  "accuracy.desc": {
    en: "Know your actual net pay? Share it anonymously so we can improve our calculations.",
    da: "Kender du din faktiske nettoløn? Del den anonymt, så vi kan forbedre vores beregninger.",
    it: "Conosci il tuo stipendio netto effettivo? Condividilo in forma anonima per aiutarci a migliorare i calcoli.",
    de: "Kennst du dein tatsächliches Nettogehalt? Teile es anonym, damit wir unsere Berechnungen verbessern können.",
  },
  "accuracy.actual.label": { en: "My actual net pay", da: "Min faktiske nettoløn", it: "Il mio stipendio netto effettivo", de: "Mein tatsächliches Nettogehalt" },
  "accuracy.actual.placeholder": { en: "e.g. 28500", da: "f.eks. 28500", it: "es. 28500", de: "z.B. 28500" },
  "accuracy.consent": {
    en: "I agree to anonymously share the inputs I entered along with my actual net pay to help improve accuracy.",
    da: "Jeg accepterer at dele mine indtastninger anonymt sammen med min faktiske nettoløn for at forbedre præcisionen.",
    it: "Accetto di condividere in forma anonima i dati inseriti insieme al mio stipendio netto effettivo per migliorare la precisione.",
    de: "Ich stimme zu, meine Eingaben zusammen mit meinem tatsächlichen Nettogehalt anonym zu teilen, um die Genauigkeit zu verbessern.",
  },
  "accuracy.submit": { en: "Submit report", da: "Indsend rapport", it: "Invia rapporto", de: "Bericht einreichen" },
  "accuracy.success": { en: "Thank you! Your data will help improve future estimates.", da: "Tak! Dine data vil hjælpe med at forbedre fremtidige estimater.", it: "Grazie! I tuoi dati aiuteranno a migliorare le stime future.", de: "Danke! Deine Daten helfen, zukünftige Schätzungen zu verbessern." },
  "accuracy.per_month": { en: "kr/month", da: "kr/md", it: "kr/mese", de: "kr/Monat" },

  // ── Wizard ─────────────────────────────────────────────────────
  "wizard.fulltime.title": { en: "Full-time salary", da: "Fuldtidsløn", it: "Stipendio full-time", de: "Vollzeitgehalt" },
  "wizard.parttime.title": { en: "Part-time / hourly", da: "Deltid / timeløn", it: "Part-time / a ore", de: "Teilzeit / Stundenlohn" },
  "wizard.student.title": { en: "Student (SU + work)", da: "Studerende (SU + arbejde)", it: "Studente (SU + lavoro)", de: "Student (SU + Arbeit)" },

  // Steps
  "step.income": { en: "Income", da: "Indkomst", it: "Reddito", de: "Einkommen" },
  "step.location": { en: "Location & tax", da: "Bopæl & skat", it: "Residenza e tasse", de: "Wohnort & Steuer" },
  "step.pension": { en: "Pension & extras", da: "Pension & tillæg", it: "Pensione e extra", de: "Rente & Extras" },
  "step.review": { en: "Review", da: "Gennemse", it: "Riepilogo", de: "Überprüfung" },
  "step.work": { en: "Work", da: "Arbejde", it: "Lavoro", de: "Arbeit" },
  "step.education": { en: "Education & SU", da: "Uddannelse & SU", it: "Istruzione e SU", de: "Ausbildung & SU" },
  "step.workLocation": { en: "Work & location", da: "Arbejde & bopæl", it: "Lavoro e residenza", de: "Arbeit & Wohnort" },
  "step.pensionOnly": { en: "Pension", da: "Pension", it: "Pensione", de: "Rente" },

  // Income input
  "input.mode.annual": { en: "Annual", da: "Årlig", it: "Annuale", de: "Jährlich" },
  "input.mode.monthly": { en: "Monthly", da: "Månedlig", it: "Mensile", de: "Monatlich" },
  "input.grossAnnual": { en: "Gross annual salary (DKK)", da: "Bruttoårsløn (DKK)", it: "Stipendio annuo lordo (DKK)", de: "Bruttojahresgehalt (DKK)" },
  "input.grossAnnual.tip": {
    en: "The number on your contract. Find it on your lønseddel as 'Årsløn' or 'Grundløn × 12'. Do NOT subtract pension or tax — we handle that.",
    da: "Tallet i din kontrakt. Find det på din lønseddel som 'Årsløn' eller 'Grundløn × 12'. Træk IKKE pension eller skat fra — det gør vi.",
    it: "Il numero sul tuo contratto. Trovalo sulla tua lønseddel come 'Årsløn' o 'Grundløn × 12'. NON sottrarre pensione o tasse — lo facciamo noi.",
    de: "Die Zahl in deinem Vertrag. Finde sie auf deinem lønseddel als 'Årsløn' oder 'Grundløn × 12'. Ziehe NICHT Rente oder Steuer ab — das machen wir.",
  },
  "input.grossMonthly": { en: "Gross monthly salary (DKK)", da: "Bruttomånedsløn (DKK)", it: "Stipendio mensile lordo (DKK)", de: "Bruttomonatsgehalt (DKK)" },
  "input.grossMonthly.tip": {
    en: "Your monthly salary as shown on your contract. Before pension, tax, and any other deductions. We'll multiply by 12.",
    da: "Din månedsløn som vist i din kontrakt. Før pension, skat og andre fradrag. Vi ganger med 12.",
    it: "Il tuo stipendio mensile come indicato nel contratto. Prima di pensione, tasse e altre deduzioni. Lo moltiplichiamo per 12.",
    de: "Dein Monatsgehalt laut Vertrag. Vor Rente, Steuer und anderen Abzügen. Wir multiplizieren mit 12.",
  },
  "input.hourlyRate": { en: "Hourly rate (DKK/hour)", da: "Timeløn (DKK/time)", it: "Tariffa oraria (DKK/ora)", de: "Stundenlohn (DKK/Stunde)" },
  "input.hourlyRate.tip": {
    en: "Your agreed hourly pay before tax. Check your contract or lønseddel under 'Timeløn'. Typical range: 130–250 DKK.",
    da: "Din aftalte timeløn før skat. Tjek din kontrakt eller lønseddel under 'Timeløn'. Typisk interval: 130–250 DKK.",
    it: "La tua paga oraria concordata prima delle tasse. Controlla il contratto o la lønseddel alla voce 'Timeløn'. Intervallo tipico: 130–250 DKK.",
    de: "Dein vereinbarter Stundenlohn vor Steuer. Prüfe deinen Vertrag oder lønseddel unter 'Timeløn'. Typischer Bereich: 130–250 DKK.",
  },
  "input.hoursMonth": { en: "Hours per month", da: "Timer pr. måned", it: "Ore al mese", de: "Stunden pro Monat" },
  "input.hoursMonth.tip": {
    en: "How many hours you work per month on average. Examples: 40 h = ~10 h/week, 80 h = ~20 h/week, 160 h = full-time (37 h/week).",
    da: "Hvor mange timer du arbejder pr. måned i gennemsnit. Eksempler: 40 t = ~10 t/uge, 80 t = ~20 t/uge, 160 t = fuldtid (37 t/uge).",
    it: "Quante ore lavori al mese in media. Esempi: 40 h = ~10 h/settimana, 80 h = ~20 h/settimana, 160 h = tempo pieno (37 h/settimana).",
    de: "Wie viele Stunden du durchschnittlich pro Monat arbeitest. Beispiele: 40 h = ~10 h/Woche, 80 h = ~20 h/Woche, 160 h = Vollzeit (37 h/Woche).",
  },

  // Student work input mode
  "input.student.workMode.hourly": { en: "Hourly rate × hours", da: "Timeløn × timer", it: "Tariffa oraria × ore", de: "Stundenlohn × Stunden" },
  "input.student.workMode.monthly": { en: "Fixed monthly", da: "Fast månedlig", it: "Fisso mensile", de: "Festes Monatsgehalt" },
  "input.student.workGross": { en: "Gross work income (DKK/month)", da: "Bruttoindkomst fra arbejde (DKK/md)", it: "Reddito lordo da lavoro (DKK/mese)", de: "Brutto-Arbeitseinkommen (DKK/Monat)" },
  "input.student.workGross.tip": {
    en: "Your monthly earnings from part-time work before tax.",
    da: "Din månedlige indkomst fra studiejob før skat.",
    it: "Il tuo guadagno mensile dal lavoro part-time prima delle tasse.",
    de: "Dein monatliches Einkommen aus Teilzeitarbeit vor Steuer.",
  },

  // Student education
  "input.eduType": { en: "Education type", da: "Uddannelsestype", it: "Tipo di istruzione", de: "Ausbildungsart" },
  "input.eduType.tip": {
    en: "Affects how much you can earn before repaying SU. Higher education (uni, college) = lower fribeløb. Youth education (gymnasium, HHX, HTX) = higher fribeløb.",
    da: "Påvirker hvor meget du kan tjene før du skal tilbagebetale SU. Videregående (uni, college) = lavere fribeløb. Ungdomsudd. (gymnasium, HHX, HTX) = højere fribeløb.",
    it: "Influenza quanto puoi guadagnare prima di dover rimborsare il SU. Istruzione superiore (università) = fribeløb più basso. Istruzione giovanile (gymnasium, HHX, HTX) = fribeløb più alto.",
    de: "Beeinflusst, wie viel du verdienen kannst, bevor du SU zurückzahlen musst. Hochschulbildung (Uni) = niedrigerer fribeløb. Jugendbildung (Gymnasium, HHX, HTX) = höherer fribeløb.",
  },
  "input.eduType.vid": { en: "Higher education", da: "Videregende", it: "Istruzione superiore", de: "Hochschulbildung" },
  "input.eduType.vid.sub": { en: "Videregende", da: "University, college", it: "Università, college", de: "Universität, College" },
  "input.eduType.ungdom": { en: "Youth education", da: "Ungdomsuddannelse", it: "Istruzione giovanile", de: "Jugendbildung" },
  "input.eduType.ungdom.sub": { en: "Ungdomsuddannelse", da: "Gymnasium, HHX, HTX", it: "Gymnasium, HHX, HTX", de: "Gymnasium, HHX, HTX" },

  "input.living": { en: "Living situation", da: "Bopælsforhold", it: "Situazione abitativa", de: "Wohnsituation" },
  "input.living.tip": {
    en: "Living away from parents = ~7,400 kr/month SU. Living with parents = ~2,900 kr/month. You must be registered at a separate address to qualify as udeboende.",
    da: "Udeboende = ~7.400 kr/md i SU. Hjemmeboende = ~2.900 kr/md. Du skal være registreret på en selvstændig adresse for at være udeboende.",
    it: "Fuori casa = ~7.400 kr/mese di SU. Con i genitori = ~2.900 kr/mese. Devi essere registrato a un indirizzo separato per qualificarti come udeboende.",
    de: "Auswrts wohnend = ~7.400 kr/Monat SU. Bei den Eltern = ~2.900 kr/Monat. Du musst an einer eigenen Adresse gemeldet sein, um als udeboende zu gelten.",
  },
  "input.living.ude": { en: "Living away", da: "Udeboende", it: "Fuori casa", de: "Auswärts wohnend" },
  "input.living.ude.sub": { en: "Udeboende", da: "Living away from parents", it: "Fuori dalla casa dei genitori", de: "Nicht bei den Eltern" },
  "input.living.hjemme": { en: "With parents", da: "Hjemmeboende", it: "Con i genitori", de: "Bei den Eltern" },
  "input.living.hjemme.sub": { en: "Hjemmeboende", da: "Living with parents", it: "Presso i genitori", de: "Bei den Eltern wohnend" },

  "input.children": { en: "Children under 18", da: "Børn under 18", it: "Figli sotto i 18 anni", de: "Kinder unter 18" },
  "input.children.tip": {
    en: "Each child increases your annual fribeløb by 34,921 kr.",
    da: "Hvert barn forhøjer dit årlige fribeløb med 34.921 kr.",
    it: "Ogni figlio aumenta il tuo fribeløb annuale di 34.921 kr.",
    de: "Jedes Kind erhöht deinen jährlichen fribeløb um 34.921 kr.",
  },
  "input.suMonths": { en: "SU months", da: "SU-måneder", it: "Mesi di SU", de: "SU-Monate" },
  "input.suMonths.tip": {
    en: "Months you receive SU this year (laveste fribeløb rate).",
    da: "Måneder du modtager SU i år (laveste fribeløbssats).",
    it: "Mesi in cui ricevi SU quest'anno (aliquota fribeløb più bassa).",
    de: "Monate, in denen du dieses Jahr SU erhältst (niedrigster fribeløb-Satz).",
  },
  "input.optedOut": { en: "Opted out months", da: "Fravalgte måneder", it: "Mesi senza SU", de: "Abgemeldete Monate" },
  "input.optedOut.tip": {
    en: "Months enrolled but no SU (mellemste fribeløb rate). Rest = højeste.",
    da: "Måneder indskrevet uden SU (mellemste fribeløbssats). Resten = højeste.",
    it: "Mesi iscritto ma senza SU (aliquota fribeløb intermedia). Il resto = la più alta.",
    de: "Monate eingeschrieben aber ohne SU (mittlerer fribeløb-Satz). Rest = höchster.",
  },

  // Student periodisering
  "input.studyPeriod": { en: "Study period this year", da: "Studieperiode i år", it: "Periodo di studio quest'anno", de: "Studienzeit dieses Jahr" },
  "input.studyPeriod.tip": {
    en: "If you start or finish education mid-year, only months you're enrolled count for fribeløb. This can save you from repayment.",
    da: "Hvis du starter eller afslutter uddannelse midt i året, tæller kun de måneder du er indskrevet med i fribeløbet. Det kan forhindre tilbagebetaling.",
    it: "Se inizi o finisci gli studi a metà anno, solo i mesi in cui sei iscritto contano per il fribeløb. Questo può evitarti il rimborso.",
    de: "Wenn du mitten im Jahr anfngst oder aufhörst zu studieren, zählen nur die eingeschriebenen Monate für den fribeløb. Das kann dich vor einer Rückzahlung bewahren.",
  },
  "input.studyPeriod.full": { en: "Full year (Jan – Dec)", da: "Hele året (jan – dec)", it: "Anno intero (gen – dic)", de: "Ganzes Jahr (Jan – Dez)" },
  "input.studyPeriod.start": { en: "Starting mid-year", da: "Starter midt i året", it: "Inizio a metà anno", de: "Beginn Mitte des Jahres" },
  "input.studyPeriod.finish": { en: "Finishing mid-year", da: "Afslutter midt i året", it: "Fine a metà anno", de: "Ende Mitte des Jahres" },
  "input.studyPeriod.startMonth": { en: "Start month", da: "Startmåned", it: "Mese di inizio", de: "Startmonat" },
  "input.studyPeriod.endMonth": { en: "End month", da: "Slutmåned", it: "Mese di fine", de: "Endmonat" },

  // Municipality
  "input.kommune": { en: "Municipality", da: "Kommune", it: "Comune", de: "Kommune" },
  "input.kommune.tip": {
    en: "Your tax municipality = where you live on Jan 1st. Each kommune has a different tax rate (22–27%). Check your skatteoplysninger or look at your lønseddel.",
    da: "Din skattekommune = hvor du bor den 1. januar. Hver kommune har en forskellig skatteprocent (22–27 %). Tjek dine skatteoplysninger eller din lønseddel.",
    it: "Il tuo comune fiscale = dove vivi il 1° gennaio. Ogni kommune ha un'aliquota diversa (22–27%). Controlla le tue skatteoplysninger o la tua lønseddel.",
    de: "Deine Steuer-Kommune = wo du am 1. Januar wohnst. Jede Kommune hat einen anderen Steuersatz (22–27%). Prüfe deine Steuerunterlagen oder deinen lønseddel.",
  },
  "input.church": { en: "Church member", da: "Folkekirkemedlem", it: "Membro della chiesa", de: "Kirchenmitglied" },
  "input.church.sub": { en: "Folkekirken", da: "Folkekirken", it: "Folkekirken", de: "Folkekirken" },
  "input.church.tip": {
    en: "If you're a member of the Danish national church (folkekirken), you pay an extra 0.4–1.3% tax. Check your trækopgørelse — if kirkeskat is listed, you're a member.",
    da: "Hvis du er medlem af folkekirken, betaler du 0,4–1,3 % ekstra i skat. Tjek din trækopgørelse — hvis kirkeskat er anført, er du medlem.",
    it: "Se sei membro della chiesa nazionale danese (folkekirken), paghi un'imposta extra dello 0,4–1,3%. Controlla la tua trækopgørelse — se kirkeskat è indicato, sei membro.",
    de: "Wenn du Mitglied der dänischen Volkskirche (folkekirken) bist, zahlst du 0,4–1,3% zusätzliche Steuer. Prüfe deine Steuererklärung — wenn kirkeskat aufgeführt ist, bist du Mitglied.",
  },

  // Pension
  "input.pension.title": { en: "Pension", da: "Pension", it: "Pensione", de: "Rente" },
  "input.pension.desc": {
    en: "Typical split: 4% employee + 8% employer. Set both to 0 if none.",
    da: "Typisk fordeling: 4% medarbejder + 8% arbejdsgiver. Sæt begge til 0 hvis ingen.",
    it: "Ripartizione tipica: 4% dipendente + 8% datore di lavoro. Imposta entrambi a 0 se non hai pensione.",
    de: "Typische Aufteilung: 4% Arbeitnehmer + 8% Arbeitgeber. Setze beide auf 0, wenn keine Rente.",
  },
  "input.pension.yours": { en: "Your contribution (%)", da: "Dit bidrag (%)", it: "Il tuo contributo (%)", de: "Dein Beitrag (%)" },
  "input.pension.yours.tip": {
    en: "Your share, deducted from gross pay. Check your lønseddel or contract — look for 'Pensionsbidrag medarbejder'. Common: 4%. Set to 0 if you have no pension scheme.",
    da: "Din andel, fratrukket bruttolønnen. Tjek din lønseddel eller kontrakt — se efter 'Pensionsbidrag medarbejder'. Typisk: 4 %. Sæt til 0 hvis ingen pension.",
    it: "La tua quota, dedotta dallo stipendio lordo. Controlla la lønseddel o il contratto — cerca 'Pensionsbidrag medarbejder'. Comune: 4%. Imposta a 0 se non hai un piano pensionistico.",
    de: "Dein Anteil, vom Bruttogehalt abgezogen. Prüfe deinen lønseddel oder Vertrag — suche nach 'Pensionsbidrag medarbejder'. Typisch: 4%. Setze auf 0, wenn keine Rente.",
  },
  "input.pension.employer": { en: "Employer on top (%)", da: "Arbejdsgiver oveni (%)", it: "Datore di lavoro in aggiunta (%)", de: "Arbeitgeber obendrauf (%)" },
  "input.pension.employer.tip": {
    en: "Paid by your employer on top of your salary — goes straight to your pension fund. Not taxed now. Check your lønseddel for 'Pensionsbidrag arbejdsgiver'. Common: 8%.",
    da: "Betales af din arbejdsgiver oveni din løn — går direkte til din pensionskasse. Beskattes ikke nu. Tjek din lønseddel for 'Pensionsbidrag arbejdsgiver'. Typisk: 8 %.",
    it: "Pagato dal datore di lavoro oltre allo stipendio — va direttamente al fondo pensione. Non tassato ora. Controlla la lønseddel per 'Pensionsbidrag arbejdsgiver'. Comune: 8%.",
    de: "Vom Arbeitgeber zusätzlich zum Gehalt gezahlt — geht direkt in deine Pensionskasse. Jetzt nicht besteuert. Prüfe deinen lønseddel für 'Pensionsbidrag arbejdsgiver'. Typisch: 8%.",
  },

  // ATP
  "input.atp": { en: "ATP", da: "ATP", it: "ATP", de: "ATP" },
  "input.atp.sub": { en: "Arbejdsmarkedets Tillægspension", da: "Labour-market supplementary pension", it: "Pensione integrativa del mercato del lavoro", de: "Arbeitsmarkt-Zusatzrente" },
  "input.atp.tip": {
    en: "Mandatory pension contribution. Your share is ~95 kr/month (full-time). Check your lønseddel — look for 'ATP' in the deduction lines. Your employer also pays ~190 kr on top.",
    da: "Obligatorisk pensionsbidrag. Din andel er ~95 kr/md (fuldtid). Tjek din lønseddel — find 'ATP' i fradragslinjerne. Din arbejdsgiver betaler også ~190 kr oveni.",
    it: "Contributo pensionistico obbligatorio. La tua quota è ~95 kr/mese (tempo pieno). Controlla la lønseddel — cerca 'ATP' nelle righe delle deduzioni. Il datore di lavoro paga anche ~190 kr in aggiunta.",
    de: "Pflichtbeitrag zur Rente. Dein Anteil beträgt ~95 kr/Monat (Vollzeit). Prüfe deinen lønseddel — suche nach 'ATP' in den Abzugszeilen. Dein Arbeitgeber zahlt zusätzlich ~190 kr.",
  },

  // Extras
  "input.extras.title": { en: "Pay, benefits & deductions", da: "Løn, goder & fradrag", it: "Paga, benefit e deduzioni", de: "Gehalt, Leistungen & Abzüge" },
  "input.extras.optional": { en: "Optional", da: "Valgfrit", it: "Facoltativo", de: "Optional" },
  "input.otherPay": { en: "Other pay (DKK/month)", da: "Anden løn (DKK/md)", it: "Altra paga (DKK/mese)", de: "Sonstiges Gehalt (DKK/Monat)" },
  "input.otherPay.tip": {
    en: "Monthly cash you receive on top of base salary. Examples: broadband allowance (~500 kr), regular bonus, transport allowance. Look for extra cash lines on your lønseddel.",
    da: "Månedlig kontant udover grundløn. Eksempler: bredbåndstilskud (~500 kr), fast bonus, transporttilskud. Se efter ekstra kontantposter på din lønseddel.",
    it: "Contante mensile che ricevi oltre allo stipendio base. Esempi: indennità banda larga (~500 kr), bonus regolare, indennità trasporto. Cerca le voci extra sulla tua lønseddel.",
    de: "Monatliches Extrageld zusätzlich zum Grundgehalt. Beispiele: Breitbandzuschuss (~500 kr), regelmäßiger Bonus, Transportzuschuss. Suche nach extra Positionen auf deinem lønseddel.",
  },
  "input.taxBenefits": { en: "Taxable benefits (DKK/month)", da: "Skattepligtige personalegoder (DKK/md)", it: "Benefit tassabili (DKK/mese)", de: "Steuerpflichtige Sachleistungen (DKK/Monat)" },
  "input.taxBenefits.tip": {
    en: "Benefits you don't receive as cash but still pay tax on. Check your lønseddel for lines like: fri telefon (~292 kr/mo), sundhedsforsikring (~200 kr/mo), firmabil. Enter the monthly taxable value.",
    da: "Goder du ikke modtager kontant, men stadig beskattes af. Tjek din lønseddel for poster som: fri telefon (~292 kr/md), sundhedsforsikring (~200 kr/md), firmabil. Angiv den månedlige skatteværdi.",
    it: "Benefit che non ricevi in contanti ma su cui paghi comunque le tasse. Controlla la lønseddel per voci come: fri telefon (~292 kr/mese), sundhedsforsikring (~200 kr/mese), firmabil. Inserisci il valore mensile tassabile.",
    de: "Leistungen, die du nicht bar erhältst, aber trotzdem versteuern musst. Prüfe deinen lønseddel auf Posten wie: fri telefon (~292 kr/Monat), sundhedsforsikring (~200 kr/Monat), Firmenwagen. Gib den monatlichen steuerpflichtigen Wert ein.",
  },
  "input.pretaxDed": { en: "Pre-tax deductions (DKK/month)", da: "Fradrag før skat (DKK/md)", it: "Deduzioni pre-tasse (DKK/mese)", de: "Abzüge vor Steuer (DKK/Monat)" },
  "input.pretaxDed.tip": {
    en: "Amounts your employer deducts from your pay BEFORE calculating tax. Examples: DSB commuter card (~988 kr), company-paid insurance. Look for 'Fradrag før skat' on your lønseddel. Reduces your taxable income.",
    da: "Beløb din arbejdsgiver trækker fra din løn FØR skatteberegning. Eksempler: DSB pendlerkort (~988 kr), firmabetalt forsikring. Se efter 'Fradrag før skat' på din lønseddel. Reducerer din skattepligtige indkomst.",
    it: "Importi che il datore di lavoro deduce dalla tua paga PRIMA del calcolo delle tasse. Esempi: abbonamento DSB (~988 kr), assicurazione aziendale. Cerca 'Fradrag før skat' sulla lønseddel. Riduce il tuo reddito imponibile.",
    de: "Beträge, die dein Arbeitgeber VOR der Steuerberechnung von deinem Gehalt abzieht. Beispiele: DSB-Pendlerkarte (~988 kr), firmenbezahlte Versicherung. Suche nach 'Fradrag før skat' auf deinem lønseddel. Reduziert dein steuerpflichtiges Einkommen.",
  },
  "input.aftertaxDed": { en: "After-tax deductions (DKK/month)", da: "Fradrag efter skat (DKK/md)", it: "Deduzioni post-tasse (DKK/mese)", de: "Abzüge nach Steuer (DKK/Monat)" },
  "input.aftertaxDed.tip": {
    en: "Amounts your employer deducts AFTER tax is calculated. Examples: canteen/frokostordning (300–600 kr), gym membership, parking. Look for 'Fradrag efter skat' on your lønseddel. Does NOT save you tax — just reduces your payout.",
    da: "Beløb din arbejdsgiver trækker EFTER skat er beregnet. Eksempler: frokostordning (300–600 kr), fitness, parkering. Se efter 'Fradrag efter skat' på din lønseddel. Sparer IKKE skat — reducerer kun din udbetaling.",
    it: "Importi che il datore di lavoro deduce DOPO il calcolo delle tasse. Esempi: mensa/frokostordning (300–600 kr), palestra, parcheggio. Cerca 'Fradrag efter skat' sulla lønseddel. NON fa risparmiare tasse — riduce solo il netto.",
    de: "Beträge, die dein Arbeitgeber NACH der Steuerberechnung abzieht. Beispiele: Kantine/frokostordning (300–600 kr), Fitnessstudio, Parkplatz. Suche nach 'Fradrag efter skat' auf deinem lønseddel. Spart KEINE Steuer — reduziert nur deine Auszahlung.",
  },
  "input.personalDeductions": { en: "Personal tax deductions", da: "Personlige skattefradrag", it: "Deduzioni fiscali personali", de: "Persönliche Steuerabzüge" },
  "input.transportKm": { en: "Daily round-trip commute (km)", da: "Daglig transport tur/retur (km)", it: "Tragitto giornaliero andata/ritorno (km)", de: "Täglicher Hin- und Rückweg (km)" },
  "input.transportKm.tip": {
    en: "Your daily ROUND-TRIP distance home ↔ work (both ways). Use Google Maps to check. Only kicks in above 24 km. Example: 40 km round-trip → 16 km × 1.98 kr × 218 days = ~6,900 kr/year deduction → saves ~1,800 kr in tax.",
    da: "Din daglige TUR/RETUR-afstand hjem ↔ arbejde (begge veje). Brug Google Maps til at tjekke. Gælder kun over 24 km. Eksempel: 40 km tur/retur → 16 km × 1,98 kr × 218 dage = ~6.900 kr/år fradrag → sparer ~1.800 kr i skat.",
    it: "La tua distanza giornaliera ANDATA/RITORNO casa ↔ lavoro (entrambi i tragitti). Usa Google Maps per verificare. Si applica solo oltre 24 km. Esempio: 40 km andata/ritorno → 16 km × 1,98 kr × 218 giorni = ~6.900 kr/anno di deduzione → risparmi ~1.800 kr di tasse.",
    de: "Deine tägliche HIN- UND RÜCKFAHRT-Strecke Wohnung ↔ Arbeit (beide Wege). Prüfe mit Google Maps. Gilt erst ab 24 km. Beispiel: 40 km Hin/Rück → 16 km × 1,98 kr × 218 Tage = ~6.900 kr/Jahr Abzug → spart ~1.800 kr Steuer.",
  },
  "input.unionFees": { en: "Union + A-kasse fees (DKK/year)", da: "Fagforening + A-kasse (DKK/år)", it: "Sindacato + A-kasse (DKK/anno)", de: "Gewerkschaft + A-kasse (DKK/Jahr)" },
  "input.unionFees.tip": {
    en: "Total yearly cost for trade union + A-kasse (unemployment insurance). Enter the combined annual amount. Max 7,000 kr is deductible. Example: IDA ~6,000 kr + A-kasse ~5,000 kr → enter 11,000 (capped at 7,000). Saves ~1,800 kr/year in tax.",
    da: "Samlet årlig udgift til fagforening + A-kasse (arbejdsløshedsforsikring). Angiv det samlede årsbeløb. Maks 7.000 kr er fradragsberettiget. Eksempel: IDA ~6.000 kr + A-kasse ~5.000 kr → skriv 11.000 (grænse 7.000). Sparer ~1.800 kr/år i skat.",
    it: "Costo annuale totale per sindacato + A-kasse (assicurazione contro la disoccupazione). Inserisci l'importo annuale combinato. Massimo 7.000 kr deducibili. Esempio: IDA ~6.000 kr + A-kasse ~5.000 kr → inserisci 11.000 (limite 7.000). Risparmi ~1.800 kr/anno di tasse.",
    de: "Jährliche Gesamtkosten für Gewerkschaft + A-kasse (Arbeitslosenversicherung). Gib den kombinierten Jahresbetrag ein. Max 7.000 kr absetzbar. Beispiel: IDA ~6.000 kr + A-kasse ~5.000 kr → gib 11.000 ein (gedeckelt bei 7.000). Spart ~1.800 kr/Jahr Steuer.",
  },

  // Warnings
  "warn.atp.noHours": {
    en: "Below 9 hours/week — no ATP obligation. Your employer is not required to pay ATP.",
    da: "Under 9 timer/uge — ingen ATP-pligt. Din arbejdsgiver er ikke forpligtet til at betale ATP.",
    it: "Sotto le 9 ore/settimana — nessun obbligo ATP. Il tuo datore di lavoro non è tenuto a pagare ATP.",
    de: "Unter 9 Stunden/Woche — keine ATP-Pflicht. Dein Arbeitgeber ist nicht verpflichtet, ATP zu zahlen.",
  },
  "warn.atp.lowHours": {
    en: "Below 15 hours/week — check if your hourly rate meets the collective agreement minimum (overenskomst).",
    da: "Under 15 timer/uge — tjek om din timeløn opfylder overenskomstens mindsteløn.",
    it: "Sotto le 15 ore/settimana — verifica se la tua tariffa oraria rispetta il minimo del contratto collettivo (overenskomst).",
    de: "Unter 15 Stunden/Woche — prüfe, ob dein Stundenlohn den Tarifvertragsmindestlohn (overenskomst) erfüllt.",
  },

  // Review
  "review.title": { en: "Review your inputs", da: "Gennemse dine indtastninger", it: "Rivedi i tuoi dati", de: "Überprüfe deine Eingaben" },

  // Buttons
  "btn.home": { en: "Home", da: "Hjem", it: "Home", de: "Startseite" },
  "btn.back": { en: "Back", da: "Tilbage", it: "Indietro", de: "Zurück" },
  "btn.next": { en: "Next", da: "Næste", it: "Avanti", de: "Weiter" },
  "btn.calculate": { en: "Calculate", da: "Beregn", it: "Calcola", de: "Berechnen" },
  "btn.calculating": { en: "Calculating…", da: "Beregner…", it: "Calcolo in corso…", de: "Berechne…" },
  "btn.adjust": { en: "Adjust & recalculate", da: "Justér & genberegn", it: "Modifica e ricalcola", de: "Anpassen & neu berechnen" },
  "btn.new": { en: "New calculation", da: "Ny beregning", it: "Nuovo calcolo", de: "Neue Berechnung" },
  "btn.backHome": { en: "Back to home", da: "Tilbage til forsiden", it: "Torna alla home", de: "Zurück zur Startseite" },

  // ── Results page ───────────────────────────────────────────────
  "results.netMonthly": { en: "Estimated net monthly", da: "Estimeret nettomånedlig", it: "Netto mensile stimato", de: "Geschätztes Nettomonatsgehalt" },
  "results.netAnnual": { en: "Estimated net annual", da: "Estimeret nettoårlig", it: "Netto annuale stimato", de: "Geschätztes Nettojahresgehalt" },
  "results.effRate": { en: "Eff. tax rate", da: "Eff. skatteprocent", it: "Aliquota fiscale eff.", de: "Eff. Steuersatz" },
  "results.monthly": { en: "Monthly", da: "Månedlig", it: "Mensile", de: "Monatlich" },
  "results.annual": { en: "Annual", da: "Årlig", it: "Annuale", de: "Jährlich" },
  "results.showEur": { en: "Show EUR", da: "Vis EUR", it: "Mostra EUR", de: "EUR anzeigen" },
  "currency.clear": { en: "Back to DKK only", da: "Tilbage til kun DKK", it: "Solo DKK", de: "Zurück zu nur DKK" },
  "currency.loading": { en: "Loading rates…", da: "Henter kurser…", it: "Caricamento tassi…", de: "Kurse laden…" },
  "currency.convert_to": { en: "Convert to", da: "Konvertér til", it: "Converti in", de: "Umrechnen in" },
  "currency.source": { en: "Rates from ECB via Frankfurter", da: "Kurser fra ECB via Frankfurter", it: "Tassi dalla BCE via Frankfurter", de: "Kurse von der EZB via Frankfurter" },
  "currency.error": { en: "Could not load rates", da: "Kunne ikke hente kurser", it: "Impossibile caricare i tassi", de: "Kurse konnten nicht geladen werden" },
  "results.tab.breakdown": { en: "Breakdown", da: "Opgørelse", it: "Dettaglio", de: "Aufschlüsselung" },
  "results.tab.charts": { en: "Charts", da: "Grafer", it: "Grafici", de: "Diagramme" },
  "results.tab.pension": { en: "Pension", da: "Pension", it: "Pensione", de: "Rente" },
  "results.tab.glossary": { en: "Glossary", da: "Ordliste", it: "Glossario", de: "Glossar" },
  "results.item": { en: "Item", da: "Post", it: "Voce", de: "Posten" },
  "results.annualDKK": { en: "Annual (DKK)", da: "Årlig (DKK)", it: "Annuale (DKK)", de: "Jährlich (DKK)" },
  "results.monthlyDKK": { en: "Monthly (DKK)", da: "Månedlig (DKK)", it: "Mensile (DKK)", de: "Monatlich (DKK)" },
  "results.netAnnualIncome": { en: "Net annual income", da: "Netto årsindkomst", it: "Reddito annuo netto", de: "Netto-Jahreseinkommen" },

  // Charts
  "chart.netVsGross": { en: "Net vs gross income", da: "Netto vs brutto indkomst", it: "Netto vs lordo", de: "Netto vs Brutto" },
  "chart.netVsGross.desc": {
    en: "Monthly net income across different gross salary levels",
    da: "Månedlig nettoindkomst ved forskellige bruttolønniveauer",
    it: "Reddito netto mensile a diversi livelli di stipendio lordo",
    de: "Monatliches Nettoeinkommen bei verschiedenen Bruttogehaltsstufen",
  },
  "chart.netVsHours": { en: "Net income vs hours worked", da: "Nettoindkomst vs arbejdstimer", it: "Reddito netto vs ore lavorate", de: "Nettoeinkommen vs Arbeitsstunden" },

  // Pension tab
  "pension.accrual": { en: "Pension accrual", da: "Pensionsopsparing", it: "Maturazione pensione", de: "Rentenansammlung" },
  "pension.yours": { en: "Your contribution", da: "Dit bidrag", it: "Il tuo contributo", de: "Dein Beitrag" },
  "pension.employer": { en: "Employer on top", da: "Arbejdsgiver oveni", it: "Datore di lavoro in aggiunta", de: "Arbeitgeber obendrauf" },
  "pension.total": { en: "Total pension", da: "Samlet pension", it: "Pensione totale", de: "Gesamte Rente" },

  // Ferie tab
  "results.tab.ferie": { en: "Vacation", da: "Ferie", it: "Ferie", de: "Urlaub" },
  "ferie.title": { en: "Vacation accrual", da: "Ferieoptjening", it: "Maturazione ferie", de: "Urlaubsansammlung" },
  "ferie.daysPerYear": { en: "Days / year", da: "Dage / år", it: "Giorni / anno", de: "Tage / Jahr" },
  "ferie.daysPerMonth": { en: "Days / month", da: "Dage / md", it: "Giorni / mese", de: "Tage / Monat" },
  "ferie.ferietillaeg": { en: "Ferietillæg (1%)", da: "Ferietillæg (1%)", it: "Ferietillæg (1%)", de: "Ferietillæg (1%)" },
  "ferie.feriepenge": { en: "Feriepenge (12.5%)", da: "Feriepenge (12,5%)", it: "Feriepenge (12,5%)", de: "Feriepenge (12,5%)" },
  "ferie.dailyRate": { en: "Daily vacation pay", da: "Daglig feriepenge", it: "Paga giornaliera delle ferie", de: "Tägliches Urlaubsgeld" },
  "ferie.salaryNote": {
    en: "Salaried employees receive paid leave (ferie med løn) plus 1% ferietillæg on top of gross salary.",
    da: "Funktionærer modtager løn under ferie (ferie med løn) plus 1% ferietillæg oven i bruttolønnen.",
    it: "I dipendenti stipendiati ricevono ferie retribuite (ferie med løn) più l'1% di ferietillæg sullo stipendio lordo.",
    de: "Gehaltsempfänger erhalten bezahlten Urlaub (ferie med løn) plus 1% Ferietillæg auf das Bruttogehalt.",
  },
  "ferie.hourlyNote": {
    en: "Hourly workers receive 12.5% of gross earnings as feriepenge, deposited to Feriekonto.",
    da: "Timelønnede modtager 12,5% af bruttoindtjening som feriepenge, indsat på Feriekonto.",
    it: "I lavoratori a ore ricevono il 12,5% dei guadagni lordi come feriepenge, depositati su Feriekonto.",
    de: "Stundenlöhner erhalten 12,5% des Bruttoverdienstes als Feriepenge, eingezahlt auf das Feriekonto.",
  },
  "ferie.studentNote": {
    en: "Student workers receive 12.5% of work income as feriepenge, deposited to Feriekonto.",
    da: "Studerende modtager 12,5% af arbejdsindkomst som feriepenge, indsat på Feriekonto.",
    it: "Gli studenti lavoratori ricevono il 12,5% del reddito da lavoro come feriepenge, depositati su Feriekonto.",
    de: "Studentische Arbeitnehmer erhalten 12,5% des Arbeitseinkommens als Feriepenge, eingezahlt auf das Feriekonto.",
  },
  "ferie.rule": {
    en: "Everyone accrues 2.08 vacation days per month worked (25 days/year) under the Danish Holiday Act (Ferieloven).",
    da: "Alle optjener 2,08 feriedage pr. arbejdsmåned (25 dage/år) iht. Ferieloven.",
    it: "Tutti maturano 2,08 giorni di ferie per mese lavorato (25 giorni/anno) secondo la legge danese sulle ferie (Ferieloven).",
    de: "Jeder sammelt 2,08 Urlaubstage pro Arbeitsmonat an (25 Tage/Jahr) gemäß dem dänischen Urlaubsgesetz (Ferieloven).",
  },

  // Glossary
  "glossary.title": { en: "Tax glossary — what each term means", da: "Skatteordliste — hvad hvert begreb betyder", it: "Glossario fiscale — cosa significa ogni termine", de: "Steuer-Glossar — was jeder Begriff bedeutet" },

  // Fribeloeb status
  "fribeloeb.title": { en: "Fribeløb status", da: "Fribeløb-status", it: "Stato fribeløb", de: "Fribeløb-Status" },
  "fribeloeb.egenindkomst": { en: "Egenindkomst (work after AM)", da: "Egenindkomst (arbejde efter AM)", it: "Egenindkomst (lavoro dopo AM)", de: "Egenindkomst (Arbeit nach AM)" },

  // Disclaimer
  "disclaimer": {
    en: "All calculations use official SKAT 2026 rates — bundskat 12.01%, AM-bidrag 8%, personfradrag 54,100 kr/year.",
    da: "Alle beregninger bruger officielle SKAT 2026-satser — bundskat 12,01%, AM-bidrag 8%, personfradrag 54.100 kr/år.",
    it: "Tutti i calcoli usano le aliquote ufficiali SKAT 2026 — bundskat 12,01%, AM-bidrag 8%, personfradrag 54.100 kr/anno.",
    de: "Alle Berechnungen verwenden offizielle SKAT 2026-Sätze — bundskat 12,01%, AM-bidrag 8%, personfradrag 54.100 kr/Jahr.",
  },

  // Months
  "month.1": { en: "January", da: "Januar", it: "Gennaio", de: "Januar" },
  "month.2": { en: "February", da: "Februar", it: "Febbraio", de: "Februar" },
  "month.3": { en: "March", da: "Marts", it: "Marzo", de: "März" },
  "month.4": { en: "April", da: "April", it: "Aprile", de: "April" },
  "month.5": { en: "May", da: "Maj", it: "Maggio", de: "Mai" },
  "month.6": { en: "June", da: "Juni", it: "Giugno", de: "Juni" },
  "month.7": { en: "July", da: "Juli", it: "Luglio", de: "Juli" },
  "month.8": { en: "August", da: "August", it: "Agosto", de: "August" },
  "month.9": { en: "September", da: "September", it: "Settembre", de: "September" },
  "month.10": { en: "October", da: "Oktober", it: "Ottobre", de: "Oktober" },
  "month.11": { en: "November", da: "November", it: "Novembre", de: "November" },
  "month.12": { en: "December", da: "December", it: "Dicembre", de: "Dezember" },

  // Student EU worker hours warning
  "input.student.euWorkerWarning": {
    en: "EU/EEA citizens must work at least 10-12 hours/week (~43-52 hours/month) to qualify as an EU worker and be eligible for SU. Working fewer hours may mean you lose your SU grant.",
    da: "EU/EØS-borgere skal arbejde mindst 10-12 timer/uge (ca. 43-52 timer/md) for at opnå arbejdstagerstatus efter EU-retten og være berettiget til SU. Ved færre timer risikerer du at miste din SU.",
    it: "I cittadini UE/SEE devono lavorare almeno 10-12 ore/settimana (~43-52 ore/mese) per qualificarsi come lavoratore UE ed essere idonei al SU. Lavorare meno ore potrebbe significare perdere il SU.",
    de: "EU/EWR-Bürger müssen mindestens 10-12 Stunden/Woche (~43-52 Stunden/Monat) arbeiten, um als EU-Arbeitnehmer zu gelten und SU-berechtigt zu sein. Weniger Stunden können den Verlust des SU bedeuten.",
  },

  // Student pension step
  "input.student.pension.desc": {
    en: "Most students don't have pension. If your employer contributes, enter the percentages below.",
    da: "De fleste studerende har ikke pension. Hvis din arbejdsgiver bidrager, indtast procenterne herunder.",
    it: "La maggior parte degli studenti non ha una pensione. Se il datore di lavoro contribuisce, inserisci le percentuali qui sotto.",
    de: "Die meisten Studenten haben keine Rente. Wenn dein Arbeitgeber beiträgt, gib die Prozentsätze unten ein.",
  },

  // Quick overview
  "overview.title": { en: "Gross → Net at a glance", da: "Brutto → Netto overblik", it: "Lordo → Netto in sintesi", de: "Brutto → Netto auf einen Blick" },
  "overview.subtitle": {
    en: "See roughly how much net salary you keep at different gross income levels under standard conditions.",
    da: "Se omtrent hvor meget nettoløn du beholder ved forskellige bruttoindkomstniveauer under standardforhold.",
    it: "Vedi approssimativamente quanto stipendio netto mantieni a diversi livelli di reddito lordo in condizioni standard.",
    de: "Sieh ungefähr, wie viel Nettogehalt du bei verschiedenen Bruttoeinkommensstufen unter Standardbedingungen behältst.",
  },
  "overview.warning": {
    en: "This is a rough estimate only — your actual net income depends on many personal factors not accounted for here.",
    da: "Dette er kun et groft estimat — din faktiske nettoindkomst afhænger af mange personlige faktorer, der ikke er medregnet her.",
    it: "Questa è solo una stima approssimativa — il tuo reddito netto effettivo dipende da molti fattori personali non considerati qui.",
    de: "Dies ist nur eine grobe Schätzung — dein tatsächliches Nettoeinkommen hängt von vielen persönlichen Faktoren ab, die hier nicht berücksichtigt werden.",
  },
  "overview.assumptions": {
    en: "Factors that can change your result:",
    da: "Faktorer der kan ændre dit resultat:",
    it: "Fattori che possono cambiare il risultato:",
    de: "Faktoren, die dein Ergebnis ändern können:",
  },
  "overview.factor.kommune": {
    en: "Your kommune tax rate (varies from ~23% to ~27%)",
    da: "Din kommuneskatteprocent (varierer fra ca. 23% til ca. 27%)",
    it: "La tua aliquota comunale (varia da ~23% a ~27%)",
    de: "Dein Kommune-Steuersatz (variiert von ~23% bis ~27%)",
  },
  "overview.factor.pension": {
    en: "Pension contribution percentage and split",
    da: "Pensionsbidragsprocent og fordeling",
    it: "Percentuale e ripartizione del contributo pensionistico",
    de: "Rentenbeitragsprozentsatz und Aufteilung",
  },
  "overview.factor.extras": {
    en: "Additional compensation (bonuses, allowances, 13th month)",
    da: "Ekstra kompensation (bonus, tillæg, 13. månedsløn)",
    it: "Compensi aggiuntivi (bonus, indennità, tredicesima)",
    de: "Zusätzliche Vergütung (Boni, Zulagen, 13. Monatsgehalt)",
  },
  "overview.factor.benefits": {
    en: "Taxable benefits (company car, phone, lunch scheme, etc.)",
    da: "Skattepligtige personalegoder (firmabil, telefon, frokostordning osv.)",
    it: "Benefit tassabili (auto aziendale, telefono, mensa, ecc.)",
    de: "Steuerpflichtige Sachleistungen (Firmenwagen, Telefon, Essensplan usw.)",
  },
  "overview.factor.church": {
    en: "Whether you pay church tax (kirkeskat)",
    da: "Om du betaler kirkeskat",
    it: "Se paghi l'imposta ecclesiastica (kirkeskat)",
    de: "Ob du Kirchensteuer (kirkeskat) zahlst",
  },
  "overview.factor.atp": {
    en: "ATP contributions and employment type",
    da: "ATP-bidrag og ansættelsestype",
    it: "Contributi ATP e tipo di impiego",
    de: "ATP-Beiträge und Beschäftigungsart",
  },
  "overview.factor.deductions": {
    en: "Personal deductions (transport, union fees, interest, etc.)",
    da: "Personlige fradrag (transport, fagforeningskontingent, renteudgifter osv.)",
    it: "Deduzioni personali (trasporto, quote sindacali, interessi, ecc.)",
    de: "Persönliche Abzüge (Transport, Gewerkschaftsbeiträge, Zinsen usw.)",
  },
  "overview.conditions": {
    en: "Standard conditions used for this chart:",
    da: "Standardforudsætninger brugt i denne graf:",
    it: "Condizioni standard usate per questo grafico:",
    de: "Standardbedingungen für dieses Diagramm:",
  },
  "overview.chartTitle": { en: "Net vs gross monthly income", da: "Netto vs brutto månedlig indkomst", it: "Netto vs lordo mensile", de: "Netto vs Brutto Monatseinkommen" },
  "overview.chartDesc": {
    en: "The dashed line shows gross income (no tax). The solid line shows your estimated net take-home pay.",
    da: "Den stiplede linje viser bruttoindkomst (ingen skat). Den fuldt optrukne linje viser din anslåede nettoudbetaling.",
    it: "La linea tratteggiata mostra il reddito lordo (senza tasse). La linea continua mostra il tuo netto stimato.",
    de: "Die gestrichelte Linie zeigt das Bruttoeinkommen (ohne Steuer). Die durchgezogene Linie zeigt dein geschätztes Nettogehalt.",
  },
  "overview.rateTable": {
    en: "Effective tax rate at different income levels",
    da: "Effektiv skatteprocent ved forskellige indkomstniveauer",
    it: "Aliquota fiscale effettiva a diversi livelli di reddito",
    de: "Effektiver Steuersatz bei verschiedenen Einkommensstufen",
  },
  "overview.cta": {
    en: "Calculate with your exact numbers →",
    da: "Beregn med dine præcise tal →",
    it: "Calcola con i tuoi numeri esatti →",
    de: "Berechne mit deinen genauen Zahlen →",
  },
  "overview.link": {
    en: "Quick gross → net overview",
    da: "Hurtigt brutto → netto overblik",
    it: "Panoramica rapida lordo → netto",
    de: "Schnelle Brutto → Netto Übersicht",
  },

  /* ── Methodology page ──────────────────────────────────────────── */
  "method.back": { en: "Back", da: "Tilbage", it: "Indietro", de: "Zurück" },
  "method.title": { en: "How it works", da: "Sådan fungerer det", it: "Come funziona", de: "So funktioniert es" },
  "method.subtitle": {
    en: "A transparent look at the tax engine behind every estimate",
    da: "Et gennemsigtigt kig på skattemotoren bag hvert estimat",
    it: "Uno sguardo trasparente al motore fiscale dietro ogni stima",
    de: "Ein transparenter Blick auf die Steuerberechnung hinter jeder Schätzung",
  },
  "method.about.title": { en: "About this tool", da: "Om dette værktøj", it: "Informazioni su questo strumento", de: "Über dieses Tool" },
  "method.about.p1": {
    en: "DK Income Calculator is a free tool that helps people working in Denmark understand their salary, tax, and total compensation. We use the official 2026 rates from SKAT.",
    da: "DK Income Calculator er et gratis værktøj, der hjælper folk, der arbejder i Danmark, med at forstå deres løn, skat og samlede kompensation. Vi bruger de officielle 2026-satser fra SKAT.",
    it: "DK Income Calculator è uno strumento gratuito che aiuta chi lavora in Danimarca a comprendere stipendio, tasse e compenso totale. Utilizziamo le aliquote ufficiali del 2026 di SKAT.",
    de: "DK Income Calculator ist ein kostenloses Tool, das Menschen in Dänemark hilft, ihr Gehalt, ihre Steuern und ihre Gesamtvergütung zu verstehen. Wir verwenden die offiziellen SKAT-Sätze 2026.",
  },
  "method.about.p2": {
    en: "All calculations are indicative and may vary depending on your specific situation. Always verify with SKAT or a tax advisor.",
    da: "Alle beregninger er vejledende og kan variere afhængigt af din specifikke situation. Bekræft altid med SKAT eller en skatterådgiver.",
    it: "Tutti i calcoli sono indicativi e possono variare in base alla tua situazione specifica. Verifica sempre con SKAT o un consulente fiscale.",
    de: "Alle Berechnungen sind indikativ und können je nach individueller Situation variieren. Überprüfen Sie immer mit SKAT oder einem Steuerberater.",
  },
  "method.calc.title": { en: "Step by step", da: "Trin for trin", it: "Passo per passo", de: "Schritt für Schritt" },
  "method.formula.title": { en: "The formula", da: "Formlen", it: "La formula", de: "Die Formel" },
  "method.formula.subtitle": {
    en: "This is the actual calculation we run for a full-time salary — simplified to the essential steps.",
    da: "Dette er den faktiske beregning, vi kører for en fuldtidsløn — forenklet til de væsentlige trin.",
    it: "Questo è il calcolo effettivo che eseguiamo per uno stipendio a tempo pieno — semplificato ai passaggi essenziali.",
    de: "Dies ist die tatsächliche Berechnung für ein Vollzeitgehalt — vereinfacht auf die wesentlichen Schritte.",
  },
  "method.calc.fulltime": { en: "Full-time salary", da: "Fuldtidsløn", it: "Stipendio a tempo pieno", de: "Vollzeitgehalt" },
  "method.calc.fulltime.am": { en: "AM-bidrag: 8.0 % of gross income minus employee pension", da: "AM-bidrag: 8,0 % af bruttoindkomst minus medarbejderpension", it: "AM-bidrag: 8,0 % del reddito lordo meno la pensione del dipendente", de: "AM-Beitrag: 8,0 % des Bruttoeinkommens abzüglich Arbeitnehmerrente" },
  "method.calc.fulltime.ferie": { en: "Ferietillæg: 1 % of gross salary", da: "Ferietillæg: 1 % af bruttoløn", it: "Ferietillæg: 1 % dello stipendio lordo", de: "Ferietillæg: 1 % des Bruttogehalts" },
  "method.calc.fulltime.bundskat": { en: "Bundskat: 12.01 % (income after AM minus personfradrag)", da: "Bundskat: 12,01 % (indkomst efter AM minus personfradrag)", it: "Bundskat: 12,01 % (reddito dopo AM meno personfradrag)", de: "Bundskat: 12,01 % (Einkommen nach AM minus Personfradrag)" },
  "method.calc.fulltime.kommune": { en: "Kommuneskat: actual kommun rate applied to reduced base", da: "Kommuneskat: den faktiske kommunesats anvendt på reduceret grundlag", it: "Kommuneskat: aliquota comunale effettiva applicata alla base ridotta", de: "Kommuneskat: tatsächlicher Gemeindesteuersatz auf reduzierter Bemessungsgrundlage" },
  "method.calc.fulltime.progressive": { en: "Progressive brackets: mellemskat 7.5 %, topskat 7.5 %, toptopskat 5 %", da: "Progressive trin: mellemskat 7,5 %, topskat 7,5 %, toptopskat 5 %", it: "Scaglioni progressivi: mellemskat 7,5 %, topskat 7,5 %, toptopskat 5 %", de: "Progressive Stufen: Mellemskat 7,5 %, Topskat 7,5 %, Toptopskat 5 %" },
  "method.calc.fulltime.skatteloft": { en: "Skatteloft: combined state + municipal rate capped at 44.57 %", da: "Skatteloft: samlet stats- og kommuneskattesats begrænset til 44,57 %", it: "Skatteloft: aliquota combinata statale + comunale limitata al 44,57 %", de: "Skatteloft: kombinierter Staats- + Gemeindesteuersatz begrenzt auf 44,57 %" },
  "method.calc.fulltime.beskfradrag": { en: "Beskæftigelsesfradrag: 12.75 % (max 63,300 kr/yr)", da: "Beskæftigelsesfradrag: 12,75 % (maks. 63.300 kr/år)", it: "Beskæftigelsesfradrag: 12,75 % (max 63.300 kr/anno)", de: "Beskæftigelsesfradrag: 12,75 % (max. 63.300 kr/Jahr)" },
  "method.calc.fulltime.jobfradrag": { en: "Jobfradrag: 4.50 % (max 3,100 kr/yr)", da: "Jobfradrag: 4,50 % (maks. 3.100 kr/år)", it: "Jobfradrag: 4,50 % (max 3.100 kr/anno)", de: "Jobfradrag: 4,50 % (max. 3.100 kr/Jahr)" },
  "method.calc.fulltime.atp": { en: "ATP: deducted from pay", da: "ATP: trukket fra løn", it: "ATP: detratto dalla retribuzione", de: "ATP: vom Gehalt abgezogen" },
  "method.calc.parttime": { en: "Part-time / hourly", da: "Deltid / timeløn", it: "Part-time / paga oraria", de: "Teilzeit / Stundenlohn" },
  "method.calc.parttime.same": { en: "Same tax engine as full-time, with these differences:", da: "Samme skatteberegning som fuldtid, med disse forskelle:", it: "Stesso motore fiscale del tempo pieno, con queste differenze:", de: "Gleiche Steuerberechnung wie Vollzeit, mit diesen Unterschieden:" },
  "method.calc.parttime.feriepenge": { en: "Feriepenge: 12.5 % of gross (instead of 1 % ferietillæg)", da: "Feriepenge: 12,5 % af brutto (i stedet for 1 % ferietillæg)", it: "Feriepenge: 12,5 % del lordo (invece dell'1 % di ferietillæg)", de: "Feriepenge: 12,5 % des Brutto (statt 1 % Ferietillæg)" },
  "method.calc.parttime.atp": { en: "ATP may not apply if under 9 h/week", da: "ATP gælder muligvis ikke ved under 9 t/uge", it: "L'ATP potrebbe non applicarsi se sotto le 9 ore/settimana", de: "ATP gilt möglicherweise nicht bei unter 9 Std./Woche" },
  "method.calc.student": { en: "Student (SU + work)", da: "Studerende (SU + arbejde)", it: "Studente (SU + lavoro)", de: "Student (SU + Arbeit)" },
  "method.calc.student.su_no_am": { en: "SU is not subject to AM-bidrag", da: "SU er ikke underlagt AM-bidrag", it: "La SU non è soggetta all'AM-bidrag", de: "SU unterliegt nicht dem AM-Beitrag" },
  "method.calc.student.work_am": { en: "Work income is subject to AM-bidrag", da: "Arbejdsindkomst er underlagt AM-bidrag", it: "Il reddito da lavoro è soggetto all'AM-bidrag", de: "Arbeitseinkommen unterliegt dem AM-Beitrag" },
  "method.calc.student.fribeloeb": { en: "Fribeløb (earned income limit): checked against annual threshold", da: "Fribeløb (indkomstgrænse): kontrolleres mod den årlige grænse", it: "Fribeløb (limite di reddito): verificato rispetto alla soglia annuale", de: "Fribeløb (Einkommensgrenze): wird gegen den Jahrsschwellenwert geprüft" },
  "method.calc.student.excess": { en: "Excess above fribeløb triggers krone-for-krone SU repayment", da: "Overskridelse af fribeløb udløser krone-for-krone SU-tilbagebetaling", it: "L'eccedenza oltre il fribeløb attiva il rimborso SU corona per corona", de: "Überschuss über Fribeløb löst Krone-für-Krone SU-Rückzahlung aus" },
  "method.calc.student.interest": { en: "Repayment interest: 9.75 % p.a.", da: "Tilbagebetalingsrente: 9,75 % p.a.", it: "Interesse di rimborso: 9,75 % annuo", de: "Rückzahlungszins: 9,75 % p.a." },
  "method.calc.student.personfradrag": { en: "Personfradrag covers combined SU + work income", da: "Personfradrag dækker samlet SU + arbejdsindkomst", it: "Il personfradrag copre il reddito combinato SU + lavoro", de: "Personfradrag deckt kombiniertes SU + Arbeitseinkommen" },
  "method.sources.title": { en: "Data sources", da: "Datakilder", it: "Fonti dei dati", de: "Datenquellen" },
  "method.sources.skat": { en: "skat.dk/hjaelp/satser — official tax rates", da: "skat.dk/hjaelp/satser — officielle skattesatser", it: "skat.dk/hjaelp/satser — aliquote fiscali ufficiali", de: "skat.dk/hjaelp/satser — offizielle Steuersätze" },
  "method.sources.skm": { en: "skm.dk — municipal tax rates for all 98 kommuner", da: "skm.dk — kommunale skattesatser for alle 98 kommuner", it: "skm.dk — aliquote comunali per tutti i 98 comuni", de: "skm.dk — Gemeindesteuersätze für alle 98 Kommunen" },
  "method.sources.su": { en: "su.dk/satser — SU grant amounts and fribeløb limits", da: "su.dk/satser — SU-beløb og fribeløbsgrænser", it: "su.dk/satser — importi SU e limiti fribeløb", de: "su.dk/satser — SU-Beträge und Fribeløb-Grenzen" },
  "method.sources.life": { en: "lifeindenmark.borger.dk — SU repayment interest rate", da: "lifeindenmark.borger.dk — SU-tilbagebetalingsrente", it: "lifeindenmark.borger.dk — tasso di interesse per il rimborso SU", de: "lifeindenmark.borger.dk — SU-Rückzahlungszinssatz" },
  "method.sources.updated": { en: "Last updated: February 2026", da: "Sidst opdateret: februar 2026", it: "Ultimo aggiornamento: febbraio 2026", de: "Zuletzt aktualisiert: Februar 2026" },
  "method.disclaimer.title": { en: "Disclaimer", da: "Ansvarsfraskrivelse", it: "Avvertenza", de: "Haftungsausschluss" },
  "method.disclaimer.important": {
    en: "Important: All calculations are indicative and without guarantee.",
    da: "Vigtigt: Alle beregninger er vejledende og uden garanti.",
    it: "Importante: tutti i calcoli sono indicativi e senza garanzia.",
    de: "Wichtig: Alle Berechnungen sind indikativ und ohne Gewähr.",
  },
  "method.disclaimer.body": {
    en: "Tax calculations can be complex and depend on many individual factors. This tool is designed as an estimate and should not replace professional advice.",
    da: "Skatteberegninger kan være komplekse og afhænge af mange individuelle faktorer. Dette værktøj er tænkt som et estimat og bør ikke erstatte professionel rådgivning.",
    it: "I calcoli fiscali possono essere complessi e dipendere da molti fattori individuali. Questo strumento è progettato come stima e non sostituisce la consulenza professionale.",
    de: "Steuerberechnungen können komplex sein und von vielen individuellen Faktoren abhängen. Dieses Tool ist als Schätzung gedacht und ersetzt keine professionelle Beratung.",
  },
  "method.footer": { en: "© 2026 DK Income Calculator. Open source project.", da: "© 2026 DK Income Calculator. Open source-projekt.", it: "© 2026 DK Income Calculator. Progetto open source.", de: "© 2026 DK Income Calculator. Open-Source-Projekt." },
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
      if (saved === "da" || saved === "en" || saved === "it" || saved === "de") return saved;
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
