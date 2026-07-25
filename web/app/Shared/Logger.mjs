// @ts-check
/**
 * @namespace Mindstream_Shared_Logger
 * @description Compatibility facade over the @teqfw/log source-bound logger provider.
 */
export default class Mindstream_Shared_Logger {
  /**
   * @param {Object} deps
   * @param {TeqFw_Log_Provider} deps.provider
   */
  constructor({ provider }) {
    /** @param {unknown} namespace @returns {void} */
    const assertNamespace = (namespace) => {
      if (!namespace) throw new Error('Namespace is required');
    };

    /** @param {unknown} message @returns {void} */
    const assertMessage = (message) => {
      if (typeof message !== 'string') throw new TypeError('Message must be a string');
    };

    /** @param {unknown} error @returns {void} */
    const assertError = (error) => {
      if (!(error instanceof Error)) throw new TypeError('Error instance is required');
    };

    /** @param {string} namespace @returns {TeqFw_Log_Logger} */
    const getLogger = (namespace) => provider.forSource(namespace);

    /**
     * @param {string} namespace
     * @param {string} message
     * @param {TeqFw_Log_Data} [data]
     * @returns {void}
     */
    this.debug = function (namespace, message, data) {
      assertNamespace(namespace);
      assertMessage(message);
      getLogger(namespace).debug(message, data);
    };

    /**
     * @param {string} namespace
     * @param {string} message
     * @param {TeqFw_Log_Data} [data]
     * @returns {void}
     */
    this.info = function (namespace, message, data) {
      assertNamespace(namespace);
      assertMessage(message);
      getLogger(namespace).info(message, data);
    };

    /**
     * @param {string} namespace
     * @param {string} message
     * @param {TeqFw_Log_Data} [data]
     * @returns {void}
     */
    this.warn = function (namespace, message, data) {
      assertNamespace(namespace);
      assertMessage(message);
      getLogger(namespace).warn(message, data);
    };

    /**
     * @param {string} namespace
     * @param {string} message
     * @param {TeqFw_Log_Data} [data]
     * @returns {void}
     */
    this.error = function (namespace, message, data) {
      assertNamespace(namespace);
      if (message instanceof Error) {
        throw new TypeError('Use exception() to log Error objects');
      }
      assertMessage(message);
      getLogger(namespace).error(message, data);
    };

    /**
     * @param {string} namespace
     * @param {Error} error
     * @returns {void}
     */
    this.exception = function (namespace, error) {
      assertNamespace(namespace);
      assertError(error);
      getLogger(namespace).error(error.message, { err: error });
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({ provider: 'TeqFw_Log_Provider$' }),
});
