import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppconfigComponent } from './appconfig.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppconfigComponent', () => {
  let component: AppconfigComponent;
  let fixture: ComponentFixture<AppconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppconfigComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
