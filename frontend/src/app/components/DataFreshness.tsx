import { useFreshness } from "../utils/freshness";
import { useI18n } from "../utils/i18n";

const locales = { en: "en-GB", da: "da-DK", it: "it-IT", de: "de-DE", sv: "sv-SE", es: "es-ES", nb: "nb-NO" };

export function DataFreshness({ details = false, link = true }: { details?: boolean; link?: boolean }) {
  const freshness = useFreshness();
  const { t, lang } = useI18n();
  if (!freshness) return <p className="text-xs text-muted-foreground">{t("freshness.unavailable")}</p>;

  const format = (value: string, includeTime = false) => {
    const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
    if (Number.isNaN(date.getTime())) return t("freshness.unavailable");
    return new Intl.DateTimeFormat(locales[lang], {
      dateStyle: "long", ...(includeTime ? { timeStyle: "short" as const } : {}), timeZone: "Europe/Copenhagen",
    }).format(date);
  };

  return (
    <div className="text-xs text-muted-foreground space-y-2">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span>{t("freshness.taxYear").replace("{year}", String(freshness.taxYear))}</span>
        <span aria-hidden="true">·</span>
        <span>{t("freshness.rulesChecked")} <time dateTime={freshness.rulesVerifiedOn}>{format(freshness.rulesVerifiedOn)}</time></span>
        {link && <a href="/how-it-works#sources" className="underline underline-offset-2 hover:text-foreground">{t("freshness.details")}</a>}
      </p>
      {freshness.siteUpdatedAt && <p>{t("freshness.siteUpdated")} <time dateTime={freshness.siteUpdatedAt}>{format(freshness.siteUpdatedAt, details)}</time>{details && " (Europe/Copenhagen)"}</p>}
      {details && <p>{t("freshness.explanation")}</p>}
    </div>
  );
}
