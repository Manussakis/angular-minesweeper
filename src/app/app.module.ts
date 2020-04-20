import { BrowserModule, HammerModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CellComponent } from './cell/cell.component';
import * as Hammer from 'hammerjs';
import { BestScoresTableModule } from './best-scores-table/best-scores-table.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

@Injectable()
export class MinesweeperHammerConfig extends HammerGestureConfig {
    buildHammer(element: HTMLElement) {
        const ta = new Hammer(element, {
            touchAction: "auto",
        });
        return ta;
    }
}

@NgModule({
    declarations: [
        AppComponent,
        CellComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HammerModule,
        CoreModule,
        SharedModule,
        BestScoresTableModule,
    ],
    bootstrap: [AppComponent],
    providers: [{
        provide: HAMMER_GESTURE_CONFIG,
        useClass: MinesweeperHammerConfig
    }]
})
export class AppModule { }
