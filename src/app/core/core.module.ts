import { NgModule } from '@angular/core';
import { MinesweeperService } from './minesweeper.service';
import { ScoreService } from './score.service';

@NgModule({
    providers: [MinesweeperService, ScoreService]
})
export class CoreModule { }
