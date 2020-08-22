import { animate, classBasedAnimation, CssAnimation } from './animation';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ComponentTester, speculoosMatchers, TestHtmlElement } from 'ngx-speculoos';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  template: '<div></div>',
  styles: [
    `
      @keyframes animated {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      .animated {
        animation: animated 300ms ease;
      }
    `
  ]
})
class TestComponent {}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get div(): TestHtmlElement<HTMLDivElement> {
    return this.element('div');
  }
}

describe('animation', () => {
  let tester: TestComponentTester;
  let animation: CssAnimation;

  beforeEach(() => {
    animation = classBasedAnimation('animated');
    TestBed.configureTestingModule({
      declarations: [TestComponent]
    });

    jasmine.addMatchers(speculoosMatchers);

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should create a class-based animation', () => {
    expect(tester.div).not.toHaveClass('animated');

    animation.onStart(tester.div.nativeElement);
    expect(tester.div).toHaveClass('animated');

    animation.onEnd(tester.div.nativeElement);
    expect(tester.div).not.toHaveClass('animated');
  });

  it('should return a cold observable', () => {
    const observable = animate(tester.div.nativeElement, animation);
    tester.detectChanges();

    expect(tester.div).not.toHaveClass('animated');

    observable.subscribe();
    tester.detectChanges();

    expect(tester.div).toHaveClass('animated');
  });

  it('should animate by reacting to animationend event', () => {
    let eventCount = 0;
    let done = false;
    animate(tester.div.nativeElement, animation).subscribe({
      next: () => eventCount++,
      complete: () => (done = true)
    });
    tester.detectChanges();
    expect(tester.div).toHaveClass('animated');
    expect(eventCount).toBe(0);
    expect(done).toBe(false);

    tester.div.dispatchEventOfType('animationend');

    expect(tester.div).not.toHaveClass('animated');
    expect(eventCount).toBe(1);
    expect(done).toBe(true);
  });

  it('should animate by reacting to timeout', fakeAsync(() => {
    let eventCount = 0;
    let done = false;
    animate(tester.div.nativeElement, animation).subscribe({
      next: () => eventCount++,
      complete: () => (done = true)
    });
    tester.detectChanges();
    expect(tester.div).toHaveClass('animated');
    expect(eventCount).toBe(0);
    expect(done).toBe(false);

    tick(350);
    tester.detectChanges();

    expect(tester.div).not.toHaveClass('animated');
    expect(eventCount).toBe(1);
    expect(done).toBe(true);
  }));

  it('should animate synchronously', () => {
    let eventCount = 0;
    let done = false;

    spyOn(animation, 'onStart').and.callThrough();
    spyOn(animation, 'onEnd').and.callThrough();

    animate(tester.div.nativeElement, animation, true).subscribe({
      next: () => eventCount++,
      complete: () => (done = true)
    });
    tester.detectChanges();
    expect(tester.div).not.toHaveClass('animated');
    expect(eventCount).toBe(1);
    expect(done).toBe(true);
    expect(animation.onStart).toHaveBeenCalled();
    expect(animation.onEnd).toHaveBeenCalled();
  });

  it('should animate when no onEnd', () => {
    const noOnEndAnimation: CssAnimation = {
      onStart: el => el.classList.add('animated')
    };

    let eventCount = 0;
    let done = false;
    animate(tester.div.nativeElement, noOnEndAnimation).subscribe({
      next: () => eventCount++,
      complete: () => (done = true)
    });
    tester.detectChanges();
    expect(tester.div).toHaveClass('animated');
    expect(eventCount).toBe(0);
    expect(done).toBe(false);

    tester.div.dispatchEventOfType('animationend');

    expect(tester.div).toHaveClass('animated');
    expect(eventCount).toBe(1);
    expect(done).toBe(true);
  });

  it('should call onEnd when animation is interrupted', fakeAsync(() => {
    const interruption = new Subject<void>();
    animate(tester.div.nativeElement, animation).pipe(takeUntil(interruption)).subscribe();
    tester.detectChanges();
    expect(tester.div).toHaveClass('animated');

    tick(100);
    interruption.next();
    interruption.complete();

    tester.detectChanges();
    expect(tester.div).not.toHaveClass('animated');
  }));
});
