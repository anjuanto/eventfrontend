import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventeditComponent } from './eventedit.component';

describe('EventeditComponent', () => {
  let component: EventeditComponent;
  let fixture: ComponentFixture<EventeditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventeditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
