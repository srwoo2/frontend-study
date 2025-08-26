'use strict';

import Homey from 'homey';

class MyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    // sdk와 통신
    this.log('MyApp has been initialized');
  }

}

module.exports = MyApp;
