import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentPopupComponent } from './department-popup.component';

describe('DepartmentPopupComponent', () => {
  let component: DepartmentPopupComponent;
  let fixture: ComponentFixture<DepartmentPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
