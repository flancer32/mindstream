// @ts-check
/** @namespace Mindstream_Web_App  @description DI-managed Mindstream module. */
export default class Mindstream_Web_App {
  /**
 * @param {object} deps
 * @param {Mindstream_Web_Component_Registry$} deps.registry
 */
constructor({ registry }) {
    /**
 * @returns {unknown}
 */
this.start = function () {
      registry.register();
    };
  }
}

export const __deps__ = Object.freeze({
  default: {
    registry: 'Mindstream_Web_Component_Registry$',
  },
});
