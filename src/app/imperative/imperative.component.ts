import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person, StarWarsService } from '../star-wars.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-imperative',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Search for Star Wars Person (Imperative)</h2>
    <input type="text" [(ngModel)]="inputName" placeholder="Name..." />
    <br />
    <input type="text" [(ngModel)]="inputGender" placeholder="Gender..." />
    <br />
    <button type="button" (click)="search()">Search</button>

    <span *ngIf="isLoading">Loading...</span>

    <ul *ngIf="!!people">
      <li *ngFor="let p of people">{{ p.name }} ({{ p.gender }})</li>
    </ul>
  `,
  styleUrls: ['./imperative.component.scss'],
})
export default class ImperativeComponent {
  readonly #starWars = inject(StarWarsService);

  inputName!: string;
  inputGender!: string;
  people!: Person[];
  isLoading = false;

  async search() {
    if (!this.inputName || !this.inputGender) return;

    this.isLoading = true;
    const allPeople = await this.#starWars.getPeopleAsPromise();
    this.people = this.#filterPeople(allPeople);
    this.isLoading = false;
  }

  #filterPeople(people: Person[]): Person[] {
    return people.filter(
      (p) =>
        p.name
          .toLocaleLowerCase()
          .startsWith(this.inputName.toLocaleLowerCase()) &&
        p.gender
          .toLocaleLowerCase()
          .startsWith(this.inputGender.toLocaleLowerCase())
    );
  }
}
