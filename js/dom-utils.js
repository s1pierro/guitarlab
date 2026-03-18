export function createElement(
  tag,
  textContent,
  classString,
  id,
  data,
  eventType,
  callback
) {
  const el = document.createElement(tag);

  if (textContent) el.innerHTML = textContent;
  if (classString) el.className = classString;
  if (id) el.id = id;

  if (data) {
    for (const k in data) el.dataset[k] = data[k];
  }

  if (eventType && callback) {
    el.addEventListener(eventType, callback);
  }

  return el;
}
export function div(
  textContent,
  classString,
  id,
  data,
  eventType,
  callback
) {
  return createElement(
    'div',
    textContent,
    classString,
    id,
    data,
    eventType,
    callback
  );
}
export function l(s) {
  console.log(s);
}
export function genUid(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  //const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}
export function i(icn) {
  const ic = createElement('span', '', icn);
  return ic;
}
let ICON_MAP = {};
let ICONS_LOADED = false;

  function normalizeIconName(filename) {
    return filename
      .replace(/\.[^/.]+$/, '')          // supprime extension
      .replace(/^[a-z0-9]+--/, '')       // supprime prefix librairie (ex: tabler--)
      .split('-')                        // découpe
      .map((part, i) => {
        if (i === 0) return part.toLowerCase();
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  }
export async function loadIcons() {
  try {
    const res = await fetch('icons/index.json');
    const files = await res.json();

    ICON_MAP = {};
    files.forEach(filename => {
      const key = normalizeIconName(filename);
      ICON_MAP[key] = `icons/${filename}`;
    });

    ICONS_LOADED = true;
    console.log(`🧩 ${Object.keys(ICON_MAP).length} icônes chargées`, ICON_MAP);
  } catch (err) {
    console.warn('⚠ Impossible de charger les icônes :', err);
  }
}
export function ic(name) {
  const span = document.createElement('span');
  span.className = 'icon';

  if (!ICONS_LOADED) {
    console.warn('⚠ ICONS non chargées. Appelle loadIcons() au démarrage.');
  }

  const url = ICON_MAP[name];
  if (!url) {
    console.warn(`❓ Icône inconnue: "${name}"`);
    return span;
  }

  // URL absolue — évite les problèmes de résolution des url() dans les custom properties CSS
  const absUrl = new URL(url, document.baseURI).href;
  span.style.setProperty('-webkit-mask-image', `url("${absUrl}")`);
  span.style.setProperty('mask-image', `url("${absUrl}")`);
  return span;
} 