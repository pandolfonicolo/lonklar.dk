"""Sample charts at actual engine thresholds, without duplicating tax formulas."""

from functools import lru_cache


def hours_samples(max_hours, step, atp_auto):
    values = set(range(0, max_hours + 1, step)) | {max_hours}
    if atp_auto:
        # Preserve both sides of the discontinuous monthly ATP bands.
        for h in (39, 78, 117):
            if h <= max_hours:
                values.update((h - 0.000001, h))
    return sorted(values)


def sample_boundaries(values, evaluate, metric, thresholds):
    """Return (x, engine result, boundary label) including threshold crossings.

    Thresholds use the engine's personal-income/egenindkomst values. The
    returned x is also a curve sample, so shaded areas and lines share it.
    """
    evaluate = lru_cache(maxsize=None)(evaluate)
    values = sorted(set(values))
    boundaries = {}
    for left, right in zip(values, values[1:]):
        a, b = evaluate(left)[metric], evaluate(right)[metric]
        for threshold, label in thresholds:
            if (a <= threshold <= b and a < b) or (b < threshold <= a):
                lo, hi = left, right
                increasing = b > a
                for _ in range(40):
                    mid = (lo + hi) / 2
                    if (evaluate(mid)[metric] < threshold) == increasing:
                        lo = mid
                    else:
                        hi = mid
                x = round((lo + hi) / 2, 8)
                boundaries[x] = label
    return [(x, evaluate(x), boundaries.get(x))
            for x in sorted(set(values) | set(boundaries))]
