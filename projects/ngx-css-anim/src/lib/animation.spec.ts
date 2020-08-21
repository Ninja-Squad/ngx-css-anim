import { animate, classBasedAnimation, CssAnimation } from './animation';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ComponentTester, speculoosMatchers, TestHtmlElement } from 'ngx-speculoos';

@Component({
  template: '<div></div>',
  styles: [
    `
      @keyframes foo {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      .foo {
        animation: foo 300ms ease;
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
    animation = classBasedAnimation('foo');
    TestBed.configureTestingModule({
      declarations: [TestComponent]
    });

    jasmine.addMatchers(speculoosMatchers);

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should create a class-based animation', () => {
    expect(tester.div).not.toHaveClass('foo');

    animation.onStart(tester.div.nativeElement);
    expect(tester.div).toHaveClass('foo');

    animation.onEnd(tester.div.nativeElement);
    expect(tester.div).not.toHaveClass('foo');
  });

  it('should animate by reacting to animationend event', () => {
    let eventCount = 0;
    let done = false;
    animate(tester.div.nativeElement, animation).subscribe({
      next: () => eventCount++,
      complete: () => (done = true)
    });
    tester.detectChanges();
    expect(tester.div).toHaveClass('foo');
    expect(eventCount).toBe(0);
    expect(done).toBe(false);

    tester.div.dispatchEventOfType('animationend');

    expect(tester.div).not.toHaveClass('foo');
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
    expect(tester.div).toHaveClass('foo');
    expect(eventCount).toBe(0);
    expect(done).toBe(false);

    tick(350);
    tester.detectChanges();

    expect(tester.div).not.toHaveClass('foo');
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
    expect(tester.div).not.toHaveClass('foo');
    expect(eventCount).toBe(1);
    expect(done).toBe(true);
    expect(animation.onStart).toHaveBeenCalled();
    expect(animation.onEnd).toHaveBeenCalled();
  });

  it('should animate when no onEnd', () => {
    const noOnEndAnimation: CssAnimation = {
      onStart: el => el.classList.add('foo')
    };

    let eventCount = 0;
    let done = false;
    animate(tester.div.nativeElement, noOnEndAnimation).subscribe({
      next: () => eventCount++,
      complete: () => (done = true)
    });
    tester.detectChanges();
    expect(tester.div).toHaveClass('foo');
    expect(eventCount).toBe(0);
    expect(done).toBe(false);

    tester.div.dispatchEventOfType('animationend');

    expect(tester.div).toHaveClass('foo');
    expect(eventCount).toBe(1);
    expect(done).toBe(true);
  });
});
