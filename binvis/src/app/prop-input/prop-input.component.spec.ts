import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropInputComponent } from './prop-input.component';

describe('PropInputComponent', () => {
  let component: PropInputComponent;
  let fixture: ComponentFixture<PropInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
