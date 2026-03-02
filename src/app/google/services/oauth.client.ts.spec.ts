import { TestBed } from '@angular/core/testing';

import { OauthClientTs } from './oauth.client.ts';

describe('OauthClientTs', () => {
  let service: OauthClientTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OauthClientTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
