import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareFormComponent } from './fare-form.component';

describe('FareFormComponent', () => {
  let component: FareFormComponent;
  let fixture: ComponentFixture<FareFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
