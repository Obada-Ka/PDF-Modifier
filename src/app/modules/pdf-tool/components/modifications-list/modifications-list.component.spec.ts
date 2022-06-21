import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationsListComponent } from './modifications-list.component';

describe('ModificationsListComponent', () => {
  let component: ModificationsListComponent;
  let fixture: ComponentFixture<ModificationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModificationsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
