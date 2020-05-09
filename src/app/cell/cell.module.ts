import { NgModule } from '@angular/core';

import { CellComponent } from './cell.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [CellComponent],
    imports: [SharedModule],
    exports: [CellComponent]
})
export class CellModule { }
