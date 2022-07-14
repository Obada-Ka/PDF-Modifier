import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLinesComponent } from './manage-lines.component';

describe('ManageLinesComponent', () => {
  let component: ManageLinesComponent;
  let fixture: ComponentFixture<ManageLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageLinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
