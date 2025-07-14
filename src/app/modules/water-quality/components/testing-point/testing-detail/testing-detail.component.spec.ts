import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingDetailComponent } from './testing-detail.component';

describe('TestingDetailComponent', () => {
  let component: TestingDetailComponent;
  let fixture: ComponentFixture<TestingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
