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
    <span *ngIf="isLoading()"> Loading... </span>
    <br />

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
    effect(() => {
      this.search();
    }, {
      allowSignalWrites: true
    });
  }

  async search() {
    if (!this.inputName() || !this.inputGender()) return;

    this.isLoading.set(true);
    const allPeople = await this.#starWars.getPeopleAsPromise();
    this.people.set(allPeople);
    this.isLoading.set(false);
  }
}
