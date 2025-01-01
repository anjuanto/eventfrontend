import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondvenueComponent } from './secondvenue.component';

describe('SecondvenueComponent', () => {
  let component: SecondvenueComponent;
  let fixture: ComponentFixture<SecondvenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecondvenueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecondvenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
