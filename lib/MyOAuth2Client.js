'use strict';

const Homey = require('homey');
const { OAuth2Client, OAuth2Error, fetch } = require('homey-oauth2app');
const metadata = require('./metadata');

class MyOAuth2Client extends OAuth2Client {

  static CLIENT_ID = Homey.env.HOMEY_OAUTH2_CLIENT_ID;
  static CLIENT_SECRET = Homey.env.HOMEY_OAUTH2_CLIENT_SECRET;
  static API_URL = Homey.env.HOMEY_OAUTH2_API_URL;
  static TOKEN_URL = Homey.env.HOMEY_OAUTH2_TOKEN_URL;
  static AUTHORIZATION_URL = Homey.env.HOMEY_OAUTH2_AUTHORIZE_URL;
  static SCOPES = ['user', 'repo'];

  async onInit() {
    this.log('MyOAuth2Client has been initialized');
  }

  /**
   * [발급] GitHub needs the 'Accept: application/json' header to return JSON.
   */
  async onGetTokenByCode({ code }) {
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', this._clientId);
    body.append('client_secret', this._clientSecret);
    body.append('code', code);
    body.append('redirect_uri', this._redirectUrl);

    const response = await fetch(this._tokenUrl, {
      body,
      method: 'POST',
      headers: {
        'Accept': 'application/json', // CRITICAL: GitHub won't return JSON without this
      },
    });

    if (!response.ok) {
      return this.onHandleGetTokenByCodeError({ response });
    }

    this._token = await this.onHandleGetTokenByCodeResponse({ response });
    return this.getToken();
  }

  /**
   * [갱신] GitHub OAuth2 Token Refresh
   */
  async onRefreshToken() {
    const token = this.getToken();
    if (!token) {
      throw new OAuth2Error('Missing Token');
    }
    if (!token.isRefreshable()) {
      throw new OAuth2Error('Token cannot be refreshed');
    }

    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('client_id', this._clientId);
    body.append('client_secret', this._clientSecret);
    body.append('refresh_token', token.refresh_token);

    const response = await fetch(this._tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json', // CRITICAL
      },
      body,
    });

    if (!response.ok) {
      return this.onHandleRefreshTokenError({ response });
    }

    this._token = await this.onHandleRefreshTokenResponse({ response });
    this.save();
    return this.getToken();
  }

  /** 기기 목록 조회 */
  async getDevices() {
    if (!this.homey.app.constructor.API_INTEGRATED) {
      this.log('API_INTEGRATED is false, fetching dummy devices from metadata...');
      return Object.values(metadata.devices);
    }

    return this.get({
      path: '/devices',
    }).then(({ items }) => items);
  }

  /** 기기 상세 조회 */
  async getDevice({ deviceId }) {
    if (!this.homey.app.constructor.API_INTEGRATED) {
      this.log(`API_INTEGRATED is false, fetching dummy device: ${deviceId}`);
      const device = metadata.devices[deviceId];
      if (!device) throw new Error('Device not found');
      return device;
    }

    return this.get({
      path: `/devices/${deviceId}`,
    });
  }

  /** 기기 상태 조회 */
  async getDeviceStatus({ deviceId }) {
    if (!this.homey.app.constructor.API_INTEGRATED) {
      this.log(`API_INTEGRATED is false, fetching dummy status for: ${deviceId}`);
      const device = metadata.devices[deviceId];
      if (!device) throw new Error('Device not found');
      return device.status;
    }

    return this.get({
      path: `/devices/${deviceId}/status`,
    });
  }

  /** 기기 명령 실행 */
  async executeDeviceCommand({
    deviceId,
    component = 'main',
    capability,
    command,
    args = [],
  }) {
    if (!this.homey.app.constructor.API_INTEGRATED) {
      this.log(`API_INTEGRATED is false, simulating command: ${command} on ${deviceId}`);
      
      if (metadata.devices[deviceId] && metadata.devices[deviceId].status[capability]) {
        if (command === 'on') metadata.devices[deviceId].status[capability].value = 'on';
        if (command === 'off') metadata.devices[deviceId].status[capability].value = 'off';
      }

      return { status: 'success', results: [{ id: 'dummy-res', status: 'COMPLETED' }] };
    }

    return this.post({
      path: `/devices/${deviceId}/commands`,
      json: [{
        command,
        capability,
        component,
        arguments: args,
      }],
    });
  }

  /** 사용자 정보 조회 */
  async getUser() {
    if (!this.homey.app.constructor.API_INTEGRATED) return metadata.user;
    return this.get({ path: '/user' });
  }
}

module.exports = MyOAuth2Client;
