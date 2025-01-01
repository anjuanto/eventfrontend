import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftcopyComponent } from './softcopy.component';

describe('SoftcopyComponent', () => {
  let component: SoftcopyComponent;
  let fixture: ComponentFixture<SoftcopyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoftcopyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoftcopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
