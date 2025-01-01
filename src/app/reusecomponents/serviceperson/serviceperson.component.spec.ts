import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicepersonComponent } from './serviceperson.component';

describe('ServicepersonComponent', () => {
  let component: ServicepersonComponent;
  let fixture: ComponentFixture<ServicepersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicepersonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicepersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
