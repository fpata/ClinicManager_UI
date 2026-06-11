import { TestBed } from '@angular/core/testing';
import { UserQuickCreateComponent } from './user-quick-create.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('UserQuickCreateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserQuickCreateComponent, HttpClientTestingModule]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserQuickCreateComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
