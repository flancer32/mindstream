/**
 * @module Mindstream_Back_Runtime_Web_HandlerRegistry
 * @description Registers application HTTP handlers in the web dispatcher.
 */
export default class Mindstream_Back_Runtime_Web_HandlerRegistry {
  constructor({
    Mindstream_Shared_Logger$: logger,
    Fl32_Web_Back_Dispatcher$: dispatcher,
    Mindstream_Back_Runtime_Web_HandlerList$: handlerList,
  }) {
    const NAMESPACE = 'Mindstream_Back_Runtime_Web_HandlerRegistry';

    const resolveHandlers = function () {
      const handlers = handlerList?.get?.() ?? [];
      if (!Array.isArray(handlers)) {
        throw new Error('Runtime web handler list must be an array.');
      }
      return handlers;
    };

    this.register = async function () {
      const handlers = resolveHandlers();
      for (const handler of handlers) {
        dispatcher.addHandler(handler);
      }
      if (logger?.info) {
        logger.info(NAMESPACE, `Registered ${handlers.length} HTTP handler(s).`);
      }
    };
  }
}
