import { TestBed } from '@angular/core/testing';

import { LanguageSwitcherService } from './language-switcher.service';

describe('LanguageSwitcherService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LanguageSwitcherService = TestBed.get(LanguageSwitcherService);
    expect(service).toBeTruthy();
  });
});
