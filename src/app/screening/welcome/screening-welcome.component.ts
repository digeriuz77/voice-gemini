import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ScreeningCoordinatorService } from '../../services/screening-coordinator.service';
import { AccessibilityService, AccessibilitySettings } from '../../services/accessibility.service';

@Component({
  selector: 'app-screening-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="welcome-container">
      <header class="welcome-header">
        <h1>Dyslexia Screening Tool</h1>
        <p class="subtitle">A friendly tool to help identify potential dyslexic traits and provide support strategies</p>
      </header>
      
      <main class="welcome-content">
        <section class="welcome-intro">
          <h2>Welcome to the Dyslexia Screening Tool</h2>
          <p>
            This tool helps identify potential signs of dyslexia through a series of interactive activities.
            The screening takes about 15-20 minutes to complete and includes questions and engaging tasks.
          </p>
          <p>
            <strong>Important:</strong> This is a screening tool, not a diagnostic test. Results should be reviewed by qualified professionals.
          </p>
        </section>
        
        <section class="age-selection">
          <h3>Please select your age group:</h3>
          <div class="age-options">
            <button 
              (click)="selectAgeGroup('early')" 
              class="age-button"
              [class.selected]="selectedAgeGroup === 'early'">
              <div class="age-icon">👦</div>
              <span>Ages 5-10</span>
            </button>
            
            <button 
              (click)="selectAgeGroup('teen')" 
              class="age-button"
              [class.selected]="selectedAgeGroup === 'teen'">
              <div class="age-icon">👨</div>
              <span>Ages 11-16</span>
            </button>
          </div>
        </section>
        
        <section class="parent-toggle">
          <label class="parent-label">
            <input 
              type="checkbox" 
              [(ngModel)]="parentAssisted"
              class="parent-checkbox">
            <span>Parent/Teacher assisted screening</span>
          </label>
          <p class="helper-text" *ngIf="selectedAgeGroup === 'early'">
            <strong>Recommended:</strong> Young children (ages 5-7) should have a parent or teacher assist with the screening.
          </p>
        </section>
        
        <section class="accessibility-options">
          <h3>Accessibility Options</h3>
          <div class="option-grid">
            <div class="option-item">
              <label>
                <span>Font Size</span>
                <select [(ngModel)]="accessibilitySettings.fontSize" (change)="updateAccessibilitySettings()">
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="x-large">Extra Large</option>
                </select>
              </label>
            </div>
            
            <div class="option-item">
              <label>
                <span>Font</span>
                <select [(ngModel)]="accessibilitySettings.fontFamily" (change)="updateAccessibilitySettings()">
                  <option value="default">Default</option>
                  <option value="dyslexic">OpenDyslexic</option>
                </select>
              </label>
            </div>
            
            <div class="option-item">
              <label>
                <span>Color Theme</span>
                <select [(ngModel)]="accessibilitySettings.colorTheme" (change)="updateAccessibilitySettings()">
                  <option value="default">Default</option>
                  <option value="dark">Dark Mode</option>
                  <option value="pastel">Pastel (Cream Background)</option>
                </select>
              </label>
            </div>
            
            <div class="option-item checkbox-option">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="accessibilitySettings.autoAudio"
                  (change)="updateAccessibilitySettings()">
                <span>Automatic Text-to-Speech</span>
              </label>
            </div>
            
            <div class="option-item checkbox-option">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="accessibilitySettings.highContrast"
                  (change)="updateAccessibilitySettings()">
                <span>High Contrast</span>
              </label>
            </div>
            
            <div class="option-item checkbox-option">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="accessibilitySettings.reducedMotion"
                  (change)="updateAccessibilitySettings()">
                <span>Reduced Motion</span>
              </label>
            </div>
          </div>
        </section>
        
        <section class="actions">
          <button 
            class="start-button" 
            [disabled]="!selectedAgeGroup"
            (click)="startScreening()">
            Start Screening
          </button>
        </section>
      </main>
      
      <footer class="welcome-footer">
        <p>
          This screening tool is designed to help identify potential dyslexic traits and provide support strategies.
          It is not a diagnostic tool and should not replace professional assessment.
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .welcome-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: var(--font-family, 'Google Sans', sans-serif);
      color: var(--text-color);
    }
    
    .welcome-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .welcome-header h1 {
      color: var(--primary-color);
      margin-bottom: 10px;
    }
    
    .subtitle {
      color: var(--secondary-text);
      font-size: 1.1rem;
    }
    
    .welcome-content {
      background-color: var(--card-background);
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 30px;
      margin-bottom: 20px;
    }
    
    .welcome-intro {
      margin-bottom: 30px;
    }
    
    .age-selection {
      margin-bottom: 30px;
    }
    
    .age-options {
      display: flex;
      gap: 20px;
      margin-top: 15px;
    }
    
    .age-button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-radius: 12px;
      background-color: var(--input-background);
      border: 2px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .age-button:hover {
      border-color: var(--primary-color);
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .age-button.selected {
      border-color: var(--primary-color);
      background-color: rgba(31, 148, 255, 0.1);
    }
    
    .age-icon {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .parent-toggle {
      margin-bottom: 30px;
    }
    
    .parent-label {
      display: flex;
      align-items: center;
      font-weight: 500;
      cursor: pointer;
    }
    
    .parent-checkbox {
      margin-right: 10px;
      width: 18px;
      height: 18px;
    }
    
    .helper-text {
      margin-top: 10px;
      color: var(--secondary-text);
      font-size: 0.9rem;
    }
    
    .accessibility-options {
      margin-bottom: 30px;
      padding: 20px;
      background-color: var(--section-background);
      border-radius: 8px;
    }
    
    .option-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .option-item {
      display: flex;
      flex-direction: column;
    }
    
    .option-item label {
      display: flex;
      flex-direction: column;
    }
    
    .option-item select {
      margin-top: 5px;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background-color: var(--input-background);
      color: var(--text-color);
    }
    
    .checkbox-option label {
      flex-direction: row;
      align-items: center;
      cursor: pointer;
    }
    
    .checkbox-option input {
      margin-right: 10px;
    }
    
    .actions {
      display: flex;
      justify-content: center;
      margin-top: 30px;
    }
    
    .start-button {
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 12px 30px;
      font-size: 1.1rem;
      font-weight: 500;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .start-button:hover:not(:disabled) {
      filter: brightness(110%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .start-button:disabled {
      background-color: var(--border-color);
      cursor: not-allowed;
    }
    
    .welcome-footer {
      text-align: center;
      color: var(--secondary-text);
      font-size: 0.9rem;
    }
  `]
})
export class ScreeningWelcomeComponent implements OnInit {
  selectedAgeGroup: 'early' | 'middle' | 'teen' | null = null;
  parentAssisted: boolean = false;
  
  accessibilitySettings: AccessibilitySettings = {
    fontSize: 'normal',
    fontFamily: 'default',
    highContrast: false,
    reducedMotion: false,
    autoAudio: false,
    colorTheme: 'default',
    lineSpacing: 'normal'
  };
  
  constructor(
    private router: Router,
    private userService: UserService,
    private screeningCoordinator: ScreeningCoordinatorService,
    private accessibilityService: AccessibilityService
  ) {}
  
  ngOnInit(): void {
    // Load current accessibility settings
    this.accessibilitySettings = this.accessibilityService.getSettings();
    
    // Check if user has already selected an age group
    const userInfo = this.userService.getUserInfo();
    if (userInfo.ageGroup) {
      this.selectedAgeGroup = userInfo.ageGroup;
      this.parentAssisted = userInfo.parentAssisted;
    }
  }
  
  selectAgeGroup(group: 'early' | 'teen'): void {
    this.selectedAgeGroup = group;
    
    // For young children, recommend parent assistance
    if (group === 'early') {
      this.parentAssisted = true;
    }
  }
  
  updateAccessibilitySettings(): void {
    this.accessibilityService.updateSettings(this.accessibilitySettings);
  }
  
  startScreening(): void {
    console.log('startScreening called');
    if (!this.selectedAgeGroup) {
      console.log('No age group selected');
      return;
    }
    
    console.log('Selected age group:', this.selectedAgeGroup);
    
    // Save user preferences
    this.userService.setUserInfo({
      ageGroup: this.selectedAgeGroup,
      parentAssisted: this.parentAssisted
    });
    console.log('User info saved');
    
    // Apply age-appropriate accessibility settings
    this.accessibilityService.applyAgeGroupSettings(this.selectedAgeGroup);
    console.log('Accessibility settings applied');
    
    // Reset screening progress
    console.log('Resetting screening progress');
    this.screeningCoordinator.resetProgress();
    
    // Navigate directly to the introduction page
    console.log('Navigating to introduction page');
    this.router.navigate(['/screening/introduction']);
    console.log('Navigation completed');
  }
}
