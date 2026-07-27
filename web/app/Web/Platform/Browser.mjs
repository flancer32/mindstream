/** @namespace Mindstream_Web_Platform_Browser */
export default class Mindstream_Web_Platform_Browser {
  constructor() {
    this.document = globalThis.document;
    this.HTMLElement = globalThis.HTMLElement;
    this.IntersectionObserver = globalThis.IntersectionObserver;
    this.URL = globalThis.URL;
    this.Blob = globalThis.Blob;
    this.crypto = globalThis.crypto;
    this.fetch = globalThis.fetch?.bind(globalThis);
    this.getStorage = () => globalThis.localStorage;
    this.getNavigator = () => globalThis.navigator;
    this.getLocation = () => globalThis.location;
    this.getWindow = () => globalThis.window;
    this.addEventListener = (...args) => globalThis.addEventListener(...args);
    this.removeEventListener = (...args) => globalThis.removeEventListener(...args);
  }
}
