import type { CurvePoint } from "./api";

export const TAX_COLORS: Record<CurvePoint["tax_band"], string> = {
  Bundskat: "#22c55e", Mellemskat: "#f59e0b", Topskat: "#ef4444", Toptopskat: "#a855f7",
};

export function chartBands<T extends Pick<CurvePoint, "tax_band" | "tax_boundary" | "tax_band_after">>(
  points: T[], x: (point: T) => number, max: number,
) {
  const boundaries = points.filter(point => point.tax_boundary);
  let start = 0;
  let band = points[0]?.tax_band ?? "Bundskat";
  const areas = boundaries.map(point => {
    const area = { start, end: x(point), color: TAX_COLORS[band] };
    start = x(point);
    band = point.tax_band_after ?? point.tax_boundary!;
    return area;
  });
  areas.push({ start, end: max, color: TAX_COLORS[band] });
  return { areas, boundaries };
}
