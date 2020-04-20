import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestScoresTableComponent } from './best-scores-table.component';

describe('BestScoresTableComponent', () => {
  let component: BestScoresTableComponent;
  let fixture: ComponentFixture<BestScoresTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestScoresTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestScoresTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
