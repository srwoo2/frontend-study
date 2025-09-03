'use strict';

const Homey = require('homey');

class MyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    // sdk와 통신
    this.log('MyApp has been initialized');

    // flow 자바스크립트 추가
    const card = this.homey.flow.getActionCard('log-something-to-the-console');
    card.registerRunListener(async (args, state) => {
      this.log('hello world');
      this.log(args.something);
      return true;

      // 보통 연동하거나 조종하거나 하는 로직을 작성한다고 함..
    });
  }
}

module.exports = MyApp;
