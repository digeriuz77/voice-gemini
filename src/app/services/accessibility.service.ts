import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'x-large';
  fontFamily: 'default' | 'dyslexic';
  highContrast: boolean;
  reducedMotion: boolean;
  autoAudio: boolean;
  colorTheme: 'default' | 'dark' | 'pastel';
  lineSpacing: 'normal' | 'increased';
}

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private defaultSettings: AccessibilitySettings = {
    fontSize: 'normal',
    fontFamily: 'default',
    highContrast: false,
    reducedMotion: false,
    autoAudio: false,
    colorTheme: 'default',
    lineSpacing: 'normal'
  };
  
  private settingsSubject = new BehaviorSubject<AccessibilitySettings>(this.defaultSettings);
  settings$ = this.settingsSubject.asObservable();
  
  constructor() {
    // Load saved settings if available
    this.loadSavedSettings();
    
    // Apply settings to document
    this.applySettings();
  }
  
  private loadSavedSettings() {
    try {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        this.settingsSubject.next({
          ...this.defaultSettings,
          ...parsedSettings
        });
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  }
  
  private saveSettings() {
    try {
      localStorage.setItem('accessibility-settings', 
        JSON.stringify(this.settingsSubject.value));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }
  
  getSettings(): AccessibilitySettings {
    return this.settingsSubject.value;
  }
  
  updateSettings(newSettings: Partial<AccessibilitySettings>) {
    this.settingsSubject.next({
      ...this.settingsSubject.value,
      ...newSettings
    });
    
    // Save settings
    this.saveSettings();
    
    // Apply to document
    this.applySettings();
  }
  
  resetSettings() {
    this.settingsSubject.next(this.defaultSettings);
    this.saveSettings();
    this.applySettings();
  }
  
  private applySettings() {
    const settings = this.settingsSubject.value;
    
    // Apply font size
    document.documentElement.style.setProperty(
      '--font-size-base', 
      settings.fontSize === 'normal' ? '16px' : 
      settings.fontSize === 'large' ? '18px' : '20px'
    );
    
    // Apply font family
    document.documentElement.style.setProperty(
      '--font-family',
      settings.fontFamily === 'default' ? 
        "'Google Sans', sans-serif" : 
        "'OpenDyslexic', sans-serif"
    );
    
    // Apply line spacing
    document.documentElement.style.setProperty(
      '--line-height',
      settings.lineSpacing === 'normal' ? '1.5' : '2'
    );
    
    // Apply color theme
    if (settings.colorTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('pastel-theme');
    } else if (settings.colorTheme === 'pastel') {
      document.body.classList.add('pastel-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.remove('dark-theme', 'pastel-theme');
    }
    
    // Apply high contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }
  
  // Helper methods for components
  getTextClass(): string {
    const settings = this.settingsSubject.value;
    return `text-${settings.fontSize} font-${settings.fontFamily} spacing-${settings.lineSpacing}`;
  }
  
  shouldAutoPlayAudio(): boolean {
    return this.settingsSubject.value.autoAudio;
  }
  
  // Text-to-speech functionality
  speak(text: string): void {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower than default
      
      window.speechSynthesis.speak(utterance);
    }
  }
  
  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
  
  // Apply age-appropriate settings
  applyAgeGroupSettings(ageGroup: 'early' | 'middle' | 'teen') {
    if (ageGroup === 'early') {
      // For youngest users
      this.updateSettings({
        fontSize: 'large',
        autoAudio: true,
        reducedMotion: true,
        lineSpacing: 'increased'
      });
    } else if (ageGroup === 'middle') {
      // For middle group
      this.updateSettings({
        fontSize: 'normal',
        autoAudio: true,
        reducedMotion: false,
        lineSpacing: 'normal'
      });
    } else {
      // For teen group
      this.updateSettings({
        fontSize: 'normal',
        autoAudio: false,
        reducedMotion: false,
        lineSpacing: 'normal'
      });
    }
  }
}
