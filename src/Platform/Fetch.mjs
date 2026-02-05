/**
 * @module Mindstream_Back_Platform_Fetch
 * @description Platform fetch adapter for backend code.
 */
export default class Mindstream_Back_Platform_Fetch {
  constructor({}) {
    this.fetch = async function (...args) {
      return await fetch(...args);
    };
  }
}
