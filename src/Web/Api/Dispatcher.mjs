/**
 * @module Mindstream_Back_Web_Api_Dispatcher
 * @description Matches API paths to endpoint handlers.
 */
export default class Mindstream_Back_Web_Api_Dispatcher {
  constructor({}) {
    const handlers = new Map();

    this.resolve = function (path) {
      return handlers.get(path);
    };
  }
}
