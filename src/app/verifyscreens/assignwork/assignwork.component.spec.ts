import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignworkComponent } from './assignwork.component';

describe('AssignworkComponent', () => {
  let component: AssignworkComponent;
  let fixture: ComponentFixture<AssignworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignworkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
