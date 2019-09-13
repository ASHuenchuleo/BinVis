import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VelocityViewComponent } from './velocity-view.component';

describe('VelocityViewComponent', () => {
  let component: VelocityViewComponent;
  let fixture: ComponentFixture<VelocityViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VelocityViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VelocityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
