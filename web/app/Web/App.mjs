/** @namespace Mindstream_Web_App */
export default class Mindstream_Web_App {
  constructor({ Mindstream_Web_Component_Registry$: registry }) {
    this.start = function () {
      registry.register();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    'Mindstream_Web_Component_Registry$': 'Mindstream_Web_Component_Registry$',
  }),
});
