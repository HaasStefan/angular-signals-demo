import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Person, StarWarsService } from '../star-wars.service';

export function onUpdate<T>(signal: WritableSignal<T>, callback: (value: T) => void) {
  const original = signal.update;
  signal.update = (updateFn: (value: T) => T) => {
      original(updateFn);
      callback(signal());
  };
}

export function onSet<T>(
  signal: WritableSignal<T>,
  callback: (value: T) => void
) {
  const original = signal.set;
  signal.set = (value: T) => {
    original(value);
    callback(value);
  };
}

export function onMutate<T>(
  signal: WritableSignal<T>,
  callback: (value: T) => void
) {
  const original = signal.mutate;
  signal.mutate = (mutatorFn: (value: T) => void) => {
    original(mutatorFn);
    callback(signal());
  };
}

@Component({
  selector: 'app-signals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Search for Star Wars Person (Signals)</h2>
    <input
      type="text"
      [ngModel]="inputName()"
      (ngModelChange)="inputName.set($event)"
      placeholder="Name..."
    />
    <br />
    <input
      type="text"
      [ngModel]="inputGender()"
      (ngModelChange)="inputGender.set($event)"
      placeholder="Gender..."
    />
    <br />
    <button type="button" (click)="search()">Search</button>
    <span *ngIf="isLoading()"> Loading... </span>
    <br />

    <button type="button" (click)="set()">set</button>
    <button type="button" (click)="update()">update</button>
    <button type="button" (click)="mutate()">mutate</button>
    <br />
    Counter: {{ counter() }}

    <ul>
      <li *ngFor="let p of filteredPeople()">{{ p.name }} ({{ p.gender }})</li>
    </ul>
  `,
  styleUrls: ['./signals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignalsComponent {
  readonly #starWars = inject(StarWarsService);

  readonly inputName = signal('');
  readonly inputGender = signal('');
  readonly isLoading = signal(false);
  readonly people = signal<Person[]>([]);

  readonly counter = signal(0);

  readonly filteredPeople = computed(() =>
    this.people().filter((person) => {
      return (
        person.name
          .toLocaleLowerCase()
          .startsWith(this.inputName().toLocaleLowerCase()) &&
        person.gender
          .toLocaleLowerCase()
          .startsWith(this.inputGender().toLocaleLowerCase())
      );
    })
  );

  constructor() {
    onSet(this.counter, console.log);
    onMutate(this.counter, console.warn);
    onUpdate(this.counter, console.error);

    effect(() => {
      if (this.isLoading()) {
        console.log('Searching...');
      }
    });
  }

  set() {
    const counter = this.counter();
    this.counter.set(counter + 1);
  }

  update() {
    this.counter.update((val) => val + 1);
  }

  mutate() {
    this.counter.mutate((val) => {
      val = val + 1;
    });
  }

  async search() {
    if (!this.inputName || !this.inputGender) return;

    this.isLoading.set(true);
    const allPeople = await this.#starWars.getPeopleAsPromise();
    this.people.set(allPeople);
    this.isLoading.set(false);
  }
}
