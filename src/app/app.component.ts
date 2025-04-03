import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ThemeToggleComponent
  ],
  template: `
    <div class="app-container">
      <header>
        <nav>
          <a routerLink="/" class="logo">Gemini Voice Chat</a>
        </nav>
      </header>
      
      <main>
        <router-outlet></router-outlet>
      </main>
      
      <footer>
        <p>Powered by Gemini 2.0 Live API</p>
      </footer>
      
      <app-theme-toggle></app-theme-toggle>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: var(--background-color, #121212);
      color: var(--text-color, #e1e2e3);
    }
    
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 20px;
    }
    
    header {
      margin-bottom: 20px;
    }
    
    nav {
      display: flex;
      justify-content: center;
    }
    
    .logo {
      color: var(--primary-color, #1f94ff);
      font-size: 1.5rem;
      text-decoration: none;
      font-weight: bold;
    }
    
    main {
      flex-grow: 1;
    }
    
    footer {
      margin-top: 30px;
      text-align: center;
      color: var(--secondary-text, #707577);
      font-size: 14px;
      padding: 20px 0;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'myapp';
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // Initialize theme
    this.themeService.setTheme(this.themeService.getCurrentTheme());
  }
}
