import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigenedstaffComponent } from './assigenedstaff.component';

describe('AssigenedstaffComponent', () => {
  let component: AssigenedstaffComponent;
  let fixture: ComponentFixture<AssigenedstaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssigenedstaffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssigenedstaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
