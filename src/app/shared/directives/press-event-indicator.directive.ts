import { Directive, HostListener, Renderer2, ElementRef } from '@angular/core';

@Directive({
    selector: '[pressEventIndicator]'
})
export class PressEventIndicatorDirective {

    @HostListener('press', ['$event'])
    onPress(event) {        
        const indicatorSize = 30;
        const targetRect = this._elementRef.nativeElement.getBoundingClientRect();
        const targetLeft = targetRect.left - ((indicatorSize - targetRect.width) / 2);
        const targetTop = targetRect.top - ((indicatorSize - targetRect.height) / 2);
        const indicatorEl = this._renderer2.createElement('div');

        this._renderer2.addClass(indicatorEl, 'press-event-indicator');
        this._renderer2.setAttribute(indicatorEl, 'style', `top: ${targetTop}px; left:${targetLeft}px; width: ${indicatorSize}px; height: ${indicatorSize}px`);
        this._renderer2.appendChild(this._elementRef.nativeElement, indicatorEl);
        setTimeout(() => this._renderer2.addClass(indicatorEl, 'active'), 100);
        setTimeout(() => this._renderer2.removeChild(this._elementRef.nativeElement, indicatorEl), 400);        
    }
    
    constructor(
        private _renderer2: Renderer2,
        private _elementRef: ElementRef
    ) { }

}
