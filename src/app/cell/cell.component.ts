import { Component, Input, ViewEncapsulation, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { MinesweeperService } from '../core/minesweeper.service';
import { EmojisEnum, CellCodeEnum, GameStatusEnum } from '../enums';
import { ICellStructure } from '../interfaces';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CellComponent implements OnChanges {
    @Input() cell: ICellStructure;
    @Input() horizontal: number;
    @Input() vertical: number;
    @Input() smallScreenCellSize: number;

    @Output() open = new EventEmitter<number[]>();
    @Output() changeFlagsAvailable = new EventEmitter<number>();
    @Output() changeEmojiFace = new EventEmitter<EmojisEnum>();
    @Output() focusCell = new EventEmitter<number>();
    @Output() focusBoardFace = new EventEmitter<any>();
    @Output() focusResetButton = new EventEmitter<any>();

    private _gameStatus$: Subscription;
    private _timeWhenPressed: Date;
    private _isAfterPressEvent = false;

    constructor(private _minesweeper: MinesweeperService) { }

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
            'ArrowUp': { step: () => -this.horizontal, orientation: 'vertical' },
            'ArrowRight': { step: () => 1, orientation: 'horizontal' },
            'ArrowDown': { step: () => this.horizontal, orientation: 'vertical' },
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
                rangeStartIndex = this.cell.y * this.horizontal;
                rangeEndIndex = rangeStartIndex + (this.horizontal - 1);
            }

            if (orientation === 'vertical') {
                rangeStartIndex = this.cell.x;
                rangeEndIndex = (this.vertical * this.horizontal) - (this.horizontal - this.cell.x);
            }

            if (nextCellIndex < rangeStartIndex) {
                nextCellIndex = rangeEndIndex;
            }

            if (nextCellIndex > rangeEndIndex) {
                nextCellIndex = rangeStartIndex;
            }

            this.focusCell.emit(nextCellIndex);

        } else if (event.shiftKey && event.key === 'Tab') {
            event.preventDefault();
            this.focusBoardFace.emit();

        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.focusResetButton.emit();

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
            this.changeEmojiFace.emit(EmojisEnum.FearfulFace);
        }
    }

    onMouseUp(event): void {
        if (!this._isUnavailableToOpen() && event.button === 0) {
            this.changeEmojiFace.emit(EmojisEnum.GrinningFace);
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
            this.changeFlagsAvailable.emit(this._minesweeper.flagsAvailableValue + 1);
            if (this.cell.type !== CellCodeEnum.Mine) {
                this._gameStatus$.unsubscribe();
            }
        } else {
            this.cell.label = CellCodeEnum.Flag;
            this.changeFlagsAvailable.emit(this._minesweeper.flagsAvailableValue - 1);
            if (this.cell.type !== CellCodeEnum.Mine) {
                this._gameStatusSubscription();
            }
        }

        this.changeEmojiFace.emit(EmojisEnum.GrinningFace);
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
            .pipe(filter(status => status === GameStatusEnum.Lost || status === GameStatusEnum.Won))
            .subscribe((status: GameStatusEnum) => {
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
                } else {
                    this.cell.label = CellCodeEnum.Flag;
                }

                this._gameStatus$.unsubscribe();
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
