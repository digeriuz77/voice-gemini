import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private assessmentResults: { [key: string]: any } = {};
  private resultsSubject = new BehaviorSubject<{ [key: string]: any }>({});
  
  results$ = this.resultsSubject.asObservable();
  
  private assessmentStartTime: number = 0;
  private currentAssessmentId: string = '';
  
  constructor() {
    // Try to load saved results
    this.loadSavedResults();
  }
  
  private loadSavedResults() {
    try {
      const savedResults = localStorage.getItem('dyslexia-screening-results');
      if (savedResults) {
        this.assessmentResults = JSON.parse(savedResults);
        this.resultsSubject.next(this.assessmentResults);
      }
    } catch (error) {
      console.error('Error loading saved assessment results:', error);
    }
  }
  
  private saveResults() {
    try {
      localStorage.setItem('dyslexia-screening-results', 
        JSON.stringify(this.assessmentResults));
    } catch (error) {
      console.error('Error saving assessment results:', error);
    }
  }
  
  startAssessment(assessmentId: string) {
    this.currentAssessmentId = assessmentId;
    this.assessmentStartTime = Date.now();
  }
  
  getElapsedTime(): number {
    return Date.now() - this.assessmentStartTime;
  }
  
  saveResult(assessmentId: string, result: any) {
    this.assessmentResults[assessmentId] = {
      ...result,
      timestamp: new Date().toISOString()
    };
    
    this.resultsSubject.next({...this.assessmentResults});
    this.saveResults();
  }
  
  getResult(assessmentId: string): any {
    return this.assessmentResults[assessmentId];
  }
  
  getAllResults(): { [key: string]: any } {
    return {...this.assessmentResults};
  }
  
  hasCompletedAssessment(assessmentId: string): boolean {
    return !!this.assessmentResults[assessmentId];
  }
  
  resetResult(assessmentId: string) {
    if (this.assessmentResults[assessmentId]) {
      delete this.assessmentResults[assessmentId];
      this.resultsSubject.next({...this.assessmentResults});
      this.saveResults();
    }
  }
  
  resetAllResults() {
    this.assessmentResults = {};
    this.resultsSubject.next({});
    localStorage.removeItem('dyslexia-screening-results');
  }
  
  calculateCompletionPercentage(): number {
    // Define all required assessments
    const requiredAssessments = [
      'questionnaire',
      'letterReversal',
      'patternMatching',
      'visualMemory',
      'rhymeDetection',
      'directionalConcepts',
      'wordRecognition',
      'auditoryMemory'
    ];
    
    // Count completed assessments
    const completedCount = requiredAssessments.filter(
      id => this.hasCompletedAssessment(id)
    ).length;
    
    return (completedCount / requiredAssessments.length) * 100;
  }
}
