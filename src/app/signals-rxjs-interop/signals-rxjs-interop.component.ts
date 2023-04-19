import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Person, StarWarsService } from '../star-wars.service';
import {
  combineLatest,
  debounceTime,
  filter,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-signals-rxjs-interop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Search for Star Wars Person (Signals RxJS-Interop)</h2>

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

    <span *ngIf="isLoading()">Loading...</span>

    <ul *ngIf="people() as people">
      <li *ngFor="let p of people">{{ p.name }} ({{ p.gender }})</li>
    </ul>
  `,
  styleUrls: ['./signals-rxjs-interop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignalsRxJSInteropComponent {
  readonly #starWars = inject(StarWarsService);

  readonly inputName = signal('');
  readonly inputGender = signal('');
  readonly isLoading = signal(false);
  readonly people$ = combineLatest({
    name: toObservable(this.inputName),
    gender: toObservable(this.inputGender),
  }).pipe(
    filter(
      (combined): combined is { name: string; gender: string } =>
        !!combined.name && !!combined.gender
    ),
    filter(({ name, gender }) => name.length > 2 && gender.length > 2),
    debounceTime(800),
    tap(() => this.isLoading.set(true)),
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
    tap(() => this.isLoading.set(false)),
    takeUntilDestroyed()
  );

  readonly people = toSignal<Person[], Person[]>(this.people$, {
    initialValue: [],
  });

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
