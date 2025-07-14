import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityFormComponent } from './quality-form.component';

describe('QualityFormComponent', () => {
  let component: QualityFormComponent;
  let fixture: ComponentFixture<QualityFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualityFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
