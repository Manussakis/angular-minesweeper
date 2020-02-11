import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stopwatch'
})
export class StopwatchPipe implements PipeTransform {
    transform(seconds: number, zeros: string): string {
        return (zeros.slice(1) + seconds).slice(-(zeros.length));
    }
}