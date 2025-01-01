import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueinchargeComponent } from './venueincharge.component';

describe('VenueinchargeComponent', () => {
  let component: VenueinchargeComponent;
  let fixture: ComponentFixture<VenueinchargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VenueinchargeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueinchargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
