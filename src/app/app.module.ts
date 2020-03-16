import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CellComponent } from './cell/cell.component';
import { StopwatchPipe } from './pipes/stopwatch.pipe';
import { PressEventIndicatorDirective } from './directives/press-event-indicator.directive';

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
    bootstrap: [AppComponent]
})
export class AppModule { }
