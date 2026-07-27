// @ts-check
/** @namespace Mindstream_Web_Platform_Browser  @description DI-managed Mindstream module. */
export default class Mindstream_Web_Platform_Browser {
  /**
 */
constructor() {
    this.document = globalThis.document;
    this.HTMLElement = globalThis.HTMLElement;
    this.IntersectionObserver = globalThis.IntersectionObserver;
    this.URL = globalThis.URL;
    this.Blob = globalThis.Blob;
    this.crypto = globalThis.crypto;
    this.fetch = globalThis.fetch?.bind(globalThis);
    /**
 * @returns {unknown}
 */
this.getStorage = /**
 * @returns {unknown}
 */
() => globalThis.localStorage;
    /**
 * @returns {unknown}
 */
this.getNavigator = /**
 * @returns {unknown}
 */
() => globalThis.navigator;
    /**
 * @returns {unknown}
 */
this.getLocation = /**
 * @returns {unknown}
 */
() => globalThis.location;
    /**
 * @returns {unknown}
 */
this.getWindow = /**
 * @returns {unknown}
 */
() => globalThis.window;
    /**
 * @returns {unknown}
 */
this.addEventListener = /**
 * @returns {unknown}
 */
(...args) => globalThis.addEventListener(...args);
    /**
 * @returns {unknown}
 */
this.removeEventListener = /**
 * @returns {unknown}
 */
(...args) => globalThis.removeEventListener(...args);
  }
}
