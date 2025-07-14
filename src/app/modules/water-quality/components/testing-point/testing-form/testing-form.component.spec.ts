import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingFormComponent } from './testing-form.component';

describe('TestingFormComponent', () => {
  let component: TestingFormComponent;
  let fixture: ComponentFixture<TestingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
