import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { BestScoresTableComponent } from './best-scores-table.component';
import { ScoreService } from '../core/score.service';
import { MockStopWatch } from '../app.component.spec';

describe('BestScoresTableComponent', () => {
    let component: BestScoresTableComponent;
    let fixture: ComponentFixture<BestScoresTableComponent>;
    let mockScoreService;

    beforeEach(waitForAsync(() => {
        mockScoreService = {
            bestScores$: of({ easy: 35, medium: 100, hard: 200 })
        };

        TestBed.configureTestingModule({
            declarations: [BestScoresTableComponent, MockStopWatch],
            providers: [
                { provide: ScoreService, useValue: mockScoreService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BestScoresTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should assign correct value to bestScoresKeys property', () => {
        expect(component.bestScoresKeys).toEqual(['easy', 'medium', 'hard']);
    });
});
