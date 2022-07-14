import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePointsComponent } from './manage-points.component';

describe('ManagePointsComponent', () => {
  let component: ManagePointsComponent;
  let fixture: ComponentFixture<ManagePointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagePointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
