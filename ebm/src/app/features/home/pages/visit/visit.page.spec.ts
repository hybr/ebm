import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitPage } from './visit.page';

describe('VisitPage', () => {
  let component: VisitPage;
  let fixture: ComponentFixture<VisitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
