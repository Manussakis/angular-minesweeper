import { Component, Input, Host, ViewEncapsulation, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { MinesweeperService } from '../core/minesweeper.service';
import { AppComponent } from '../app.component';
import { EmojisEnum, CellCodeEnum, GameStatusEnum } from '../enums';
import { ICellStructure } from '../interfaces';

@Component({
    selector: 'app-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CellComponent implements OnChanges {
    @Input() cell: ICellStructure;
    @Output() open = new EventEmitter<number[]>();

    private _gameStatus$: Subscription;
    private _timeWhenPressed: Date;
    private _isAfterPressEvent = false;

    constructor(
        private _minesweeper: MinesweeperService,
        @Host() private _appComponent: AppComponent,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {        
        if (this._gameStatus$) {
            this._gameStatus$.unsubscribe();
        }
        if (changes && changes.cell && !changes.cell.isFirstChange() && this.cell.type === CellCodeEnum.Mine) {
            this._gameStatusSubscription();
        }
    }

    onClick() {
        const timeWhenClicked = new Date();

        if (this._isGhostClick(timeWhenClicked) || this._isUnavailableToOpen()) {
            return;
        } else {
            this.open.emit([this.cell.y, this.cell.x]);
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
            let nextCellIndex = this.cell.i + step;
            let rangeStartIndex: number;
            let rangeEndIndex: number;

            if (orientation === 'horizontal') {
                rangeStartIndex = this.cell.y * this._minesweeper.horizontal;
                rangeEndIndex = rangeStartIndex + (this._minesweeper.horizontal - 1);
            }

            if (orientation === 'vertical') {
                rangeStartIndex = this.cell.x;
                rangeEndIndex = (this._minesweeper.vertical * this._minesweeper.horizontal) - (this._minesweeper.horizontal - this.cell.x);
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
            this._insertFlag();
        }
    }

    onPress(event): void {
        event.preventDefault();

        if (this._supportsTouch()) {
            this._insertFlag();
        }
    }

    onPressUp() {
        this._timeWhenPressed = new Date();
        this._isAfterPressEvent = true;
    }

    onContextMenu(event) {
        event.preventDefault();
        if (this._isAfterPressEvent || event.button === 0) {
            this._isAfterPressEvent = false;

            return false;
        }

        this._insertFlag(event);
    }

    onMouseDown(event): void {
        if (!this._isUnavailableToOpen() && event.button === 0 && this.cell.label !== CellCodeEnum.Flag) {
            this._minesweeper.setEmojiFace(EmojisEnum.FearfulFace);
        }
    }

    onMouseUp(event): void {
        if (!this._isUnavailableToOpen() && event.button === 0) {
            this._minesweeper.setEmojiFace(EmojisEnum.GrinningFace);
        }
    }

    private _insertFlag(event?: Event): void {
        if (event) {
            event.preventDefault();
        }

        if (this._isUnavailableToFlag()) {
            return;
        }

        if (this.cell.label === CellCodeEnum.Flag) {
            this.cell.label = '';
            this._minesweeper.setFlagsAvailable(this._minesweeper.flagsAvailableValue + 1);
            if (this.cell.type !== CellCodeEnum.Mine) {
                this._gameStatus$.unsubscribe();
            }
        } else {
            this.cell.label = CellCodeEnum.Flag;
            this._minesweeper.setFlagsAvailable(this._minesweeper.flagsAvailableValue - 1);
            if (this.cell.type !== CellCodeEnum.Mine) {
                this._gameStatusSubscription();
            }
        }

        this._minesweeper.setEmojiFace(EmojisEnum.GrinningFace);
    }

    private _supportsTouch(): boolean {
        return 'ontouchstart' in window || navigator.msMaxTouchPoints > 0 || navigator.maxTouchPoints > 0;
    }

    private _isUnavailableToFlag(): boolean {
        return this._minesweeper.gameStatusValue === GameStatusEnum.Won
            || this._minesweeper.gameStatusValue === GameStatusEnum.Lost
            || this._minesweeper.isFirstClickInCell
            || this.cell.isOpened;
    }

    private _gameStatusSubscription(): void {
        this._gameStatus$ = this._minesweeper.gameStatus$
            .subscribe((status: string | undefined) => {
                if (status === GameStatusEnum.Lost) {
                    if (this.cell.label === CellCodeEnum.Flag) {
                        if (this.cell.type !== CellCodeEnum.Mine) {
                            this.cell.isWrongFlag = true;
                        }
                    } else {
                        this.cell.isOpened = true;
                        this.cell.isMine = true;
                        this.cell.label = this.cell.type.toString();
                    }

                    this._gameStatus$.unsubscribe();

                } else if (status === GameStatusEnum.Won) {
                    this.cell.label = CellCodeEnum.Flag;
                    this._gameStatus$.unsubscribe();
                }
            });
    }

    private _isUnavailableToOpen(): boolean {
        return this.cell.label === CellCodeEnum.Flag ||
            this._minesweeper.gameStatusValue === GameStatusEnum.Lost ||
            this._minesweeper.gameStatusValue === GameStatusEnum.Won
    }

    private _isGhostClick(timeWhenClicked: Date): boolean {
        return this._timeWhenPressed && timeWhenClicked.getTime() - this._timeWhenPressed.getTime() <= 250
    }
}
