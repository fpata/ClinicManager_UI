import { TestBed } from '@angular/core/testing';
import { SchedulerComponent } from './scheduler';


describe('SchedulerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulerComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SchedulerComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
