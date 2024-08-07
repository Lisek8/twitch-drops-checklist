import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropsListComponent } from './drops-list.component';

describe('DropsListComponent', () => {
  let component: DropsListComponent;
  let fixture: ComponentFixture<DropsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DropsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
