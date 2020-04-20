import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopwatchPipe } from './pipes/stopwatch.pipe';
import { PressEventIndicatorDirective } from './directives/press-event-indicator.directive';

@NgModule({
  declarations: [StopwatchPipe, PressEventIndicatorDirective],
  imports: [CommonModule],
  exports: [StopwatchPipe, PressEventIndicatorDirective]
})
export class SharedModule { }
