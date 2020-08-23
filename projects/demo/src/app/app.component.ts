import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { animate, AnimationConfig, classBasedAnimation } from 'ngx-css-anim';
import { concat, forkJoin, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Person {
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly bumpAnimation = classBasedAnimation('bump');
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
    concat(...animations).subscribe();
  }

  bumpChainedPersonsWithDelay(): void {
    const animations = this.chainedPersonElements.map((el, i) =>
      timer(i * 100).pipe(
        switchMap(() =>
          animate(el.nativeElement, this.bumpAnimation, this.config.animationsDisabled)
        )
      )
    );
    forkJoin(...animations).subscribe();
  }

  private allPersons(): Array<Person> {
    return ['Agnès Crépet', 'Cédric Exbrayat', 'Cyril Lacote', 'Jean-Baptiste Nizet'].map(name => ({
      name
    }));
  }
}
