import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GuideChatbotService } from '../../services/guide-chatbot.service';
import { ScreeningCoordinatorService } from '../../services/screening-coordinator.service';
import { UserService } from '../../services/user.service';
import { AssessmentService } from '../../services/assessment.service';

interface PatternOption {
  id: number;
  pattern: string[];
  isSelected: boolean;
  isCorrect: boolean;
}

@Component({
  selector: 'app-pattern-matching',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activity-container">
      <header class="activity-header">
        <h1>Pattern Matching</h1>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="40"></div>
          </div>
          <div class="progress-text">Step 5 of 11</div>
        </div>
      </header>

      <main class="activity-content">
        <div class="guide-container" *ngIf="showGuide">
          <div class="guide-character">
            <img [src]="guideCharacterImage" alt="Guide character">
          </div>

          <div class="guide-message">
            <p>{{ guideMessage }}</p>
            <button class="start-button" (click)="startActivity()">Start Activity</button>
          </div>
        </div>

        <div class="activity-area" *ngIf="!showGuide && !isComplete && currentPatternSet">
          <div class="instructions">
            <p>Look at the pattern at the top. Find the matching pattern from the options below.</p>
          </div>

          <div class="pattern-container">
            <div class="target-pattern">
              <div class="pattern-grid">
                <div
                  *ngFor="let cell of currentPatternSet.targetPattern"
                  class="pattern-cell"
                  [class.filled]="cell === '1'">
                </div>
              </div>
            </div>

            <div class="pattern-options">
              <div
                *ngFor="let option of currentPatternSet.options"
                class="pattern-option"
                [class.selected]="option.isSelected"
                (click)="selectOption(option.id)">
                <div class="pattern-grid">
                  <div
                    *ngFor="let cell of option.pattern"
                    class="pattern-cell"
                    [class.filled]="cell === '1'">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="activity-controls">
            <div class="progress-text">
              <span>Pattern {{ currentPatternIndex + 1 }} of {{ totalPatterns }}</span>
            </div>

            <button
              class="submit-button"
              [disabled]="!hasSelection"
              (click)="submitAnswer()">
              Submit Answer
            </button>
          </div>
        </div>

        <div class="results-area" *ngIf="isComplete">
          <div class="results-summary">
            <h2>Activity Complete!</h2>
            <div class="score-display">
              <div class="score">{{ score }} / {{ totalPatterns }}</div>
              <div class="percentage">{{ percentageCorrect }}%</div>
            </div>
            <p>{{ feedbackMessage }}</p>
          </div>
        </div>

        <div class="actions">
          <button
            class="back-button"
            (click)="goBack()">
            Back
          </button>

          <button
            class="next-button"
            [disabled]="!isComplete"
            (click)="goToNextStep()">
            Continue
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .activity-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: var(--font-family, 'Google Sans', sans-serif);
    }

    .activity-header {
      margin-bottom: 20px;
    }

    .activity-header h1 {
      color: #1f94ff;
      margin-bottom: 10px;
    }

    .progress-indicator {
      margin-top: 10px;
    }

    .progress-bar {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background-color: #1f94ff;
    }

    .progress-text {
      margin-top: 5px;
      font-size: 0.9rem;
      color: #666;
      text-align: right;
    }

    .activity-content {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }

    .guide-container {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f5f9ff;
      border-radius: 12px;
    }

    .guide-character {
      flex: 0 0 80px;
      margin-right: 20px;
    }

    .guide-character img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }

    .guide-message {
      flex: 1;
    }

    .guide-message p {
      margin-bottom: 15px;
    }

    .start-button {
      background-color: #1f94ff;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .start-button:hover {
      background-color: #0d84e8;
    }

    .activity-area {
      margin-bottom: 30px;
    }

    .instructions {
      margin-bottom: 20px;
      text-align: center;
    }

    .pattern-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
    }

    .target-pattern {
      padding: 20px;
      background-color: #f5f9ff;
      border-radius: 12px;
      border: 2px solid #1f94ff;
    }

    .pattern-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .pattern-option {
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pattern-option:hover {
      background-color: #e6e6e6;
    }

    .pattern-option.selected {
      background-color: #d4edff;
      border-color: #1f94ff;
    }

    .pattern-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 5px;
    }

    .pattern-cell {
      width: 20px;
      height: 20px;
      background-color: white;
      border: 1px solid #ccc;
    }

    .pattern-cell.filled {
      background-color: #333;
      border-color: #333;
    }

    .activity-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
    }

    .submit-button {
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .submit-button:hover:not(:disabled) {
      background-color: #3d8b40;
    }

    .submit-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .results-area {
      margin-bottom: 30px;
      text-align: center;
    }

    .results-summary {
      padding: 20px;
      background-color: #f5f9ff;
      border-radius: 12px;
    }

    .score-display {
      margin: 20px 0;
    }

    .score {
      font-size: 2rem;
      font-weight: bold;
      color: #1f94ff;
    }

    .percentage {
      font-size: 1.5rem;
      color: #666;
      margin-top: 5px;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    .back-button, .next-button {
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .back-button {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ccc;
    }

    .next-button {
      background-color: #1f94ff;
      color: white;
      border: none;
    }

    .back-button:hover {
      background-color: #e6e6e6;
    }

    .next-button:hover:not(:disabled) {
      background-color: #0d84e8;
    }

    .next-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .pattern-options {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PatternMatchingComponent implements OnInit {
  showGuide: boolean = true;
  isComplete: boolean = false;
  guideMessage: string = ''; // Keep this to display the message
  guideCharacterImage: string = 'assets/images/guide-default.svg';

  patternSets: {
    targetPattern: string[];
    options: PatternOption[];
  }[] = [];

  currentPatternIndex: number = 0;
  currentPatternSet: {
    targetPattern: string[];
    options: PatternOption[];
  } | null = null;

  totalPatterns: number = 8;
  score: number = 0;
  percentageCorrect: number = 0;
  feedbackMessage: string = ''; // Keep this to display feedback

  get hasSelection(): boolean {
    return this.currentPatternSet?.options.some(option => option.isSelected) || false;
  }

  constructor(
    private router: Router,
    private guideChatbotService: GuideChatbotService,
    private screeningCoordinator: ScreeningCoordinatorService,
    private userService: UserService,
    private assessmentService: AssessmentService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Set guide character based on age group
    const ageGroup = this.userService.getUserAgeGroup();
    this.guideCharacterImage = ageGroup === 'early'
      ? 'assets/images/guide-child.svg'
      : 'assets/images/guide-teen.svg';

    // Set guide message based on age group
    this.setGuideMessage(ageGroup);

    // Generate pattern sets
    this.generatePatternSets();
  }

  // Updated to handle void return type
  async setGuideMessage(ageGroup: 'early' | 'middle' | 'teen'): Promise<void> {
    // Set a default/loading message
    this.guideMessage = "Loading instructions...";
    this.cdr.detectChanges();

    try {
      // Call the service method (which now handles speaking internally)
      await this.guideChatbotService.explainActivity('patternMatching');
      // Set the message text locally *after* the service call (if needed for display)
      // Hardcoding for now to ensure display works
      if (ageGroup === 'early') {
        this.guideMessage = "Let's play a matching game! Look at the pattern on top, then find the one below that matches it exactly. It's like a puzzle where you need to find the perfect match!";
      } else if (ageGroup === 'middle') {
        this.guideMessage = "This activity is all about finding patterns. You'll see a pattern at the top, and your job is to find the matching pattern from the options below. This helps us understand how you process visual information.";
      } else {
        this.guideMessage = "This pattern matching activity tests visual discrimination - how well you can identify matching patterns and spot differences between similar items. This skill is important for efficient reading.";
      }
    } catch (error) {
      console.error('Error getting activity explanation:', error);
      // Fallback messages if the chatbot fails
      if (ageGroup === 'early') {
        this.guideMessage = "Let's play a matching game! Look at the pattern on top, then find the one below that matches it exactly. It's like a puzzle where you need to find the perfect match!";
      } else if (ageGroup === 'middle') {
        this.guideMessage = "This activity is all about finding patterns. You'll see a pattern at the top, and your job is to find the matching pattern from the options below. This helps us understand how you process visual information.";
      } else {
        this.guideMessage = "This pattern matching activity tests visual discrimination - how well you can identify matching patterns and spot differences between similar items. This skill is important for efficient reading.";
      }
    } finally {
        this.cdr.detectChanges(); // Ensure UI updates
    }
  }


  generatePatternSets(): void {
    // Clear existing pattern sets
    this.patternSets = [];

    // Generate 8 pattern sets
    for (let i = 0; i < this.totalPatterns; i++) {
      const targetPattern = this.generateRandomPattern();
      const options: PatternOption[] = [];

      // Generate 4 options (1 correct, 3 similar but incorrect)
      const correctOptionIndex = Math.floor(Math.random() * 4);

      for (let j = 0; j < 4; j++) {
        if (j === correctOptionIndex) {
          // Correct option
          options.push({
            id: j,
            pattern: [...targetPattern],
            isSelected: false,
            isCorrect: true
          });
        } else {
          // Similar but incorrect option
          options.push({
            id: j,
            pattern: this.generateSimilarPattern(targetPattern),
            isSelected: false,
            isCorrect: false
          });
        }
      }

      // Shuffle options
      for (let k = options.length - 1; k > 0; k--) {
          const l = Math.floor(Math.random() * (k + 1));
          [options[k], options[l]] = [options[l], options[k]];
      }


      this.patternSets.push({
        targetPattern,
        options
      });
    }

    // Set current pattern set
    this.currentPatternSet = this.patternSets[0];
  }

  generateRandomPattern(): string[] {
    // Generate a random 5x5 pattern
    const pattern: string[] = [];

    for (let i = 0; i < 25; i++) {
      pattern.push(Math.random() > 0.5 ? '1' : '0');
    }

    return pattern;
  }

  generateSimilarPattern(originalPattern: string[]): string[] {
    // Generate a pattern similar to the original but with 2-3 differences
    const pattern = [...originalPattern];
    const numDifferences = Math.floor(Math.random() * 2) + 2; // 2-3 differences

    for (let i = 0; i < numDifferences; i++) {
      const index = Math.floor(Math.random() * 25);
      pattern[index] = pattern[index] === '1' ? '0' : '1';
    }

    return pattern;
  }

  startActivity(): void {
    this.showGuide = false;
  }

  selectOption(optionId: number): void {
    if (!this.currentPatternSet || this.isComplete) return;

    // Deselect all options
    this.currentPatternSet.options.forEach(option => {
      option.isSelected = false;
    });

    // Select the clicked option
    const selectedOption = this.currentPatternSet.options.find(option => option.id === optionId);
    if (selectedOption) {
      selectedOption.isSelected = true;
    }
  }

  submitAnswer(): void {
    if (!this.currentPatternSet || !this.hasSelection) return;

    // Check if the selected option is correct
    const selectedOption = this.currentPatternSet.options.find(option => option.isSelected);
    if (selectedOption && selectedOption.isCorrect) {
      this.score++;
    }

    // Move to next pattern or finish
    this.currentPatternIndex++;

    if (this.currentPatternIndex < this.totalPatterns) {
      this.currentPatternSet = this.patternSets[this.currentPatternIndex];
    } else {
      this.finishActivity();
    }
  }

  // Updated to handle void return type
  async finishActivity(): Promise<void> {
    // Calculate percentage
    this.percentageCorrect = Math.round((this.score / this.totalPatterns) * 100);

    // Set feedback message based on performance
    let performance: 'good' | 'average' | 'struggling' = 'average';
    const ageGroup = this.userService.getUserAgeGroup(); // Get age group for fallback messages

    if (this.percentageCorrect >= 80) {
      performance = 'good';
      this.feedbackMessage = 'Great job! You have excellent pattern matching skills.';
    } else if (this.percentageCorrect >= 50) {
      performance = 'average';
      this.feedbackMessage = 'Good effort! Pattern matching can be challenging sometimes.';
    } else {
      performance = 'struggling';
      this.feedbackMessage = 'Thank you for trying! Visual pattern matching can be quite difficult.';
    }

    // Get feedback from guide chatbot (now returns void)
    try {
        await this.guideChatbotService.provideFeedback('patternMatching', performance);
        // Set the feedback message locally *after* the service call (if needed for display)
        // Hardcoding for now to ensure display works
        if (performance === 'good') {
          if (ageGroup === 'early') {
            this.feedbackMessage = "Wow! You did an amazing job! Your brain is working so well with these puzzles!";
          } else if (ageGroup === 'middle') {
            this.feedbackMessage = "Great work! You showed really good skills on that activity.";
          } else {
            this.feedbackMessage = "Excellent work. You demonstrated strong skills in that area.";
          }
        } else if (performance === 'average') {
          if (ageGroup === 'early') {
            this.feedbackMessage = "Good job finishing that activity! Some parts might have been tricky, and that's totally okay!";
          } else if (ageGroup === 'middle') {
            this.feedbackMessage = "Good effort on that activity. Some parts might have been challenging, which is completely normal.";
          } else {
            this.feedbackMessage = "Good work completing that section. Everyone finds different aspects challenging, which is perfectly normal.";
          }
        } else {
          if (ageGroup === 'early') {
            this.feedbackMessage = "Thank you for trying so hard! Some puzzles can be really tricky, and that's okay. Everyone's brain works differently!";
          } else if (ageGroup === 'middle') {
            this.feedbackMessage = "Thanks for working through that activity. Some of these tasks can be challenging, and that's completely normal. Everyone has different strengths.";
          } else {
            this.feedbackMessage = "Thanks for persevering through that activity. These tasks are designed to identify areas that might be challenging, so it's entirely normal to find some sections difficult.";
          }
        }
    } catch (error) {
      console.error('Error getting feedback:', error);
      // Fallback message is already set above
    } finally {
        this.cdr.detectChanges(); // Ensure UI updates
    }


    // Save results
    this.assessmentService.saveResult('patternMatching', {
      score: this.score,
      totalItems: this.totalPatterns,
      percentageCorrect: this.percentageCorrect,
      performance
    });

    // Mark as complete
    this.isComplete = true;
  }


  goBack(): void {
    this.router.navigate(['/screening/letter-reversal']);
  }

  goToNextStep(): void {
    this.screeningCoordinator.completeStep('patternMatching', {
      score: this.score,
      totalItems: this.totalPatterns,
      percentageCorrect: this.percentageCorrect
    });

    this.screeningCoordinator.nextStep();
  }
}
