import { fromEvent, Observable, of, race, Subject, timer } from 'rxjs';
import { filter, first } from 'rxjs/operators';

/**
 * An animation, consisting in doing something on an element to start the animation,
 * and (usually) to do something on the element when the animation is done.
 *
 * Typically, starting the animation simply consists in adding a CSS class to the element,
 * and once the animation is done, the CSS class is removed so that the animation can be started again.
 *
 * To easily create such animations, you can use the `classBasedAnimation` function.
 */
export interface CssAnimation {
  /**
   * What must happen on the element to start the animation. Typically, it adds a CSS class
   */
  onStart: (el: Element) => void;
  /**
   * What must happen on the element once the animation is done. Typically, it removes the CSS class
   */
  onEnd?: (el: Element) => void;
}

function getAnimationDurationInMillis(element: Element): number {
  const { animationDuration } = window.getComputedStyle(element);
  const animationDurationInSeconds = parseFloat(animationDuration);
  return animationDurationInSeconds * 1000;
}

/**
 * Animates the given element using the given animation. The animation's `onStart` method is called immediately, and
 * this method is supposed to trigger a CSS animation (typically by adding a CSS class to the element, which defines
 * an animation). Then the duration of the animation is automatically obtained from the element. When the `animationend`
 * DOM event is emitted by the element or, by default (in case the event is never emitted), 20 milliseconds after the
 * end of the animation, the `onEnd` method of the animation, if any, is called. This method typically removes the CSS,
 * so that the animation can be re-executed again later.
 * @param element the element to animate
 * @param animation the animation to apply on the element
 * @param synchronous if true, then the `onEnd` method of the animation is called synchronously, immediately
 * after the `onStart` method. This can be useful in tests, when you do not want the animation to take any time.
 * The returned observable, in that case, also emits synchronously, as soon as it is subscribed.
 * @return an Observable which emits a single time and then completes, once the animation is done.
 */
export function animate(
  element: HTMLElement,
  animation: CssAnimation,
  synchronous = false
): Observable<void> {
  animation.onStart(element);
  const onEnd = animation.onEnd || (() => {});
  if (synchronous) {
    onEnd(element);
    return of(undefined);
  }
  const result = new Subject<void>();
  const animationDuration = getAnimationDurationInMillis(element);
  // emits once at the end of the animation
  const animationEnd$ = fromEvent(element, 'animationend').pipe(
    filter(({ target }) => target === element),
    first()
  );
  // emits once some time after the animation end, just in case the animationend event is not emitted
  const timeElapsed$ = timer(animationDuration + 20);
  race(animationEnd$, timeElapsed$).subscribe(() => {
    onEnd(element);
    result.next(undefined);
    result.complete();
  });
  return result.asObservable();
}

/**
 * Creates an animation which adds the given CSS class when the animation is started, and removes it when the animation
 * is done.
 * @param className the CSS class to add and remove to/from the element
 */
export function classBasedAnimation(className): CssAnimation {
  return {
    onStart: el => el.classList.add(className),
    onEnd: el => el.classList.remove(className)
  };
}
