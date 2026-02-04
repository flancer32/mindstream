export default class Mindstream_Shared_Logger {
  constructor({}) {
    const assertNamespace = (namespace) => {
      if (!namespace) throw new Error('Namespace is required');
    };

    const assertMessage = (message) => {
      if (typeof message !== 'string') throw new TypeError('Message must be a string');
    };

    const assertError = (error) => {
      if (!(error instanceof Error)) throw new TypeError('Error instance is required');
    };

    const buildEntry = (level, namespace, message, args, extra = {}) => ({
      timestamp: new Date().toISOString(),
      level,
      namespace,
      message,
      args,
      ...extra,
    });

    const write = (method, entry) => {
      if (console && typeof console[method] === 'function') {
        console[method](entry);
      }
    };

    this.debug = function (namespace, message, ...args) {
      assertNamespace(namespace);
      assertMessage(message);
      write('debug', buildEntry('debug', namespace, message, args));
    };

    this.info = function (namespace, message, ...args) {
      assertNamespace(namespace);
      assertMessage(message);
      write('info', buildEntry('info', namespace, message, args));
    };

    this.warn = function (namespace, message, ...args) {
      assertNamespace(namespace);
      assertMessage(message);
      write('warn', buildEntry('warn', namespace, message, args));
    };

    this.error = function (namespace, message, ...args) {
      assertNamespace(namespace);
      if (message instanceof Error) {
        throw new TypeError('Use exception() to log Error objects');
      }
      assertMessage(message);
      write('error', buildEntry('error', namespace, message, args));
    };

    this.exception = function (namespace, error, ...args) {
      assertNamespace(namespace);
      assertError(error);
      const extra = {
        errorMessage: error.message,
        errorStack: error.stack,
      };
      if (error.cause !== undefined) {
        extra.errorCause = error.cause;
      }
      write('error', buildEntry('exception', namespace, error.message, args, extra));
    };
  }
}
