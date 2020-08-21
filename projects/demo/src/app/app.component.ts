import { Component } from '@angular/core';
import { classBasedAnimation } from '../../../ngx-css-anim/src/lib/animation';
import { AnimationConfig } from 'ngx-css-anim';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly shakeAnimation = classBasedAnimation('shake');
  readonly slideInAnimation = classBasedAnimation('slide-in');
  readonly bumpAnimation = classBasedAnimation('bump');
  showBump = true;
  readonly bounceAnimation = classBasedAnimation('animate__bounce');

  constructor(private config: AnimationConfig) {}

  get animationsEnabled(): boolean {
    return !this.config.animationsDisabled;
  }

  set animationsEnabled(enabled: boolean) {
    this.config.animationsDisabled = !enabled;
  }
}
