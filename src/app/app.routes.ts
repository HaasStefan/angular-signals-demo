import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'imperative',
    pathMatch: 'full',
  },
  {
    path: 'imperative',
    loadComponent: async () =>
      await import('./imperative/imperative.component'),
  },
  {
    path: 'rxjs',
    loadComponent: async () => await import('./rxjs/rxjs.component'),
  },
  {
    path: 'signals',
    loadComponent: async () => await import('./signals/signals.component'),
  },
  {
    path: 'signals-rxjs-interop',
    loadComponent: async () => await import('./signals-rxjs-interop/signals-rxjs-interop.component'),
  },
];
