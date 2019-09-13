import { TestBed } from '@angular/core/testing';

import { PosManagerService } from './pos-manager.service';

describe('PosManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PosManagerService = TestBed.get(PosManagerService);
    expect(service).toBeTruthy();
  });
});
