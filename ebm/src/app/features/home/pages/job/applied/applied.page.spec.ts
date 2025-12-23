import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppliedPage } from './applied.page';

describe('AppliedPage', () => {
  let component: AppliedPage;
  let fixture: ComponentFixture<AppliedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppliedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
