import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PICScreenComponent } from './pic-screen.component';

describe('PICScreenComponent', () => {
  let component: PICScreenComponent;
  let fixture: ComponentFixture<PICScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PICScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PICScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
