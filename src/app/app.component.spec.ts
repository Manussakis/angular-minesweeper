import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { of } from 'rxjs';
import { IBoardData } from './interfaces';
import { GameStatusEnum } from './enums';
import { MinesweeperService } from './core/minesweeper.service';
import { ScoreService } from './core/score.service';
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'stopwatch'
})
export class MockStopWatch implements PipeTransform {
    transform(value: number): number {
        return value;
    }
}

describe('AppComponent', () => {
    let mockMinesweeperService;
    let mockScoreService;

    beforeEach(waitForAsync(() => {
        mockMinesweeperService = {
            boardHasChanded$: of(<IBoardData>{
                board: [
                    [1, 1, 2, "M", 1, 0, 0, 0, 0],
                    [2, "M", 4, 2, 1, 0, 1, 1, 1],
                    [2, "M", "M", 2, 1, 1, 1, "M", 1],
                    [1, 3, 3, 3, "M", 2, 2, 3, 2],
                    [0, 1, "M", 3, 2, 2, "M", 2, "M"],
                    [0, 1, 2, "M", 1, 1, 1, 2, 1],
                    [0, 0, 1, 1, 1, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                ],
                isBoardReseted: false
            }),
            gameStatus$: of(GameStatusEnum.Running),
            remainingEmptyCells$: of(80),
            newEmptyBoard: () => {},
            setEmojiFace : () => {},
        };

        mockScoreService = jasmine.createSpyObj(['manageBestScores']);

        TestBed.configureTestingModule({
            declarations: [AppComponent, MockStopWatch],
            providers: [
                { provide: MinesweeperService, useValue: mockMinesweeperService },
                { provide: ScoreService, useValue: mockScoreService },
            ]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should render title in a h1 tag', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('h1').textContent).toContain('Minesweeper');
    });
});
