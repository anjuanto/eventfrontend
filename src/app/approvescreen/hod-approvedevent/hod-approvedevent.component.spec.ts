import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HodApprovedeventComponent } from './hod-approvedevent.component';

describe('HodApprovedeventComponent', () => {
  let component: HodApprovedeventComponent;
  let fixture: ComponentFixture<HodApprovedeventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HodApprovedeventComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HodApprovedeventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
