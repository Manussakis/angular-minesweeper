import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmojisEnum, CellCodeEnum, GameStatusEnum } from '../enums';
import { AROUND_CELL_OPERATORS } from '../consts';

@Injectable({
    providedIn: 'root'
})
export class MinesweeperService {
    public board: number[][] | any[][];
    public vertical: number;
    public horizontal: number;
    public minesLenght: number;

    private _minesPositions: number[][];
    private _isFirstBoard: boolean = true;
    private _remainingEmptyCells: BehaviorSubject<number>;
    private _remainingEmptyMines: BehaviorSubject<number>;
    private _flagsAvailable: BehaviorSubject<number>;
    private _gameStatus: BehaviorSubject<GameStatusEnum>;
    private _emojiFace = new BehaviorSubject(EmojisEnum.GrinningFace);

    constructor() { }

    public newBoard(vertical: number, horizontal: number, minesLenght: number): number[][] | any[][] {
        this.board = [];
        this.vertical = vertical;
        this.horizontal = horizontal;
        this.minesLenght = minesLenght;

        if (this._isFirstBoard) {
            this._remainingEmptyCells = new BehaviorSubject(this.vertical * this.horizontal - this.minesLenght);
            this._remainingEmptyMines = new BehaviorSubject(this.minesLenght);
            this._gameStatus = new BehaviorSubject(GameStatusEnum.NotStarted);
            this._flagsAvailable = new BehaviorSubject(this.minesLenght);
            this._isFirstBoard = false;            
        } else {
            this._remainingEmptyCells.next(this.vertical * this.horizontal - this.minesLenght);
            this._remainingEmptyMines.next(this.minesLenght);
            this._gameStatus.next(GameStatusEnum.NotStarted);
            this._flagsAvailable.next(this.minesLenght);
            this._emojiFace.next(EmojisEnum.GrinningFace);
        }

        this._generateEmptyBoard();
        this._insertMines(this.minesLenght);
        this._updateBoardNumbers();

        return this.board;
    }

    private _generateEmptyBoard(): void {
        for (let y = 0; y < this.vertical; y++) {
            this.board.push([]);
            for (let x = 0; x < this.horizontal; x++) {
                this.board[y][x] = 0;
            }
        }
    }

    private _insertMines(minesLenght: number): void {
        this._generateMinesPositions(minesLenght);

        for (let i = 0; i < this._minesPositions.length; i++) {
            let y = this._minesPositions[i][0];
            let x = this._minesPositions[i][1];
            this.board[y][x] = CellCodeEnum.Mine;
        }
    }

    private _generateMinesPositions(minesLenght: number): void {
        this._minesPositions = [];
        while (this._minesPositions.length < minesLenght) {
            let y = this._getRandomInt(0, this.vertical);
            let x = this._getRandomInt(0, this.horizontal);

            if (!this._isAlreadyAMine([y, x])) {
                this._minesPositions.push([y, x]);
            }
        }
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    private _getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private _isAlreadyAMine(minePosition: number[]): boolean {
        return this._minesPositions.join(" ").includes(minePosition.toString());
    }

    private _updateBoardNumbers(): void {
        for (let i = 0; i < this._minesPositions.length; i++) {
            for (let j = 0; j < AROUND_CELL_OPERATORS.length; j++) {
                let minePosition = this._minesPositions[i];
                let around = AROUND_CELL_OPERATORS[j];
                let boardY = minePosition[0] + around[0];
                let boardX = minePosition[1] + around[1];

                if (boardY >= 0 && boardY < this.vertical &&
                    boardX >= 0 && boardX < this.horizontal &&
                    typeof this.board[boardY][boardX] === 'number') {
                    this.board[boardY][boardX]++;
                }
            }
        }
    }

    public decreaseRemainingEmptyCells(value: number): void {
        this._remainingEmptyCells.next(this._remainingEmptyCells.value - value);
    }

    public setRemainEmptyCells(value: number) {
        this._remainingEmptyCells.next(value);
    }

    get remainingEmptyCells$(): Observable<number> {
        return this._remainingEmptyCells.asObservable();
    }

    get gameStatus$(): Observable<GameStatusEnum> {
        return this._gameStatus.asObservable();
    }

    get gameStatusValue(): GameStatusEnum {
        return this._gameStatus.value;
    }

    get flagsAvailable$(): Observable<number> {
        return this._flagsAvailable.asObservable();
    }
    
    get emojiFace$(): Observable<EmojisEnum> {
        return this._emojiFace.asObservable();
    }

    get flagsAvailableValue(): number {
        return this._flagsAvailable.value;
    }

    public setFlagsAvailable(flags: number): void {
        this._flagsAvailable.next(flags);
    }

    public setGameStatus(status: GameStatusEnum) {
        this._gameStatus.next(status);
    }

    public setEmojiFace(face: EmojisEnum) {
        this._emojiFace.next(face);
    }
}
