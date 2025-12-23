import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobPage } from './job.page';

describe('JobPage', () => {
  let component: JobPage;
  let fixture: ComponentFixture<JobPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
