// @ts-check
/** @namespace Mindstream_Web_Platform_Browser  @description DI-managed Mindstream module. */
export default class Mindstream_Web_Platform_Browser {
  /**
 */
constructor() {
    /** @type {Document} */
    this.document = globalThis.document;
    /** @type {typeof HTMLElement} */
    this.HTMLElement = globalThis.HTMLElement;
    /** @type {typeof IntersectionObserver} */
    this.IntersectionObserver = globalThis.IntersectionObserver;
    /** @type {typeof URL} */
    this.URL = globalThis.URL;
    /** @type {typeof Blob} */
    this.Blob = globalThis.Blob;
    /** @type {Crypto} */
    this.crypto = globalThis.crypto;
    /** @type {typeof fetch} */
    this.fetch = globalThis.fetch?.bind(globalThis);
    /** @returns {Storage} */
    this.getStorage = () => globalThis.localStorage;
    /** @returns {Navigator} */
    this.getNavigator = () => globalThis.navigator;
    /** @returns {Location} */
    this.getLocation = () => globalThis.location;
    /** @returns {Window} */
    this.getWindow = () => globalThis.window;
    /** @type {typeof globalThis.addEventListener} */
    this.addEventListener = globalThis.addEventListener.bind(globalThis);
    /** @type {typeof globalThis.removeEventListener} */
    this.removeEventListener = globalThis.removeEventListener.bind(globalThis);
  }
}
