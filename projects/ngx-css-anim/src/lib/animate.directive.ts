import { AfterViewInit, Directive, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { AnimationConfig } from './animation-config.service';
import { CssAnimation, animate } from './animation';

/**
 * Directive allowing to animate its host element.
 * The directive is exported as `'cssAnimate'` which allows getting a reference to the directive.`
 * The animation can imperatively be executed when some event occurs by calling the `animate()` method.
 *
 * For example:
 * ```
 * @Component({
 *   template: `
 *     <div [cssAnimate]="shakeAnimation" #toShake="cssAnimate">I'll shake when the button is clicked</div>
 *     <button type="button" (click)="toShake.animate()">Shake the div</button>
 *   `
 * }
 * class MyComponent implements AfterViewInit {
 *   shakeAnimation = classBasedAnimation('shake');
 * }
 * ```
 *
 * It can also be executed whe the view is initialized:
 *
 * ```
 * @Component({
 *   template: `<div [cssAnimate]="shakeAnimation" [animateOnInit]="true">I'll shake when the component view is initialized</div>`
 * }
 * class MyComponent implements AfterViewInit {
 *   shakeAnimation = classBasedAnimation('shake');
 * }
 * ```
 */
@Directive({
  selector: '[cssAnimate]',
  exportAs: 'cssAnimate'
})
export class AnimateDirective implements AfterViewInit {
  @Input('cssAnimate') animation: CssAnimation;
  @Input() animateOnInit: boolean;
  @Output() readonly animationEnd = new EventEmitter<void>();

  constructor(private config: AnimationConfig, private elementRef: ElementRef) {}

  /**
   * Executes the animation on the host element of the directive
   */
  animate(): void {
    animate(
      this.elementRef.nativeElement,
      this.animation,
      this.config.animationsDisabled
    ).subscribe(() => this.animationEnd.emit());
  }

  ngAfterViewInit(): void {
    if (this.animateOnInit) {
      this.animate();
    }
  }
}
