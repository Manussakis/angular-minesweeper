import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IBestScores {
    easy: number | null;
    medium: number | null;
    hard: number | null;
}

@Injectable()
export class ScoreService {
    private _bestScores: BehaviorSubject<IBestScores>;
    private _minesweeperBestScores = 'minesweeperBestScores';

    constructor() {
        this._bestScores = new BehaviorSubject(this._getStoredBestScores());
    }

    get bestScores$(): Observable<IBestScores> {
        return this._bestScores.asObservable();
    }

    public manageBestScores(gameLevel: string, lastTime: number): void {
        const bestScorePerGameLevel = this._bestScores.value[gameLevel];
        if (!bestScorePerGameLevel && bestScorePerGameLevel !== 0 || lastTime < bestScorePerGameLevel) {
            const bestScores = this._getStoredBestScores();
            bestScores[gameLevel] = lastTime;
            this._updateBestScore(bestScores);
        }
    }

    private _getStoredBestScores(): IBestScores {
        let minesweeperBestScore = localStorage.getItem(this._minesweeperBestScores);
        if (!minesweeperBestScore) {
            minesweeperBestScore = JSON.stringify({ easy: null, medium: null, hard: null });
            localStorage.setItem(this._minesweeperBestScores, minesweeperBestScore);
        }
        return JSON.parse(minesweeperBestScore);
    }

    private _updateBestScore(newBestScores: IBestScores): void {
        localStorage.setItem(this._minesweeperBestScores, JSON.stringify(newBestScores));
        this._bestScores.next(newBestScores);
    }
}
