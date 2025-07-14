import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChlorineFormComponent } from './chlorine-form.component';

describe('ChlorineFormComponent', () => {
  let component: ChlorineFormComponent;
  let fixture: ComponentFixture<ChlorineFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChlorineFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChlorineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
