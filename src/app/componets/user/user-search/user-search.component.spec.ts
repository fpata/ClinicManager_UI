import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserSearch } from './user-search.component';

describe('UserSearch', () => {
  let component: UserSearch;
  let fixture: ComponentFixture<UserSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSearch, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
