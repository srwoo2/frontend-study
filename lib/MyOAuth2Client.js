'use strict';

const Homey = require('homey');
const { OAuth2Client, fetch } = require('homey-oauth2app');
const { URLSearchParams } = require('url');

class MyOAuth2Client extends OAuth2Client {

  static CLIENT_ID = Homey.env.HOMEY_OAUTH2_CLIENT_ID;
  static CLIENT_SECRET = Homey.env.HOMEY_OAUTH2_CLIENT_SECRET;
  static API_URL = Homey.env.HOMEY_OAUTH2_API_URL;
  static TOKEN_URL = Homey.env.HOMEY_OAUTH2_TOKEN_URL;
  static AUTHORIZATION_URL = Homey.env.HOMEY_OAUTH2_AUTHORIZE_URL;
  static SCOPES = ['user', 'repo'];

  /**
   * GitHub needs the 'Accept: application/json' header to return JSON.
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
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return this.onHandleGetTokenByCodeError({ response });
    }

    this._token = await this.onHandleGetTokenByCodeResponse({ response });
    return this.getToken();
  }

  /*
   * This method is called when the client is initialized.
   */
  async onInit() {
    this.log('MyOAuth2Client has been initialized');
  }

  /*
   * Example: Get the current user.
   */
  async getUser() {
    return this.get({
      path: '/user',
    });
  }

}

module.exports = MyOAuth2Client;
