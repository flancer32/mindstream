// @ts-check
/** @namespace Mindstream_Web_Component_Registry  @description DI-managed Mindstream module. */
export default class Mindstream_Web_Component_Registry {
  /**
 * @param {object} deps
 * @param {Mindstream_Web_Platform_Browser$} deps.browser
 * @param {Mindstream_Web_Component_Feed$} deps.Feed
 * @param {Mindstream_Web_Component_IdentityMenu$} deps.IdentityMenu
 */
constructor({
    browser,
    Feed,
    IdentityMenu,
  }) {
    /**
 * @returns {unknown}
 */
this.register = /**
 * @returns {unknown}
 */
function () {
      const registry = browser.getWindow()?.customElements ?? globalThis.customElements;
      if (!registry.get('mindstream-identity-menu')) {
        registry.define('mindstream-identity-menu', IdentityMenu);
      }
      if (!registry.get('mindstream-feed')) {
        registry.define('mindstream-feed', Feed);
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: {
    browser: 'Mindstream_Web_Platform_Browser$',
    Feed: 'Mindstream_Web_Component_Feed$',
    IdentityMenu: 'Mindstream_Web_Component_IdentityMenu$',
  },
});
