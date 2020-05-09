import { NgModule } from '@angular/core';
import { BestScoresTableComponent } from './best-scores-table.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [BestScoresTableComponent],
    imports: [SharedModule],
    exports: [BestScoresTableComponent]
})
export class BestScoresTableModule { }
