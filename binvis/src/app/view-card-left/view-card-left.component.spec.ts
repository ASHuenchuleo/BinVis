import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCardLeftComponent } from './view-card-left.component';

describe('ViewCardLeftComponent', () => {
  let component: ViewCardLeftComponent;
  let fixture: ComponentFixture<ViewCardLeftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCardLeftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCardLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
