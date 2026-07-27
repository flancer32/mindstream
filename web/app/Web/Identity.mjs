// @ts-check
/** @namespace Mindstream_Web_Identity  @description DI-managed Mindstream module. */
export default class Mindstream_Web_Identity {
  /**
 * @param {object} deps
 * @param {Mindstream_Web_Platform_Browser$} deps.browser
 * @param {Mindstream_Web_Transport_Beacon$} deps.beacon
 * @param {Mindstream_Shared_Api_Attention$} deps.attentionContract
 * @param {Mindstream_Shared_Api_Identity$} deps.identityContract
 */
constructor({ browser, beacon, attentionContract, identityContract }) {
    const STORAGE_IDENTITY_KEY = 'mindstream.identity.uuid';
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
    let cachedIdentity = null;
    let identityLoaded = false;
    let registeredInSession = false;
    /**
 * @returns {unknown}
 */
const storage = () => browser.getStorage();
    /**
 * @param {unknown} value
 * @returns {unknown}
 */
const normalizeIdentity = (value) => typeof value === 'string' && UUID_RE.test(value.trim()) ? value.trim() : null;
    /**
 * @returns {unknown}
 */
const load = () => {
      if (!identityLoaded) {
        identityLoaded = true;
        cachedIdentity = normalizeIdentity(storage()?.getItem(STORAGE_IDENTITY_KEY));
      }
      return cachedIdentity;
    };
    /**
 * @param {unknown} identity
 * @returns {unknown}
 */
const register = (identity) => {
      if (identity && !registeredInSession) {
        registeredInSession = true;
        beacon.sendJson('/api/identity', identityContract.createRegistration({ identity }));
      }
    };
    /**
 * @returns {unknown}
 */
const uuid = () => {
      if (browser.crypto?.randomUUID) return browser.crypto.randomUUID();
      const bytes = new Uint8Array(16);
      browser.crypto?.getRandomValues?.(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
      return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
    };
    /**
 * @returns {unknown}
 */
this.getIdentity = () => load();
    /**
 * @returns {unknown}
 */
this.activateIdentity = () => {
      const identity = load() ?? uuid();
      cachedIdentity = identity;
      identityLoaded = true;
      try { storage()?.setItem(STORAGE_IDENTITY_KEY, identity); } catch {}
      register(identity);
      return identity;
    };
    /**
 * @returns {unknown}
 */
this.ensureIdentityRegistered = () => { const identity = load(); register(identity); return identity; };
    /**
 * @param {unknown} payload
 * @returns {unknown}
 */
this.sendAttentionSignal = (payload = {}) => {
      const { type, pubId } = payload;
      const identity = load();
      const publicationId = Number(pubId);
      if (!identity || !Number.isFinite(publicationId)) return false;
      register(identity);
      try {
        return beacon.sendJson('/api/attention', attentionContract.createClientSignal({ identity, pubId: publicationId, type }));
      } catch {
        return false;
      }
    };
    /**
 * @param {unknown} onChange
 * @returns {unknown}
 */
this.watchIdentity = (onChange) => {
      if (typeof onChange !== 'function') return () => {};
      /**
 * @param {unknown} event
 * @returns {unknown}
 */
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

export const __deps__ = Object.freeze({
  default: {
    browser: 'Mindstream_Web_Platform_Browser$',
    beacon: 'Mindstream_Web_Transport_Beacon$',
    attentionContract: 'Mindstream_Shared_Api_Attention$',
    identityContract: 'Mindstream_Shared_Api_Identity$',
  },
});
