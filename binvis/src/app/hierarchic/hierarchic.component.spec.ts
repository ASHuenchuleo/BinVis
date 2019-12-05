import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchicComponent } from './hierarchic.component';

describe('HierarchicComponent', () => {
  let component: HierarchicComponent;
  let fixture: ComponentFixture<HierarchicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HierarchicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
