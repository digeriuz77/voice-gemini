import { Routes } from '@angular/router';

export const SCREENING_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./welcome/screening-welcome.component').then(m => m.ScreeningWelcomeComponent) 
  },
  { 
    path: 'introduction', 
    loadComponent: () => import('./introduction/screening-introduction.component').then(m => m.ScreeningIntroductionComponent) 
  },
  { 
    path: 'questionnaire', 
    loadComponent: () => import('./questionnaire/screening-questionnaire.component').then(m => m.ScreeningQuestionnaireComponent) 
  },
  { 
    path: 'letter-reversal', 
    loadComponent: () => import('./letter-reversal/letter-reversal.component').then(m => m.LetterReversalComponent) 
  },
  { 
    path: 'pattern-matching', 
    loadComponent: () => import('./pattern-matching/pattern-matching.component').then(m => m.PatternMatchingComponent) 
  },
  { 
    path: 'results', 
    loadComponent: () => import('./results/screening-results.component').then(m => m.ScreeningResultsComponent) 
  }
];
