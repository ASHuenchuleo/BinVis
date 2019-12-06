import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryCenteredHierarchicalComponent } from './primary-centered-hierarchical.component';

describe('PrimaryCenteredHierarchicalComponent', () => {
  let component: PrimaryCenteredHierarchicalComponent;
  let fixture: ComponentFixture<PrimaryCenteredHierarchicalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrimaryCenteredHierarchicalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimaryCenteredHierarchicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
