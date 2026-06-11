import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PatientQuickCreateComponent } from './patient-quick-create.component';


describe('PatientQuickCreateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientQuickCreateComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PatientQuickCreateComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
