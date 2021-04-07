import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { EmojisEnum, CellCodeEnum, GameStatusEnum } from '../enums';
import { AROUND_CELL_OPERATORS } from '../consts';
import { IBoardData } from '../interfaces';

@Injectable()
export class MinesweeperService {
    vertical: number;
    horizontal: number;
    minesLenght: number;
    cellMaxSize: number = 44;

    private _board: number[][] | any[][];
    private _boardData$ = new Subject<IBoardData>();
    private _minesPositions: number[][];
    private _isFirstBoard: boolean = true;
    private _remainingEmptyCells: BehaviorSubject<number>;
    private _remainingEmptyMines: BehaviorSubject<number>;
    private _flagsAvailable: BehaviorSubject<number>;
    private _gameStatus: BehaviorSubject<GameStatusEnum>;
    private _emojiFace = new BehaviorSubject(EmojisEnum.GrinningFace);
    private _isFirstCellClicked = new BehaviorSubject(true);
    private _firstCellIsReadyToOpen = new Subject<boolean>();

    constructor() { }

    newEmptyBoard(vertical: number, horizontal: number, minesLenght: number): void {
        this._board = [];
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
        this._boardData$.next({ board: [...this._board], isBoardReseted: true });
    }

    populateEmptyBoard(firstCellOpened: number[]): void {
        this._generateMinesPositions(this.minesLenght, firstCellOpened);
        this._insertMines();
        this._updateBoardNumbers();
        this._boardData$.next({ board: [...this._board], isBoardReseted: false });
    }

    decreaseRemainingEmptyCells(value: number): void {
        this._remainingEmptyCells.next(this._remainingEmptyCells.value - value);
    }

    setRemainEmptyCells(value: number) {
        this._remainingEmptyCells.next(value);
    }
    
    get boardHasChanded$(): Observable<IBoardData> {
        return this._boardData$.asObservable();
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

    get isFirstClickInCell(): boolean {
        return this._isFirstCellClicked.value;
    }

    get firstCellIsReadyToOpen$(): Observable<boolean> {
        return this._firstCellIsReadyToOpen.asObservable();
    }

    setFlagsAvailable(flags: number): void {
        this._flagsAvailable.next(flags);
    }

    setGameStatus(status: GameStatusEnum) {
        this._gameStatus.next(status);
    }

    setEmojiFace(face: EmojisEnum) {
        this._emojiFace.next(face);
    }

    set isFirstClickInCell(status: boolean) {
        this._isFirstCellClicked.next(status);
    }

    set firstCellIsReadyToOpen(state: boolean) {
        this._firstCellIsReadyToOpen.next(true);
    }

    private _generateEmptyBoard(): void {
        for (let y = 0; y < this.vertical; y++) {
            this._board.push([]);
            for (let x = 0; x < this.horizontal; x++) {
                this._board[y][x] = 0;
            }
        }
    }

    private _insertMines(): void {
        for (let i = 0; i < this._minesPositions.length; i++) {
            let y = this._minesPositions[i][0];
            let x = this._minesPositions[i][1];
            this._board[y][x] = CellCodeEnum.Mine;
        }
    }

    private _generateMinesPositions(minesLenght: number, firstCellOpened: number[]): void {
        this._minesPositions = [];
        while (this._minesPositions.length < minesLenght) {
            let y = this._getRandomInt(0, this.vertical);
            let x = this._getRandomInt(0, this.horizontal);

            if (!this._isAlreadyAMine([y, x]) && this._isDifferentFromFirstCellOpened([y, x], firstCellOpened)) {
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

    private _isDifferentFromFirstCellOpened(randomCell: number[], firstCellOpened: number[]): boolean {
        return randomCell[0] !== firstCellOpened[0] || randomCell[1] !== firstCellOpened[1];
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
                    typeof this._board[boardY][boardX] === 'number') {
                    this._board[boardY][boardX]++;
                }
            }
        }
    }    
}
