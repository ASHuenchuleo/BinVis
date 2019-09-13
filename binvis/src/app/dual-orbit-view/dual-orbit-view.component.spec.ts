import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DualOrbitViewComponent } from './dual-orbit-view.component';

describe('DualOrbitViewComponent', () => {
  let component: DualOrbitViewComponent;
  let fixture: ComponentFixture<DualOrbitViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DualOrbitViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DualOrbitViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
