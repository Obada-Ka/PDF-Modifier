import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardLineComponent } from './standard-line.component';

describe('StandardLineComponent', () => {
  let component: StandardLineComponent;
  let fixture: ComponentFixture<StandardLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StandardLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
