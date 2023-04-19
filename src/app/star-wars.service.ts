import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';

export type Gender = 'Male' | 'Female' | 'unknown' | 'n/a';

export interface Person {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: Gender;
  homeworld: string;
  films: string[];
  species: any[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class StarWarsService {
  readonly #http = inject(HttpClient);

  getPeople() {
    return this.#http
      .get<{
        results: Person[];
      }>('https://swapi.dev/api/people')
      .pipe(map((res) => res.results));
  }

  getPeopleAsPromise() {
    return firstValueFrom(this.getPeople());
  }
}
