import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareListComponent } from './fare-list.component';

describe('FareListComponent', () => {
  let component: FareListComponent;
  let fixture: ComponentFixture<FareListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
