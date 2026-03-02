import { InjectionToken } from '@angular/core';

export interface OauthConfiguration {
  readonly id: string;
  readonly secret?: string;
  readonly authrizationUrl: string;
  readonly tokenUrl: string;
  readonly redirectUri: string;
  readonly codeVerifierLength: number;
  readonly stateCodeLength: number;
}

export const OAUTH_CONFIGURATION = new InjectionToken<OauthConfiguration>('oauth-configuration');
