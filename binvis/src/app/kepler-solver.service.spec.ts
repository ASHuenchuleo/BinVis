import { TestBed } from '@angular/core/testing';

import { KeplerSolverService } from './kepler-solver.service';

describe('KeplerSolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KeplerSolverService = TestBed.get(KeplerSolverService);
    expect(service).toBeTruthy();
  });
});
