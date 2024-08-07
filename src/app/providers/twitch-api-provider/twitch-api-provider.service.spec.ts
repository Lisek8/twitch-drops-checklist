import { TestBed } from '@angular/core/testing';

import { TwitchApiProviderService } from './twitch-api-provider.service';

describe('TwitchApiProviderService', () => {
  let service: TwitchApiProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwitchApiProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
