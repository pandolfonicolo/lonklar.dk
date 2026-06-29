const STORAGE_PREFIX = "lonklar:wizard";
export const WIZARD_STATE_VERSION = 1;
export const WIZARD_STATE_TTL_MS = 20 * 60 * 1000;

export type PersistedWizardPayload<T> = {
  version: number;
  savedAt: number;
  expiresAt: number;
  state: T;
};

function keyFor(serviceId: string): string {
  return `${STORAGE_PREFIX}:${serviceId}`;
}

function storageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function saveWizardState<T>(
  serviceId: string,
  state: T,
  now = Date.now(),
): void {
  if (!storageAvailable()) return;

  const payload: PersistedWizardPayload<T> = {
    version: WIZARD_STATE_VERSION,
    savedAt: now,
    expiresAt: now + WIZARD_STATE_TTL_MS,
    state,
  };

  try {
    window.localStorage.setItem(keyFor(serviceId), JSON.stringify(payload));
  } catch {
    // Ignore quota/private-mode failures; persistence is a convenience only.
  }
}

export function loadWizardState<T>(serviceId: string, now = Date.now()): T | null {
  if (!storageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(keyFor(serviceId));
    if (!raw) return null;

    const payload = JSON.parse(raw) as PersistedWizardPayload<T>;
    if (
      payload.version !== WIZARD_STATE_VERSION ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= now
    ) {
      clearWizardState(serviceId);
      return null;
    }

    return payload.state;
  } catch {
    clearWizardState(serviceId);
    return null;
  }
}

export function clearWizardState(serviceId: string): void {
  if (!storageAvailable()) return;

  try {
    window.localStorage.removeItem(keyFor(serviceId));
  } catch {
    // No-op.
  }
}
