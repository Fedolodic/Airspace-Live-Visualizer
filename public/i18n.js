let strings = {};

export async function loadLocale() {
  const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  const file = `strings-${lang}.json`;
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error('locale missing');
    strings = await res.json();
  } catch (e) {
    const res = await fetch('strings-en.json');
    strings = await res.json();
  }
}

export function t(key) {
  return strings[key] || key;
}
