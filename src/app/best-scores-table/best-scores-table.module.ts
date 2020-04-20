import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BestScoresTableComponent } from './best-scores-table.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [BestScoresTableComponent],
  imports: [CommonModule, SharedModule],
  exports: [BestScoresTableComponent]
})
export class BestScoresTableModule { }
