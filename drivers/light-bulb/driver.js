'use strict';

const { OAuth2Driver } = require('homey-oauth2app');

module.exports = class MyDriver extends OAuth2Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    await super.onInit();
    this.log('MyDriver has been initialized');

    const card = this.homey.flow.getActionCard('blink-the-light');
    card.registerRunListener(async (args, state) => {
        await args.device.blink();
    });
  }

  /**
   * 디바이스 추가 시 'list_devices' 뷰가 호출될 때 onPairListDevices가 호출됩니다.
   * 페어링 가능한 장치의 데이터가 포함된 배열을 반환해야 합니다.
   * @returns 
   */
  async onPairListDevices({ oAuth2Client }) {
    this.log('onPairListDevices called');
    const devices = await oAuth2Client.getDevices();

    return devices.map(device => ({
      name: device.label || device.name,
      data: {
        deviceId: device.deviceId,
      },
    }));
  }

};
