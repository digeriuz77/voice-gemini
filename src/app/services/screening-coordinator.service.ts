import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AssessmentService } from './assessment.service';
import { UserService } from './user.service';

export interface ScreeningStep {
  id: string;
  name: string;
  route: string;
  optional: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ScreeningCoordinatorService {
  private steps: ScreeningStep[] = [
    { id: 'welcome', name: 'Welcome', route: '/screening', optional: false },
    { id: 'introduction', name: 'Introduction', route: '/screening/introduction', optional: false },
    { id: 'questionnaire', name: 'Questionnaire', route: '/screening/questionnaire', optional: false },
    { id: 'letterReversal', name: 'Letter Recognition', route: '/screening/letter-reversal', optional: false },
    { id: 'patternMatching', name: 'Pattern Matching', route: '/screening/pattern-matching', optional: false },
    { id: 'results', name: 'Results', route: '/screening/results', optional: false }
  ];
  
  private currentStepIndexSubject = new BehaviorSubject<number>(0);
  currentStepIndex$ = this.currentStepIndexSubject.asObservable();
  
  private showTransitionSubject = new BehaviorSubject<boolean>(false);
  showTransition$ = this.showTransitionSubject.asObservable();
  
  private transitionMessageSubject = new BehaviorSubject<string>('');
  transitionMessage$ = this.transitionMessageSubject.asObservable();
  
  constructor(
    private router: Router,
    private assessmentService: AssessmentService,
    private userService: UserService
  ) {
    // Try to load saved progress
    this.loadSavedProgress();
  }
  
  private loadSavedProgress() {
    try {
      const savedProgress = localStorage.getItem('screening-progress');
      if (savedProgress) {
        const index = parseInt(savedProgress, 10);
        if (!isNaN(index) && index >= 0 && index < this.steps.length) {
          this.currentStepIndexSubject.next(index);
        }
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  }
  
  private saveProgress() {
    try {
      localStorage.setItem('screening-progress', 
        this.currentStepIndexSubject.value.toString());
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }
  
  getAllSteps(): ScreeningStep[] {
    return [...this.steps];
  }
  
  getCurrentStep(): ScreeningStep {
    return this.steps[this.currentStepIndexSubject.value];
  }
  
  getCurrentStepIndex(): number {
    return this.currentStepIndexSubject.value;
  }
  
  getStepById(stepId: string): ScreeningStep | undefined {
    return this.steps.find(step => step.id === stepId);
  }
  
  getStepIndexById(stepId: string): number {
    return this.steps.findIndex(step => step.id === stepId);
  }
  
  navigateToStep(stepId: string) {
    const index = this.getStepIndexById(stepId);
    if (index !== -1) {
      this.currentStepIndexSubject.next(index);
      this.saveProgress();
      this.router.navigate([this.steps[index].route]);
    }
  }
  
  navigateToCurrentStep() {
    const currentStep = this.getCurrentStep();
    console.log('Navigating to current step:', currentStep);
    this.router.navigate([currentStep.route]);
  }
  
  nextStep() {
    const currentIndex = this.currentStepIndexSubject.value;
    if (currentIndex < this.steps.length - 1) {
      this.currentStepIndexSubject.next(currentIndex + 1);
      this.saveProgress();
      this.navigateToCurrentStep();
    }
  }
  
  previousStep() {
    const currentIndex = this.currentStepIndexSubject.value;
    if (currentIndex > 0) {
      this.currentStepIndexSubject.next(currentIndex - 1);
      this.saveProgress();
      this.navigateToCurrentStep();
    }
  }
  
  skipCurrentStep() {
    // Only allow skipping optional steps
    const currentStep = this.getCurrentStep();
    if (currentStep.optional) {
      this.nextStep();
    }
  }
  
  resetProgress() {
    this.currentStepIndexSubject.next(0);
    localStorage.removeItem('screening-progress');
  }
  
  startScreening() {
    console.log('startScreening method called');
    // Reset progress and navigate to first step
    console.log('Resetting progress');
    this.resetProgress();
    console.log('Progress reset, current step index:', this.currentStepIndexSubject.value);
    console.log('Navigating to current step');
    this.navigateToCurrentStep();
    console.log('Navigation completed');
  }
  
  completeStep(stepId: string, result?: any) {
    // If result is provided, save it
    if (result && stepId !== 'welcome' && stepId !== 'introduction' && stepId !== 'results') {
      this.assessmentService.saveResult(stepId, result);
    }
    
    // Check if this is the current step
    const currentStep = this.getCurrentStep();
    if (currentStep.id === stepId) {
      // Move to next step
      this.nextStep();
    }
  }
  
  showTransition(message: string) {
    this.transitionMessageSubject.next(message);
    this.showTransitionSubject.next(true);
  }
  
  hideTransition() {
    this.showTransitionSubject.next(false);
  }
  
  canGoBack(): boolean {
    return this.currentStepIndexSubject.value > 1; // Can't go back from welcome or first step
  }
  
  canSkip(): boolean {
    const currentStep = this.getCurrentStep();
    return currentStep.optional;
  }
  
  isScreeningComplete(): boolean {
    // Check if all required assessments are completed
    return this.steps
      .filter(step => !step.optional && step.id !== 'welcome' && step.id !== 'introduction' && step.id !== 'results')
      .every(step => this.assessmentService.hasCompletedAssessment(step.id));
  }
  
  getCompletionPercentage(): number {
    return this.assessmentService.calculateCompletionPercentage();
  }
}
