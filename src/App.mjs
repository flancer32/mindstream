export default class Mindstream_Back_App {
  constructor({ Mindstream_Back_App_Configuration$: config }) {
    this.run = async function ({ projectRoot } = {}) {
      await config.init(projectRoot);
    };

    this.stop = async function () {
    };
  }
}
