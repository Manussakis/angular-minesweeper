import { Component, OnInit, Input, ElementRef, Host, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MinesweeperService } from '../services/minesweeper.service';
import { AppComponent } from '../app.component';
import { EmojisEnum, CellCodeEnum, GameStatusEnum } from '../enums';
import { AROUND_CELL_OPERATORS } from '../consts';

@Component({
    selector: 'app-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CellComponent implements OnInit {

    @Input() cell: number | string;
    @Input() y: number;
    @Input() x: number;
    @Input() i: number;

    @ViewChild('cellChild') cellChild: ElementRef;

    cellText: string;
    emojiFace: EmojisEnum = EmojisEnum.GrinningFace;
    isOpened: boolean;
    isMine: boolean;
    isMineExploded: boolean;

    private _gameStatus$: Subscription;
    private _isAfterPressEvent: boolean = false;

    constructor(
        private _minesweeper: MinesweeperService,
        private _renderer2: Renderer2,
        @Host() private _appComponent: AppComponent,
    ) { }

    ngOnInit(): void {
        if (this.cell === CellCodeEnum.Mine) {
            this._gameStatusSubscription();
        }
    }

    onOpenCell(): void {
        if (this._isAfterPressEvent) {
            this._isAfterPressEvent = false;

            return;
        }

        if (this._isUnavailableToOpen()) {
            return;
        }

        if (this.cell === CellCodeEnum.Mine) {
            this.isMineExploded = true;
            this._minesweeper.setGameStatus(GameStatusEnum.Lost);

            return;
        }

        this._minesweeper.setGameStatus(GameStatusEnum.Running);

        // Force the cell to have the opened class immediately.
        // This will be useful when count the opened cells amount
        this._renderer2.addClass(this.cellChild.nativeElement, 'opened');
        this.isOpened = true;

        if (this.cell === 0) {
            this._openAroundZerosCell();
            this._updateRemainingEmptyCells();
        } else {
            this.cellText = this.cell.toString();
            this._renderer2.addClass(this.cellChild.nativeElement, `opened-${this.cell}`);
            this._minesweeper.decreaseRemainingEmptyCells(1);
        }
    }

    onInsertFlag(event?: Event): void {
        if (event) {
            event.preventDefault();
        }

        if (this._isAfterPressEvent) {
            this._isAfterPressEvent = false;

            return;
        }

        if (this._isUnavailableToFlag()) {
            return;
        }

        if (this.cellText === CellCodeEnum.Flag) {
            this.cellText = '';
            this._minesweeper.setFlagsAvailable(this._minesweeper.flagsAvailableValue + 1);
            if (this.cell !== CellCodeEnum.Mine) {
                this._gameStatus$.unsubscribe();
            }
        } else {
            this.cellText = CellCodeEnum.Flag;
            this._minesweeper.setFlagsAvailable(this._minesweeper.flagsAvailableValue - 1);
            if (this.cell !== CellCodeEnum.Mine) {
                this._gameStatusSubscription();
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        const directions = {
            'ArrowLeft': { step: () => -1, orientation: 'horizontal' },
            'ArrowUp': { step: () => -this._minesweeper.horizontal, orientation: 'vertical' },
            'ArrowRight': { step: () => 1, orientation: 'horizontal' },
            'ArrowDown': { step: () => this._minesweeper.horizontal, orientation: 'vertical' },
            'default': { step: () => false },
        }

        const step = (directions[event.key] || directions['default']).step();

        if (step) {
            event.preventDefault();
            const orientation = directions[event.key].orientation;
            let nextCellIndex = this.i + step;
            let rangeStartIndex: number;
            let rangeEndIndex: number;

            if (orientation === 'horizontal') {
                rangeStartIndex = this.y * this._minesweeper.horizontal;
                rangeEndIndex = rangeStartIndex + (this._minesweeper.horizontal - 1);
            }

            if (orientation === 'vertical') {
                rangeStartIndex = this.x;
                rangeEndIndex = (this._minesweeper.vertical * this._minesweeper.horizontal) - (this._minesweeper.horizontal - this.x);
            }

            if (nextCellIndex < rangeStartIndex) {
                nextCellIndex = rangeEndIndex;
            }

            if (nextCellIndex > rangeEndIndex) {
                nextCellIndex = rangeStartIndex;
            }

            const nextCell = this._appComponent.boardDOM.nativeElement.querySelector(`[data-i="${nextCellIndex}"]`);
            nextCell.focus();

        } else if (event.shiftKey && event.key === 'Tab') {
            event.preventDefault();
            setTimeout(() => this._appComponent.boardFace.nativeElement.focus(), 200);

        } else if (event.key === 'Tab') {
            event.preventDefault();
            setTimeout(() => this._appComponent.resetButton.nativeElement.focus(), 200);

        } else if (event.key === 'f') {
            this.onInsertFlag();
        }
    }

    onPressCell(): void {
        const supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
        if (supportsTouch) {
            this.onInsertFlag();
            this._isAfterPressEvent = true;
        }
    }

    onMouseDown(event): void {
        if (!this._isUnavailableToOpen() && event.button === 0 && this.cellText !== CellCodeEnum.Flag) {
            this._minesweeper.setEmojiFace(EmojisEnum.FearfulFace);
        }
    }

    onMouseUp(event): void {
        if (!this._isUnavailableToOpen() && event.button === 0) {
            this._minesweeper.setEmojiFace(EmojisEnum.GrinningFace);
        }
    }

    private _isUnavailableToFlag(): boolean {
        return this._minesweeper.gameStatusValue === GameStatusEnum.Won
            || this._minesweeper.gameStatusValue === GameStatusEnum.Lost
            || this.isOpened
            || this.cellChild.nativeElement.classList.contains('opened');
    }

    private _openAroundZerosCell(): void {
        const boardDOM = this._appComponent.boardDOM.nativeElement;
        const centerZeroClassName = 'center-zero';
        let centerZeroDOM = boardDOM.querySelector(`[data-y="${this.y}"][data-x="${this.x}"]`);

        this._renderer2.addClass(centerZeroDOM, centerZeroClassName);

        while (centerZeroDOM) {
            this._renderer2.removeClass(centerZeroDOM, 'opened-0');
            const centerZeroCoord = [+centerZeroDOM.getAttribute('data-y'), +centerZeroDOM.getAttribute('data-x')];

            for (let i = 0; i < AROUND_CELL_OPERATORS.length; i++) {
                const aroundGetter = AROUND_CELL_OPERATORS[i];
                const cellAroundY = centerZeroCoord[0] + aroundGetter[0];
                const cellAroundX = centerZeroCoord[1] + aroundGetter[1];

                if (cellAroundY >= 0 && cellAroundY < this._minesweeper.vertical &&
                    cellAroundX >= 0 && cellAroundX < this._minesweeper.horizontal) {

                    const cellAroundDOM = boardDOM.querySelector(`[data-y="${cellAroundY}"][data-x="${cellAroundX}"]`);

                    if (!cellAroundDOM.classList.contains('flag')) {
                        if (cellAroundDOM.getAttribute('data-cell') === '0') {
                            if (!cellAroundDOM.classList.contains(centerZeroClassName)) {
                                this._renderer2.addClass(cellAroundDOM, 'opened');
                                this._renderer2.addClass(cellAroundDOM, 'opened-0');
                            }
                        } else if (!cellAroundDOM.classList.contains('opened')) {
                            const cell = cellAroundDOM.getAttribute('data-cell');
                            const cellValue = this._renderer2.createText(cell);

                            this._renderer2.appendChild(cellAroundDOM, cellValue);
                            this._renderer2.addClass(cellAroundDOM, 'opened');
                            this._renderer2.addClass(cellAroundDOM, `opened-${cell}`);
                        }
                    }
                }
            }

            centerZeroDOM = boardDOM.querySelector('.opened-0');

            if (centerZeroDOM) {
                this._renderer2.addClass(centerZeroDOM, centerZeroClassName);
            }
        }
    }

    private _updateRemainingEmptyCells(): void {
        const minesweeper = this._minesweeper;
        const allOpenedCells = this._appComponent.boardDOM.nativeElement.querySelectorAll('.opened');
        const remainEmptyCells = minesweeper.vertical * minesweeper.horizontal - (minesweeper.minesLenght + allOpenedCells.length);

        minesweeper.setRemainEmptyCells(remainEmptyCells);
    }

    private _gameStatusSubscription(): void {
        this._gameStatus$ = this._minesweeper.gameStatus$
            .subscribe((status: string | undefined) => {
                if (status === GameStatusEnum.Lost) {
                    if (this.cellText === CellCodeEnum.Flag) {
                        if (this.cell !== CellCodeEnum.Mine) {
                            this._renderer2.addClass(this.cellChild.nativeElement, 'flag--wrong');
                        }
                    } else {
                        this.isOpened = true;
                        this.isMine = true;
                        this._renderer2.addClass(this.cellChild.nativeElement, 'mine');
                        this.cellText = this.cell.toString();
                    }
                    this._gameStatus$.unsubscribe();

                } else if (status === GameStatusEnum.Won) {
                    this._renderer2.addClass(this.cellChild.nativeElement, 'flag');
                    this.cellText = CellCodeEnum.Flag;
                    this._gameStatus$.unsubscribe();
                }
            });
    }

    private _isUnavailableToOpen(): boolean {
        return this.cellChild.nativeElement.classList.contains('opened') ||
            this.cellText === CellCodeEnum.Flag ||
            this._minesweeper.gameStatusValue === GameStatusEnum.Lost ||
            this._minesweeper.gameStatusValue === GameStatusEnum.Won
    }
}
