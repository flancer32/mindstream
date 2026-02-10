// Anonymous identity management for attention beacons (frontend-only).
const STORAGE_IDENTITY_KEY = 'mindstream.identity.uuid';
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

let cachedIdentity = null;
let identityLoaded = false;
let registeredInSession = false;

const getStorage = () => {
  if (typeof globalThis.localStorage !== 'undefined') {
    return globalThis.localStorage;
  }
  return {
    _data: new Map(),
    getItem(key) {
      return this._data.has(key) ? this._data.get(key) : null;
    },
    setItem(key, value) {
      this._data.set(key, String(value));
    },
    removeItem(key) {
      this._data.delete(key);
    },
  };
};

const normalizeIdentity = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return UUID_RE.test(trimmed) ? trimmed : null;
};

const loadIdentity = () => {
  if (identityLoaded) return;
  identityLoaded = true;
  const storage = getStorage();
  cachedIdentity = normalizeIdentity(storage.getItem(STORAGE_IDENTITY_KEY));
};

const persistIdentity = (identity) => {
  const storage = getStorage();
  try {
    storage.setItem(STORAGE_IDENTITY_KEY, identity);
  } catch {
    // Ignore storage write failures in MVP.
  }
};

const generateUuid = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
};

const sendBeaconJson = (path, payload) => {
  if (typeof globalThis.navigator?.sendBeacon !== 'function') return false;
  try {
    const url = globalThis.location?.origin
      ? new URL(path, globalThis.location.origin).toString()
      : path;
    const body =
      typeof Blob === 'undefined'
        ? JSON.stringify(payload)
        : new Blob([JSON.stringify(payload)], { type: 'application/json' });
    return globalThis.navigator.sendBeacon(url, body);
  } catch {
    return false;
  }
};

const ensureRegistered = (identity) => {
  if (!identity || registeredInSession) return;
  registeredInSession = true;
  sendBeaconJson('/api/identity', { identity });
};

const normalizePublicationId = (value) => {
  if (value === undefined || value === null) return null;
  const raw = typeof value === 'string' ? value.trim() : String(value);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

const ATTENTION_TYPE_MAP = Object.freeze({
  overview_open: 'overview_view',
  source_click: 'link_click',
  source_click_after_overview: 'link_click_after_overview',
});

const normalizeAttentionType = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return ATTENTION_TYPE_MAP[trimmed] ?? null;
};

export const getIdentity = () => {
  loadIdentity();
  return cachedIdentity;
};

export const activateIdentity = () => {
  const existing = getIdentity();
  if (existing) {
    ensureRegistered(existing);
    return existing;
  }
  const identity = generateUuid();
  cachedIdentity = identity;
  identityLoaded = true;
  persistIdentity(identity);
  ensureRegistered(identity);
  return identity;
};

export const ensureIdentityRegistered = () => {
  const identity = getIdentity();
  if (!identity) return null;
  ensureRegistered(identity);
  return identity;
};

export const sendAttentionSignal = ({ type, pubId } = {}) => {
  const identity = getIdentity();
  if (!identity) return false;
  ensureRegistered(identity);
  const publicationId = normalizePublicationId(pubId);
  if (publicationId === null) return false;
  const attentionType = normalizeAttentionType(type);
  if (!attentionType) return false;
  return sendBeaconJson('/api/attention', {
    identity,
    publication_id: publicationId,
    attention_type: attentionType,
  });
};

export const watchIdentity = (onChange) => {
  if (typeof onChange !== 'function') return () => {};
  if (typeof globalThis.addEventListener !== 'function') return () => {};
  const handler = (event) => {
    if (event?.key && event.key !== STORAGE_IDENTITY_KEY) return;
    identityLoaded = false;
    loadIdentity();
    onChange(getIdentity());
  };
  globalThis.addEventListener('storage', handler);
  return () => {
    globalThis.removeEventListener('storage', handler);
  };
};

export const _testing = {
  _storageKey: STORAGE_IDENTITY_KEY,
};
