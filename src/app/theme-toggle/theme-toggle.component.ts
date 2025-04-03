import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-toggle">
      <button 
        class="toggle-button" 
        [class.dark]="isDarkMode" 
        [class.light]="!isDarkMode"
        (click)="toggleTheme()" 
        aria-label="Toggle theme">
        <span class="icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
        <span class="label">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
    </div>
  `,
  styles: [`
    .theme-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .toggle-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 24px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }
    
    .toggle-button.light {
      background-color: #1c1f21;
      color: #e1e2e3;
    }
    
    .toggle-button.dark {
      background-color: #f5f5f5;
      color: #333;
    }
    
    .toggle-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .icon {
      font-size: 1.2rem;
    }
    
    .label {
      font-size: 0.9rem;
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode: boolean = false;
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
