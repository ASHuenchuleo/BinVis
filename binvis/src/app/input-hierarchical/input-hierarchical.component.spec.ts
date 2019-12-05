import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputHierarchicalComponent } from './input-hierarchical.component';

describe('InputHierarchicalComponent', () => {
  let component: InputHierarchicalComponent;
  let fixture: ComponentFixture<InputHierarchicalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputHierarchicalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputHierarchicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
