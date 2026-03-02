import { APP_ID, Injectable, inject } from '@angular/core';
import { arrayBufferToBase64, randomString, sha256 } from '../helpers';
import { OAUTH_CONFIGURATION } from '../types/services';

const KEY_PREFIX = 'oauth';

const defaultCodeVerifierLength = 64;
const stateCodeLength = 16;
const stateTtl = 10 * 60 * 1_000;

interface AccessTokenResponnse {}

interface StateData {
  readonly expireAt: number;
  readonly data: {
    readonly codeVerifier: string;
    readonly intendedUrl: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OauthClient {
  private readonly config = inject(OAUTH_CONFIGURATION);

  private readonly keyPrefix = `${inject(APP_ID)}-${KEY_PREFIX}-${this.config.id}`;

  private stateKey(stateCode: string) {
    return `${this.keyPrefix}-state-${stateCode}`;
  }

  //---------------------- State Storage -------------------//
  private storeState(stateCode: string, data: StateData['data']): void {
    localStorage.setItem(this.stateKey(stateCode), JSON.stringify(data));
  }

  private getState(stateCode: string): StateData['data'] | null {
    const statePrefix = this.stateKey('');

    Array.from({ length: localStorage.length })
      .map((_, i) => localStorage.key(i))
      .filter((key) => key?.startsWith(statePrefix))
      .forEach((key) => {
        const item = JSON.parse(localStorage.getItem(key!) ?? 'null') as StateData | null;

        if (item && item.expireAt < now) {
          localStorage.removeItem(key!);
        }
      });

    const result = JSON.parse(
      localStorage.getItem(this.stateKey(stateCode)) ?? 'null',
    ) as StateData | null;

    return result?.data || null;
  }

  async getAuthorizationCodeUrl(
    scopes: readonly string[],
    params: Readonly<Record<string, string>> = {},
  ): Promise<URL> {
    const url = new URL(this.config.authrizationUrl);

    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const codeVerifier = randomString(this.config.codeVerifierLength ?? defaultCodeVerifierLength);
    const codeChallenge = arrayBufferToBase64(await sha256(codeVerifier), true);

    url.searchParams.set('client_id', this.config.id);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    const stateCode = randomString(this.config.stateCodeLength);
    url.searchParams.set('state', stateCode);

    return url;
  }
}
