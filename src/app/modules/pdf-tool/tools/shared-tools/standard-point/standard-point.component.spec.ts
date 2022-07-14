import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardPointComponent } from './standard-point.component';

describe('StandardPointComponent', () => {
  let component: StandardPointComponent;
  let fixture: ComponentFixture<StandardPointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StandardPointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
