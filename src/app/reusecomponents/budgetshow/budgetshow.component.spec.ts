import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetshowComponent } from './budgetshow.component';

describe('BudgetshowComponent', () => {
  let component: BudgetshowComponent;
  let fixture: ComponentFixture<BudgetshowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BudgetshowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
