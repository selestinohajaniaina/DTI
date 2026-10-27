import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.Home),
    title: "DTI — Don't Trash It",
  },
  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./features/how-it-works/how-it-works.component').then((m) => m.HowItWorks),
    title: 'How it works — DTI',
  },
  {
    path: 'results',
    loadComponent: () => import('./features/results/results.component').then((m) => m.Results),
    title: 'Results — DTI',
  },
  { path: '**', redirectTo: '' },
];
