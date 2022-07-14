import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRectanglesComponent } from './manage-rectangles.component';

describe('ManageRectanglesComponent', () => {
  let component: ManageRectanglesComponent;
  let fixture: ComponentFixture<ManageRectanglesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageRectanglesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageRectanglesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
