import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <h1>Angular Signals Demo</h1>

    <nav>
      <button type="button" routerLink="/imperative">Imperative</button>
      <button type="button" routerLink="/rxjs">RxJS</button>
      <button type="button" routerLink="/signals">Signals</button>
      <button type="button" routerLink="/signals-rxjs-interop">Signals RxJS Interop</button>
    </nav>

    <br />
    <br />

    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
