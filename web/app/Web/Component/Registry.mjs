/** @namespace Mindstream_Web_Component_Registry */
export default class Mindstream_Web_Component_Registry {
  constructor({
    Mindstream_Web_Platform_Browser$: browser,
    Mindstream_Web_Component_Feed$: Feed,
    Mindstream_Web_Component_IdentityMenu$: IdentityMenu,
  }) {
    this.register = function () {
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
  default: Object.freeze({
    'Mindstream_Web_Platform_Browser$': 'Mindstream_Web_Platform_Browser$',
    'Mindstream_Web_Component_Feed$': 'Mindstream_Web_Component_Feed$',
    'Mindstream_Web_Component_IdentityMenu$': 'Mindstream_Web_Component_IdentityMenu$',
  }),
});
