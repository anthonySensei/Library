import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorPopupComponent } from './author-popup.component';

describe('AuthorPopupComponent', () => {
  let component: AuthorPopupComponent;
  let fixture: ComponentFixture<AuthorPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
