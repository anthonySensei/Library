import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenrePopupComponent } from './genre-popup.component';

describe('GenrePopupComponent', () => {
  let component: GenrePopupComponent;
  let fixture: ComponentFixture<GenrePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenrePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenrePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
