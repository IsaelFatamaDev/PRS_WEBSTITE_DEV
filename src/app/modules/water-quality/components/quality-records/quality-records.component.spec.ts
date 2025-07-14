import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityRecordsComponent } from './quality-records.component';

describe('QualityRecordsComponent', () => {
  let component: QualityRecordsComponent;
  let fixture: ComponentFixture<QualityRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualityRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualityRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
