import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VelocityViewHierarchicalComponent } from './velocity-view-hierarchical.component';

describe('VelocityViewHierarchicalComponent', () => {
  let component: VelocityViewHierarchicalComponent;
  let fixture: ComponentFixture<VelocityViewHierarchicalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VelocityViewHierarchicalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VelocityViewHierarchicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
