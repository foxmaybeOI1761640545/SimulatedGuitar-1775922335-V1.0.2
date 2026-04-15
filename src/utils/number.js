function normalizeDelayMs(value, fallback, min, max) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  const rounded = Math.round(value);
  return Math.min(max, Math.max(min, rounded));
}

export {
  normalizeDelayMs
};
