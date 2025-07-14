import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetFormComponent } from './street-form.component';

describe('StreetFormComponent', () => {
  let component: StreetFormComponent;
  let fixture: ComponentFixture<StreetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreetFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
