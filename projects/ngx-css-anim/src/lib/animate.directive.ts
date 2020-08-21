import { AfterViewInit, Directive, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { AnimationConfig } from './animation-config.service';
import { CssAnimation, animate } from './animation';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Directive allowing to animate its host element.
 * The directive is exported as `'cssAnimate'` which allows getting a reference to the directive.`
 * The animation can imperatively be executed when some event occurs by calling the `animate()` method.
 *
 * For example:
 * ```
 * @Component({
 *   template: `
 *     <div [anImate]="shakeAnimation" #toShake="anImate">I'll shake when the button is clicked</div>
 *     <button type="button" (click)="toShake.animateNow()">Shake the div</button>
 *   `
 * }
 * class MyComponent {
 *   shakeAnimation = classBasedAnimation('shake');
 * }
 * ```
 *
 * It can also be executed whe the view is initialized:
 *
 * ```
 * @Component({
 *   template: `<div [anImate]="shakeAnimation" [animateOnInit]="true">I'll shake when the component view is initialized</div>`
 * }
 * class MyComponent {
 *   shakeAnimation = classBasedAnimation('shake');
 * }
 * ```
 *
 * Often, clicking a button must do more than just executing an animation. To combine an additional
 * treatment with the animation, you can call `animate()` instead of `animateNow()`, and pass the returned cold observable
 * to a method of the component, which can then use RxJS to do something else once the animation is done, or while the animation
 * is running.
 *
 * ```
 * @Component({
 *   template: `
 *     <div [anImate]="shakeAnimation" #toShake="anImate">I'll shake when the button is clicked</div>
 *     <button type="button" (click)="doSomething(toShake.animateNow())">Shake the div</button>
 *   `
 * }
 * class MyComponent {
 *   shakeAnimation = classBasedAnimation('shake');
 *
 *   doSomething(animation$: Observable<void>) {
 *     animations$.subscribe(() => doSomethingAfterAnimation());
 *   }
 * }
 * ```
 */
@Directive({
  selector: '[anImate]',
  exportAs: 'anImate'
})
export class AnimateDirective implements AfterViewInit {
  /**
   * The CssAnimation that the directive must execute
   */
  @Input('anImate') animation: CssAnimation;

  /**
   * If true, the animation is executed when the view of the directive is initialized
   */
  @Input() animateOnInit: boolean;

  /**
   * Emits when the animation ends
   */
  @Output() readonly animationEnd = new EventEmitter<void>();

  constructor(private config: AnimationConfig, private elementRef: ElementRef) {}

  /**
   * Returns an observable which executes the animation on the host element of the directive when subscribed
   */
  animate(): Observable<void> {
    const animationToExecute = this.animation;
    return animate(
      this.elementRef.nativeElement,
      animationToExecute,
      this.config.animationsDisabled
    ).pipe(tap(() => this.animationEnd.emit()));
  }

  /**
   * Executes the animation immediately on the host element of the directive
   */
  animateNow(): void {
    this.animate().subscribe();
  }

  ngAfterViewInit(): void {
    if (this.animateOnInit) {
      this.animateNow();
    }
  }
}
