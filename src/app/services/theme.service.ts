import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  theme$ = this.themeSubject.asObservable();
  
  constructor() {
    this.applyTheme(this.themeSubject.value);
  }
  
  private getInitialTheme(): Theme {
    // Check if user has previously selected a theme
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light mode
    return 'light';
  }
  
  toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }
  
  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme-specific CSS variables
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--background-color', '#121212');
      document.documentElement.style.setProperty('--text-color', '#e1e2e3');
      document.documentElement.style.setProperty('--card-background', '#232729');
      document.documentElement.style.setProperty('--border-color', '#444');
      document.documentElement.style.setProperty('--input-background', '#333');
      document.documentElement.style.setProperty('--primary-color', '#1f94ff');
      document.documentElement.style.setProperty('--secondary-text', '#888d8f');
      document.documentElement.style.setProperty('--section-background', '#1c1f21');
    } else {
      document.documentElement.style.setProperty('--background-color', '#f5f5f5');
      document.documentElement.style.setProperty('--text-color', '#333');
      document.documentElement.style.setProperty('--card-background', '#ffffff');
      document.documentElement.style.setProperty('--border-color', '#ddd');
      document.documentElement.style.setProperty('--input-background', '#fff');
      document.documentElement.style.setProperty('--primary-color', '#1f94ff');
      document.documentElement.style.setProperty('--secondary-text', '#666');
      document.documentElement.style.setProperty('--section-background', '#e9f0f7');
    }
  }
  
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }
}
