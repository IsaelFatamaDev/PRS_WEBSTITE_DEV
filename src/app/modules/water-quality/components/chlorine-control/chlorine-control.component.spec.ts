import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChlorineControlComponent } from './chlorine-control.component';

describe('ChlorineControlComponent', () => {
  let component: ChlorineControlComponent;
  let fixture: ComponentFixture<ChlorineControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChlorineControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChlorineControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
