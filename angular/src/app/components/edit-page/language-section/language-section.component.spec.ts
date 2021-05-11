import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSectionComponent } from './language-section.component';

describe('LanguageSectionComponent', () => {
  let component: LanguageSectionComponent;
  let fixture: ComponentFixture<LanguageSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguageSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
