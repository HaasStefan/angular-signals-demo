import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Person, StarWarsService } from '../star-wars.service';

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
    criteria: {{ criteria() }}
    <br />

    <ul *ngIf="people() as people">
      <li *ngFor="let p of people">{{ p.name }} ({{ p.gender }})</li>
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

  readonly criteria = computed(
    () => `Name: ${this.inputName()}, Gender: ${this.inputGender()}`
  );

  constructor() {
    effect(() => {
      if (this.isLoading()) {
        console.log('Searching...');
      }
    });
  }

  async search() {
    if (!this.inputName || !this.inputGender) return;

    this.isLoading.set(true);
    const allPeople = await this.#starWars.getPeopleAsPromise();
    this.people.set(this.#filterPeople(allPeople));
    this.isLoading.set(false);
  }

  #filterPeople(people: Person[]): Person[] {
    return people.filter(
      (p) =>
        p.name
          .toLocaleLowerCase()
          .startsWith(this.inputName().toLocaleLowerCase()) &&
        p.gender
          .toLocaleLowerCase()
          .startsWith(this.inputGender().toLocaleLowerCase())
    );
  }
}
