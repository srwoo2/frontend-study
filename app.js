'use strict';

const { OAuth2App } = require('homey-oauth2app');
const MyOAuth2Client = require('./lib/MyOAuth2Client');

class MyApp extends OAuth2App {

  static OAUTH2_CLIENT = MyOAuth2Client;
  static OAUTH2_DRIVERS = ['light-bulb']; // 우리 앱의 여러 기능(드라이버) 중에서 어떤 것들만 OAuth2 인증 방식을 사용할 것인가...
  
  static API_INTEGRATED = false; // true: 실제 API 연동, false: metadata.js 더미 데이터 사용

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    await super.onInit();
    this.log('MyApp has been initialized');

    // 앱설정
    const username = this.homey.settings.get('username');

    
    // Trigger 5초마다 카드 실행 예시
    const cardTriggerExample = this.homey.flow.getTriggerCard('trigger-example');
    // setInterval(()=>{
      console.log('Trigger the flow card');
      cardTriggerExample.trigger({
        'random-number': Math.round(Math.random()*100)
      });
    // }, 5000)

    // condition 자바스크립트 추가
    const cardConditionMonday = this.homey.flow.getConditionCard('its-a-monday');
    cardConditionMonday.registerRunListener(async (args, state) => {
      const today = new Date();
      console.log(today);

      return today.getDay() === 1; // 월요일인지 확인
    });

    // action log 자바스크립트 추가
    const cardActionLog = this.homey.flow.getActionCard('log');
    cardActionLog.registerRunListener(async (args, state) => {

      // throw new Error('OoPS!');

      const { usertext } = args;
      this.log(`the user logs : ${usertext}`);

      return true;
    });

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
