import { TestBed } from '@angular/core/testing';

import { VelocityManagerService } from './velocity-manager.service';

describe('VelocityManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VelocityManagerService = TestBed.get(VelocityManagerService);
    expect(service).toBeTruthy();
  });
});
