import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCardRightComponent } from './view-card-right.component';

describe('ViewCardRightComponent', () => {
  let component: ViewCardRightComponent;
  let fixture: ComponentFixture<ViewCardRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCardRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCardRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
