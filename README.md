# NgxCssAnim

A tiny Angular library to run CSS animations, without using the Angular animations module.

## Rationale

Let's face it, Angular animations are complex, and you typically don't use them every day, making
the task even more painful.

Adding the Angular browser animations module has a non-negligible impact on the bundle size, 
can have side-effects on your tests, and can be completely overkill if all you want to have is 
just a few simple CSS animations.

This library doesn't use the Angular browser animations module at all, but instead allows you to
execute CSS animations, typically by adding a CSS class to start the animation, and removing it once
the animation is done.

This allows you to instantly benefit from ready-made CSS animations such as the ones provided by 
[Animate.css](https://animate.style/).

## How to use

The core of the library is the function `animate()`. It's perfectly fine to call it directly. All you need
is to get a reference to the element to animate. For example:

```typescript
@Component({
  template: `
    ...
    <div #someDiv>...</div>
    <button (click)="onClick($event.target)">Click</button>
  `
})
class MyComponent {
  @ViewChild('someDiv') someDiv: ElementRef<HTMLDivElement>;

  constructor(private animationConfig: AnimationConfig) { }

  onClick(button: HTMLButtonElement) {
    const shake = classBasedAnimation('shake');
    // animate the button
    animate(button, shake, this.animationConfig.animationsDisabled).subscribe(); 

    // animate the div
    animate(someDiv.nativeElement, shake, this.animationConfig.animationsDisabled).subscribe(); 
  }
}
```

Note that the `AnimationConfig` service is used to be able (in tests most of the time), to run
the animations synchronously, thus avoiding to have to use asynchronous tests.

The same can be achieved using the `anImate` directive, which automatically honors the 
animation configuration. For example:

```typescript
@Component({
  template: `
    ...
    <div [anImate]="shake" #div="anImate">...</div>
    <button [anImate]="shake" #btn="anImate" (click)="btn.animateNow(); div.animateNow()">Click</button>
  `
})
class MyComponent {
  readonly shake = classBasedAnimation('shake');
}
```

or, to be able to do something other than just animating:

```typescript
@Component({
  template: `
    ...
    <div [anImate]="shake" #div="anImate">...</div>
    <button [anImate]="shake" #btn="anImate" (click)="onClick(btn.animate(), div.animate())">Click</button>
  `
})
class MyComponent {
  readonly shake = classBasedAnimation('shake');

  onClick(btnAnimation$: Observable<void>, divAnimation$: Observable<void>) {
    // wait until the two animations are done and then do something 
    forkJoin(btnAnimation$, divAnimation$).subscribe(() => doSomethingElse());
  }
}
```

If you want an animation to run as soon as an element appears on the page, you can
set the `animateOnInit` input to `true`. And to be notified when the animation ends,
you can use the `animationEnd` output:

```typescript
@Component({
  template: `
    <div [anImate]="shake" [animateOnInit]="true" (animationEnd)="ended()">...</div>
  `
})
class MyComponent {
  readonly shake = classBasedAnimation('shake');

  ended() {
    console.log('the animation has ended'); 
  }
}
```

For more information, check the API documentation.
