import { classBasedAnimation } from './animation';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ComponentTester, speculoosMatchers, TestButton, TestHtmlElement } from 'ngx-speculoos';
import { AnimationConfig } from './animation-config.service';
import { NgxCssAnimModule } from './ngx-css-anim.module';
import { Observable } from 'rxjs';

@Component({
  template: `
    <div
      [anImate]="animation"
      [animateOnInit]="onInit"
      (animationEnd)="done = true"
      #div="anImate"
    ></div>
    <button id="animate-button" (click)="div.animateNow()"></button>
    <button id="do-something-button" (click)="doSomething(div.animate())"></button>
  `,
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
        animation: foo 300ms ease;
      }
    `
  ]
})
class TestComponent {
  animation = classBasedAnimation('animated');
  onInit = false;
  done = false;
  somethingDone = false;

  doSomething(animation$: Observable<void>): void {
    animation$.subscribe(() => (this.somethingDone = true));
  }
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get div(): TestHtmlElement<HTMLDivElement> {
    return this.element('div');
  }

  get animateButton(): TestButton {
    return this.button('#animate-button');
  }

  get doSomethingButton(): TestButton {
    return this.button('#do-something-button');
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
    expect(tester.div).not.toHaveClass('animated');

    tester.animateButton.click();

    expect(tester.div).toHaveClass('animated');
    expect(tester.componentInstance.done).toBeFalse();

    tick(350);

    expect(tester.div).not.toHaveClass('animated');
    expect(tester.componentInstance.done).toBeTrue();
  }));

  it('should animate on init', fakeAsync(() => {
    tester.componentInstance.onInit = true;
    tester.detectChanges();

    expect(tester.div).toHaveClass('animated');
    expect(tester.componentInstance.done).toBeFalse();

    tick(350);

    expect(tester.div).not.toHaveClass('animated');
    expect(tester.componentInstance.done).toBeTrue();
  }));

  it('should animate synchronously if animations are disabled', () => {
    TestBed.inject(AnimationConfig).animationsDisabled = true;
    tester.detectChanges();

    tester.animateButton.click();

    expect(tester.div).not.toHaveClass('animated');
    expect(tester.componentInstance.done).toBeTrue();
  });

  it('should do something after the animation is don', fakeAsync(() => {
    tester.detectChanges();

    tester.doSomethingButton.click();

    expect(tester.div).toHaveClass('animated');
    expect(tester.componentInstance.done).toBeFalse();
    expect(tester.componentInstance.somethingDone).toBeFalse();

    tick(350);

    expect(tester.div).not.toHaveClass('animated');
    expect(tester.componentInstance.done).toBeTrue();
    expect(tester.componentInstance.somethingDone).toBeTrue();
  }));
});
