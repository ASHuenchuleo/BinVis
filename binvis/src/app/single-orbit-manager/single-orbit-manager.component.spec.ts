import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleOrbitManagerComponent } from './single-orbit-manager.component';

describe('SingleOrbitManagerComponent', () => {
  let component: SingleOrbitManagerComponent;
  let fixture: ComponentFixture<SingleOrbitManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleOrbitManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleOrbitManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
