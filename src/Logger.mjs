// @ts-check
/**
 * @namespace Mindstream_Back_Logger
 * @description DI-managed Mindstream module.
 */
export default class Mindstream_Back_Logger {
/**
 * @param {unknown} deps
 * @param {unknown} deps.provider
 */
constructor({ provider }) {
    /** @param {string} namespace @returns {void} */
    /**
 * @param {unknown} namespace
 * @returns {unknown}
 */
/**
 * @param {unknown} namespace
 * @returns {unknown}
 */
const requireNamespace = (namespace) => {
      if (!namespace) throw new Error('Namespace is required.');
    };
    /** @param {string} message @returns {void} */
    /**
 * @param {unknown} message
 * @returns {unknown}
 */
/**
 * @param {unknown} message
 * @returns {unknown}
 */
const requireMessage = (message) => {
      if (typeof message !== 'string') throw new TypeError('Message must be a string.');
    };
    /** @param {string} namespace @returns {TeqFw_Log_Logger} */
    /**
 * @param {unknown} namespace
 * @returns {unknown}
 */
/**
 * @param {unknown} namespace
 * @returns {unknown}
 */
const getLogger = (namespace) => provider.forSource(namespace);

    /** @param {string} namespace @param {string} message @param {TeqFw_Log_Data} data @returns {void} */
    /**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
/**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
this.debug = (namespace, message, data) => {
      requireNamespace(namespace); requireMessage(message); getLogger(namespace).debug(message, data);
    };
    /** @param {string} namespace @param {string} message @param {TeqFw_Log_Data} data @returns {void} */
    /**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
/**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
this.info = (namespace, message, data) => {
      requireNamespace(namespace); requireMessage(message); getLogger(namespace).info(message, data);
    };
    /** @param {string} namespace @param {string} message @param {TeqFw_Log_Data} data @returns {void} */
    /**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
/**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
this.warn = (namespace, message, data) => {
      requireNamespace(namespace); requireMessage(message); getLogger(namespace).warn(message, data);
    };
    /** @param {string} namespace @param {string} message @param {TeqFw_Log_Data} data @returns {void} */
    /**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
/**
 * @param {unknown} namespace
 * @param {unknown} message
 * @param {unknown} data
 * @returns {unknown}
 */
this.error = (namespace, message, data) => {
      requireNamespace(namespace); requireMessage(message); getLogger(namespace).error(message, data);
    };
    /** @param {string} namespace @param {Error} error @returns {void} */
    /**
 * @param {unknown} namespace
 * @param {unknown} error
 * @returns {unknown}
 */
/**
 * @param {unknown} namespace
 * @param {unknown} error
 * @returns {unknown}
 */
this.exception = (namespace, error) => {
      requireNamespace(namespace);
      if (!(error instanceof Error)) throw new TypeError('Error instance is required.');
      getLogger(namespace).error(error.message, { err: error });
    };
  }
}

export const __deps__ = Object.freeze({
  provider: 'TeqFw_Log_Provider$',
});
