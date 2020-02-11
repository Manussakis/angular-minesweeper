import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, HostListener, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Subject, Observable, Subscription, timer, BehaviorSubject } from 'rxjs';
import { takeUntil, distinctUntilChanged, filter, skip } from 'rxjs/operators';
import { MinesweeperService } from './services/minesweeper.service';
import { ScoreService, IBestScores } from './services/score.service';
import { GameStatusEnum, EmojisEnum, GameLevelEnum } from './enums';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('boardDOM') boardDOM: ElementRef;
    @ViewChild('resetButton') resetButton: ElementRef;
    @ViewChild('boardFace') boardFace: ElementRef;
    @ViewChild('commandsModalButton') commandsModalButton: ElementRef;
    @ViewChild('commandsButton') commandsButton: ElementRef;

    @HostListener('document:keydown.escape') onKeydown() {
        if (this._gameCommandsModalIsOpen$.value) {
            this.toggleGameCommandsModal();
        }
    }

    board: number[][] | string[][] = [];
    gameLevel: GameLevelEnum;
    gameStatus: string | undefined;
    flagsAvailable$: Observable<number>;
    timer: number = 0;
    bestScores: IBestScores;
    emojiFace$ = this._minesweeper.emojiFace$;
    objectKeys = Object.keys;
    horizontal: number;
    gameCommandsModalIsOpen: boolean;
    
    private _gameCommandsModalIsOpen$ = new BehaviorSubject(false);
    private _vertical: number;
    private _minesLength: number;
    private _gameLevel$ = new BehaviorSubject<GameLevelEnum>(GameLevelEnum.Medium);
    private _timerSub: Subscription;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _minesweeper: MinesweeperService,
        private _score: ScoreService,
        private _renderer2: Renderer2,
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this._gameLevel$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(gameLevelSelected => {
                if (gameLevelSelected === GameLevelEnum.Easy) {
                    this._vertical = 9;
                    this.horizontal = 9;
                    this._minesLength = 10;
                } else if (gameLevelSelected === GameLevelEnum.Medium) {
                    this._vertical = 16;
                    this.horizontal = 16;
                    this._minesLength = 40;
                } else if (gameLevelSelected === GameLevelEnum.Hard) {
                    this._vertical = 16;
                    this.horizontal = 30;
                    this._minesLength = 99;
                }
                this.gameLevel = gameLevelSelected;
                this.createNewBoard();
                this.flagsAvailable$ = this._minesweeper.flagsAvailable$;
            });

        this._minesweeper.gameStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((status: GameStatusEnum | undefined) => {
                if (status === GameStatusEnum.Running) {
                    this._minesweeper.setEmojiFace(EmojisEnum.GrinningFace);
                    if (!this._timerSub) {
                        this._timerSub = timer(0, 1000).subscribe((second: number) => {
                            this.timer = second;
                        });
                    }
                } else if (status === GameStatusEnum.Lost || status === GameStatusEnum.Won) {
                    this._unsubscribeTimer();

                    if (status === GameStatusEnum.Won) {
                        this._score.manageBestScores(this.gameLevel, this.timer);
                        this._minesweeper.setEmojiFace(EmojisEnum.SmilingFaceWithSunglasses);
                        this._minesweeper.setFlagsAvailable(0);
                    }

                    if (status == GameStatusEnum.Lost) {
                        this._minesweeper.setEmojiFace(EmojisEnum.NauseatedFace);
                    }
                }

                this.gameStatus = status;
            });

        this._minesweeper.remainingEmptyCells$
            .pipe(
                takeUntil(this._unsubscribeAll),
                distinctUntilChanged(),
                filter(length => length === 0)
            )
            .subscribe(() => this._minesweeper.setGameStatus(GameStatusEnum.Won));

        this._score.bestScores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(bestScores => this.bestScores = bestScores);
    }

    ngAfterViewInit(): void {
        this._gameCommandsModalIsOpen$
            .pipe(skip(1))
            .subscribe(state => {
            this.gameCommandsModalIsOpen = state;
            this._renderer2[state ? 'addClass' : 'removeClass'](document.body, 'overflow-hidden');
            
            if(this.gameCommandsModalIsOpen) {
                setTimeout(this.commandsModalButton.nativeElement.focus(), 200);                
            } else {
                setTimeout(this.commandsButton.nativeElement.focus(), 200);
            }
        });        
    }

    createNewBoard(): void {
        this.board = this._minesweeper.newBoard(this._vertical, this.horizontal, this._minesLength);
        this._unsubscribeTimer();
        this.timer = 0;
    }

    onChangeGameLevel(levelSelected: GameLevelEnum): void {
        this._gameLevel$.next(levelSelected);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._timerSub.unsubscribe();
    }

    toggleGameCommandsModal(event?: Event): void {
        if (event && event.target !== event.currentTarget) {
            return;
        }

        this._gameCommandsModalIsOpen$.next(!this.gameCommandsModalIsOpen);        
    }

    onCommandsModalButtonKeydown(event: KeyboardEvent) {
        if(event.key === 'Tab' || event.shiftKey && event.key === 'Tab') {
            event.preventDefault();
        }
    }

    private _unsubscribeTimer(): void {
        if (this._timerSub) {
            this._timerSub.unsubscribe();
            this._timerSub = null;
        }
    }
}
