/** @namespace Mindstream_Web_Identity */
export default class Mindstream_Web_Identity {
  constructor({ Mindstream_Web_Platform_Browser$: browser }) {
    const STORAGE_IDENTITY_KEY = 'mindstream.identity.uuid';
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
    let cachedIdentity = null;
    let identityLoaded = false;
    let registeredInSession = false;
    const storage = () => browser.getStorage();
    const normalizeIdentity = (value) => typeof value === 'string' && UUID_RE.test(value.trim()) ? value.trim() : null;
    const load = () => {
      if (!identityLoaded) {
        identityLoaded = true;
        cachedIdentity = normalizeIdentity(storage()?.getItem(STORAGE_IDENTITY_KEY));
      }
      return cachedIdentity;
    };
    const send = (path, payload) => {
      const navigator = browser.getNavigator();
      if (typeof navigator?.sendBeacon !== 'function') return false;
      try {
        const origin = browser.getLocation()?.origin;
        const url = origin ? new browser.URL(path, origin).toString() : path;
        const body = browser.Blob ? new browser.Blob([JSON.stringify(payload)], { type: 'application/json' }) : JSON.stringify(payload);
        return navigator.sendBeacon(url, body);
      } catch { return false; }
    };
    const register = (identity) => {
      if (identity && !registeredInSession) {
        registeredInSession = true;
        send('/api/identity', { identity });
      }
    };
    const uuid = () => {
      if (browser.crypto?.randomUUID) return browser.crypto.randomUUID();
      const bytes = new Uint8Array(16);
      browser.crypto?.getRandomValues?.(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
      return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
    };
    this.getIdentity = () => load();
    this.activateIdentity = () => {
      const identity = load() ?? uuid();
      cachedIdentity = identity;
      identityLoaded = true;
      try { storage()?.setItem(STORAGE_IDENTITY_KEY, identity); } catch {}
      register(identity);
      return identity;
    };
    this.ensureIdentityRegistered = () => { const identity = load(); register(identity); return identity; };
    this.sendAttentionSignal = ({ type, pubId } = {}) => {
      const identity = load();
      const publicationId = Number(pubId);
      const attentionType = ({ overview_open: 'overview_view', source_click: 'link_click', source_click_after_overview: 'link_click_after_overview' })[type];
      if (!identity || !Number.isFinite(publicationId) || !attentionType) return false;
      register(identity);
      return send('/api/attention', { identity, publication_id: publicationId, attention_type: attentionType });
    };
    this.watchIdentity = (onChange) => {
      if (typeof onChange !== 'function') return () => {};
      const handler = (event) => {
        if (event?.key && event.key !== STORAGE_IDENTITY_KEY) return;
        identityLoaded = false;
        onChange(load());
      };
      browser.addEventListener('storage', handler);
      return () => browser.removeEventListener('storage', handler);
    };
  }
}

export const __deps__ = Object.freeze({ default: Object.freeze({ 'Mindstream_Web_Platform_Browser$': 'Mindstream_Web_Platform_Browser$' }) });
