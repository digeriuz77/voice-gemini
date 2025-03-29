import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
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
    </div>
  `,
  styles: [`
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
      color: #1f94ff;
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
      color: #707577;
      font-size: 14px;
      padding: 20px 0;
    }
  `]
})
export class AppComponent {
  title = 'myapp';
}
