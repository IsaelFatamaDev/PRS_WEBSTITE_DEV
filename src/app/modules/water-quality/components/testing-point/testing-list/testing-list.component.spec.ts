import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingListComponent } from './testing-list.component';

describe('TestingListComponent', () => {
  let component: TestingListComponent;
  let fixture: ComponentFixture<TestingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
