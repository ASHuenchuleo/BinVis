import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DerivedParametersComponent } from './derived-parameters.component';

describe('DerivedParametersComponent', () => {
  let component: DerivedParametersComponent;
  let fixture: ComponentFixture<DerivedParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DerivedParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DerivedParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
