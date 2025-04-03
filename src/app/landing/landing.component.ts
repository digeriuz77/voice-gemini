import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-container">
      <div class="hero">
        <h1>Gemini Voice Chat</h1>
        <p class="subtitle">AI-powered voice assistant using Google's Gemini 2.0 technology</p>
        
        <div class="actions">
          <button class="primary" routerLink="/chat">Start Voice Chat</button>
          <button class="secondary" routerLink="/screening">Dyslexia Screening</button>
        </div>
      </div>
      
      <div class="features">
        <div class="feature-card">
          <div class="icon">🎤</div>
          <h3>Voice Interaction</h3>
          <p>Talk naturally with the assistant using your voice</p>
        </div>
        
        <div class="feature-card">
          <div class="icon">🤖</div>
          <h3>Gemini 2.0 Powered</h3>
          <p>Backed by Google's powerful multimodal AI technology</p>
        </div>
        
        <div class="feature-card">
          <div class="icon">⚡</div>
          <h3>Real-time Responses</h3>
          <p>Get instant AI responses as you speak</p>
        </div>
        
        <div class="feature-card">
          <div class="icon">📚</div>
          <h3>Dyslexia Screening</h3>
          <p>Interactive assessment for early detection of reading difficulties</p>
        </div>
      </div>
      
      <div class="info-section">
        <h2>How It Works</h2>
        <h3>Voice Chat</h3>
        <ol>
          <li>Click "Start Voice Chat" to begin</li>
          <li>Allow microphone access when prompted</li>
          <li>Speak naturally to the assistant</li>
          <li>The assistant will respond with audio and text</li>
        </ol>
        
        <h3>Dyslexia Screening</h3>
        <ol>
          <li>Click "Dyslexia Screening" to begin</li>
          <li>Select age group and accessibility preferences</li>
          <li>Complete the interactive questionnaire and activities</li>
          <li>Receive personalized results and recommendations</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: var(--text-color);
    }
    
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 60px 20px;
    }
    
    h1 {
      font-size: 3rem;
      margin-bottom: 16px;
      color: var(--primary-color);
      line-height: 1.2;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: var(--secondary-text);
      max-width: 600px;
      margin-bottom: 40px;
    }
    
    .actions {
      display: flex;
      gap: 16px;
    }
    
    button.primary {
      background-color: var(--primary-color);
      color: white;
      font-size: 1.1rem;
      padding: 12px 24px;
      border-radius: 24px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    button.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
      filter: brightness(110%);
    }
    
    button.secondary {
      background-color: transparent;
      color: var(--primary-color);
      font-size: 1.1rem;
      padding: 12px 24px;
      border-radius: 24px;
      font-weight: 500;
      cursor: pointer;
      border: 2px solid var(--primary-color);
      transition: all 0.2s ease;
    }
    
    button.secondary:hover {
      transform: translateY(-2px);
      background-color: rgba(31, 148, 255, 0.1);
    }
    
    .features {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
      margin: 60px 0;
    }
    
    .feature-card {
      background-color: var(--card-background);
      border-radius: 16px;
      padding: 24px;
      width: 300px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-card .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .feature-card h3 {
      margin-bottom: 12px;
      font-size: 1.4rem;
      color: var(--primary-color);
    }
    
    .feature-card p {
      color: var(--secondary-text);
      line-height: 1.6;
    }
    
    .info-section {
      background-color: var(--section-background);
      border-radius: 16px;
      padding: 32px;
      margin: 40px 0;
    }
    
    .info-section h2 {
      margin-bottom: 24px;
      font-size: 1.8rem;
      color: var(--text-color);
    }
    
    .info-section h3 {
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.4rem;
      color: var(--primary-color);
    }
    
    .info-section ol {
      padding-left: 24px;
    }
    
    .info-section li {
      margin-bottom: 12px;
      line-height: 1.6;
      color: var(--secondary-text);
    }
  `]
})
export class LandingComponent {
  constructor(private router: Router) {}
}
