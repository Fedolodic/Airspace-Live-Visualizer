export function validateFlights(raw) {
  if (!Array.isArray(raw)) return [];
  const valid = [];
  for (const f of raw) {
    if (!Array.isArray(f) || f.length < 14) continue;
    const lon = Number(f[5]);
    const lat = Number(f[6]);
    const alt = Number(f[7] ?? f[13] ?? 0);
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || !Number.isFinite(alt)) {
      continue;
    }
    valid.push(f);
  }
  return valid;
}
