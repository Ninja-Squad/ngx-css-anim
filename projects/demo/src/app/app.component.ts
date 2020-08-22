import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { animate, AnimationConfig, classBasedAnimation } from 'ngx-css-anim';
import { concat } from 'rxjs';

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
  chainedPersons = this.allPersons();

  @ViewChildren('chainedPersonElement') chainedPersonElements: QueryList<ElementRef<HTMLElement>>;

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
    this.persons = this.allPersons();
  }

  personName(index: number, person: Person): string {
    return person.name;
  }

  bumpChainedPersons(): void {
    const animations = this.chainedPersonElements.map(el =>
      animate(el.nativeElement, this.bumpAnimation, this.config.animationsDisabled)
    );
    concat(...animations).subscribe(() => {
      console.log('done');
    });
  }

  private allPersons(): Array<Person> {
    return ['Agnès Crépet', 'Cédric Exbrayat', 'Cyril Lacote', 'Jean-Baptiste Nizet'].map(name => ({
      name
    }));
  }
}
