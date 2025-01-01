import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAvatarComponent } from './project-avatar.component';

describe('ProjectAvatarComponent', () => {
  let component: ProjectAvatarComponent;
  let fixture: ComponentFixture<ProjectAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectAvatarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
