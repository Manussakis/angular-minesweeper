import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CellComponent } from './cell/cell.component';
import { StopwatchPipe } from './pipes/stopwatch.pipe';

@NgModule({
    declarations: [
        AppComponent,
        CellComponent,
        StopwatchPipe,
    ],
    imports: [
        BrowserModule,
        FormsModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
