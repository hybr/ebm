import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacanciesPage } from './vacancies.page';

describe('VacanciesPage', () => {
  let component: VacanciesPage;
  let fixture: ComponentFixture<VacanciesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VacanciesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
