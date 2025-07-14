import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChlorineDetailComponent } from './chlorine-detail.component';

describe('ChlorineDetailComponent', () => {
  let component: ChlorineDetailComponent;
  let fixture: ComponentFixture<ChlorineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChlorineDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChlorineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
