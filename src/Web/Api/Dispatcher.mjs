/**
 * @module Mindstream_Back_Web_Api_Dispatcher
 * @description Matches API paths to endpoint handlers.
 */
export default class Mindstream_Back_Web_Api_Dispatcher {
  constructor({ Mindstream_Back_Web_Api_FeedView$: feedView }) {
    const handlers = new Map([
      ['/feed', feedView],
    ]);

    this.resolve = function (path) {
      return handlers.get(path);
    };
  }
}
