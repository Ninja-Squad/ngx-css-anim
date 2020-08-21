import { classBasedAnimation } from './animation';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ComponentTester, speculoosMatchers, TestButton, TestHtmlElement } from 'ngx-speculoos';
import { AnimationConfig, NgxCssAnimModule } from 'ngx-css-anim';

@Component({
  template: `
    <div
      [anImate]="animation"
      [animateOnInit]="onInit"
      (animationEnd)="done = true"
      #div="anImate"
    ></div>
    <button (click)="div.animate()"></button>
  `,
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
class TestComponent {
  animation = classBasedAnimation('foo');
  onInit = false;
  done = false;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get div(): TestHtmlElement<HTMLDivElement> {
    return this.element('div');
  }

  get animateButton(): TestButton {
    return this.button('button');
  }
}

describe('animate directive', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxCssAnimModule],
      declarations: [TestComponent]
    });

    jasmine.addMatchers(speculoosMatchers);

    tester = new TestComponentTester();
  });

  it('should animate imperatively', fakeAsync(() => {
    tester.detectChanges();
    expect(tester.div).not.toHaveClass('foo');

    tester.animateButton.click();

    expect(tester.div).toHaveClass('foo');
    expect(tester.componentInstance.done).toBeFalse();

    tick(350);

    expect(tester.div).not.toHaveClass('foo');
    expect(tester.componentInstance.done).toBeTrue();
  }));

  it('should animate on init', fakeAsync(() => {
    tester.componentInstance.onInit = true;
    tester.detectChanges();

    expect(tester.div).toHaveClass('foo');
    expect(tester.componentInstance.done).toBeFalse();

    tick(350);

    expect(tester.div).not.toHaveClass('foo');
    expect(tester.componentInstance.done).toBeTrue();
  }));

  it('should animate synchronously if animations are disabled', () => {
    TestBed.inject(AnimationConfig).animationsDisabled = true;
    tester.detectChanges();

    tester.animateButton.click();

    expect(tester.div).not.toHaveClass('foo');
    expect(tester.componentInstance.done).toBeTrue();
  });
});
