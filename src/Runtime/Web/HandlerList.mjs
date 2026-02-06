/**
 * @module Mindstream_Back_Runtime_Web_HandlerList
 * @description Provides the list of HTTP handlers for the runtime web server.
 */
export default class Mindstream_Back_Runtime_Web_HandlerList {
  constructor({}) {
    const handlers = Object.freeze([]);

    this.get = function () {
      return handlers;
    };
  }
}
