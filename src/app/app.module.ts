import { BrowserModule, HammerModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CellComponent } from './cell/cell.component';
import { StopwatchPipe } from './pipes/stopwatch.pipe';
import { PressEventIndicatorDirective } from './directives/press-event-indicator.directive';
import * as Hammer from 'hammerjs';

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
        StopwatchPipe,
        PressEventIndicatorDirective,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HammerModule,
    ],
    bootstrap: [AppComponent],
    providers: [{
        provide: HAMMER_GESTURE_CONFIG,
        useClass: MinesweeperHammerConfig
    }]
})
export class AppModule { }
