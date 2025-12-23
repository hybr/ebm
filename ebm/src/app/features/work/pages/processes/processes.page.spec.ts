import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessesPage } from './processes.page';

describe('ProcessesPage', () => {
  let component: ProcessesPage;
  let fixture: ComponentFixture<ProcessesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
