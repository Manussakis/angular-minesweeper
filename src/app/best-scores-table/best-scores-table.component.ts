import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IBestScores, ScoreService } from '../core/score.service';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-best-scores-table',
    templateUrl: './best-scores-table.component.html',
    styleUrls: ['./best-scores-table.component.scss']
})
export class BestScoresTableComponent implements OnInit {

    bestScores$: Observable<IBestScores>;
    bestScoresKeys: string[];

    constructor(private _score: ScoreService) { }

    ngOnInit(): void {
        this.bestScores$ = this._score.bestScores$
            .pipe(tap(bestScores => this.bestScoresKeys = Object.keys(bestScores)));
    }
}
