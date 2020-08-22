import { Component } from '@angular/core';
import { AnimationConfig, animate, classBasedAnimation } from 'ngx-css-anim';

interface Person {
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly shakeAnimation = classBasedAnimation('shake');
  readonly slideInAnimation = classBasedAnimation('slide-in');
  readonly bumpAnimation = classBasedAnimation('bump');
  readonly fadeInAnimation = classBasedAnimation('fade-in');
  showBump = true;
  persons: Array<Person>;

  constructor(private config: AnimationConfig) {
    this.resetPersons();
  }

  get animationsEnabled(): boolean {
    return !this.config.animationsDisabled;
  }

  set animationsEnabled(enabled: boolean) {
    this.config.animationsDisabled = !enabled;
  }

  removePerson(element: HTMLElement, index: number): void {
    animate(element, classBasedAnimation('fade-out'), this.config.animationsDisabled).subscribe(
      () => {
        this.persons.splice(index, 1);
      }
    );
  }

  resetPersons(): void {
    this.persons = [
      'Agnès Crépet',
      'Cédric Exbrayat',
      'Cyril Lacote',
      'Jean-Baptiste Nizet'
    ].map(name => ({ name }));
  }

  personName(index: number, person: Person): string {
    return person.name;
  }
}
