import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendershowComponent } from './calendershow.component';

describe('CalendershowComponent', () => {
  let component: CalendershowComponent;
  let fixture: ComponentFixture<CalendershowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendershowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendershowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
