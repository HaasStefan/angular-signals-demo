import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Person, StarWarsService } from '../star-wars.service';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-rxjs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Search for Star Wars Person (RxJS)</h2>
    <input type="text" [formControl]="inputName" placeholder="Name..." />
    <br />
    <input type="text" [formControl]="inputGender" placeholder="Gender..." />
    <br />

    <span *ngIf="isLoading$ | async">Loading...</span>

    <ul *ngIf="people$ | async as people">
      <li *ngFor="let p of people">{{ p.name }} ({{ p.gender }})</li>
    </ul>
  `,
  styleUrls: ['./rxjs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RxjsComponent {
  readonly #starWars = inject(StarWarsService);
  readonly #fb = inject(FormBuilder);

  readonly inputName = this.#fb.control('');
  readonly inputGender = this.#fb.control('');
  readonly #isLoading = new BehaviorSubject(false);
  readonly isLoading$ = this.#isLoading.asObservable();
  readonly people$ = combineLatest({
    name: this.inputName.valueChanges,
    gender: this.inputGender.valueChanges,
  }).pipe(
    filter(
      (combined): combined is { name: string; gender: string } =>
        !!combined.name && !!combined.gender
    ),
    filter(({ name, gender }) => name.length > 2 && gender.length > 2),
    debounceTime(800),
    tap(() => this.#isLoading.next(true)),
    switchMap(({ name, gender }) =>
      this.#starWars.getPeople().pipe(
        map((people) => ({
          people,
          name,
          gender,
        }))
      )
    ),
    this.#filterPeople(),
    tap(() => this.#isLoading.next(false))
  );

  #filterPeople(): (
    source$: Observable<{
      people: Person[];
      name: string;
      gender: string;
    }>
  ) => Observable<Person[]> {
    return (source$) =>
      source$.pipe(
        map(({ people, name, gender }) =>
          people.filter(
            (p) =>
              p.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()) &&
              p.gender
                .toLocaleLowerCase()
                .startsWith(gender.toLocaleLowerCase())
          )
        )
      );
  }
}
