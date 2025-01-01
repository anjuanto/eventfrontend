import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCompleteComponent } from './event-complete.component';

describe('EventCompleteComponent', () => {
  let component: EventCompleteComponent;
  let fixture: ComponentFixture<EventCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventCompleteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
