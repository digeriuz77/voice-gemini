import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GuideChatbotService } from '../../services/guide-chatbot.service';
import { ScreeningCoordinatorService } from '../../services/screening-coordinator.service';
import { UserService } from '../../services/user.service';
import { AssessmentService } from '../../services/assessment.service';

interface LetterItem {
  letter: string;
  isReversed: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-letter-reversal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activity-container">
      <header class="activity-header">
        <h1>Letter Recognition</h1>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="30"></div>
          </div>
          <div class="progress-text">Step 4 of 11</div>
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

        <div class="activity-area" *ngIf="!showGuide && !isComplete">
          <div class="instructions">
            <p>Tap on all the letters that are reversed or flipped.</p>
            <div class="target-letter">
              <span>Target Letter: </span>
              <span class="letter">{{ targetLetter }}</span>
            </div>
          </div>

          <div class="letter-grid">
            <div
              *ngFor="let item of letterItems; let i = index"
              class="letter-item"
              [class.reversed]="item.isReversed"
              [class.selected]="item.isSelected"
              (click)="selectLetter(i)">
              {{ item.letter }}
            </div>
          </div>

          <div class="activity-controls">
            <div class="timer">
              <span>Time: {{ timeRemaining }}s</span>
            </div>

            <button
              class="submit-button"
              [disabled]="!hasSelection"
              (click)="submitAnswers()">
              Submit Answers
            </button>
          </div>
        </div>

        <div class="results-area" *ngIf="isComplete">
          <div class="results-summary">
            <h2>Activity Complete!</h2>
            <div class="score-display">
              <div class="score">{{ score }} / {{ totalItems }}</div>
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

    .target-letter {
      font-size: 1.5rem;
      margin-top: 10px;
    }

    .target-letter .letter {
      font-weight: bold;
      font-size: 2rem;
      color: #1f94ff;
    }

    .letter-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .letter-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 80px;
      background-color: #f5f5f5;
      border-radius: 8px;
      font-size: 2.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .letter-item:hover {
      background-color: #e6e6e6;
    }

    .letter-item.reversed {
      transform: scaleX(-1);
    }

    .letter-item.selected {
      background-color: #d4edff;
      border: 2px solid #1f94ff;
    }

    .activity-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }

    .timer {
      font-size: 1.1rem;
      color: #666;
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
      .letter-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `]
})
export class LetterReversalComponent implements OnInit {
  showGuide: boolean = true;
  isComplete: boolean = false;
  guideMessage: string = ''; // Keep this to display the message
  guideCharacterImage: string = 'assets/images/guide-default.svg';

  targetLetter: string = 'b';
  letterItems: LetterItem[] = [];
  timeRemaining: number = 60;
  timerInterval: any;

  score: number = 0;
  totalItems: number = 0;
  percentageCorrect: number = 0;
  feedbackMessage: string = ''; // Keep this to display feedback

  get hasSelection(): boolean {
    return this.letterItems.some(item => item.isSelected);
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

    // Generate letter items
    this.generateLetterItems();
  }

  // Updated to handle void return type
  async setGuideMessage(ageGroup: 'early' | 'middle' | 'teen'): Promise<void> {
    // Set a default/loading message
    this.guideMessage = "Loading instructions...";
    this.cdr.detectChanges();

    try {
      // Call the service method (which now handles speaking internally)
      await this.guideChatbotService.explainActivity('letterReversal');
      // Set the message text locally *after* the service call (if needed for display)
      // We need to get the text from the service or hardcode it here again
      // Let's hardcode for now to ensure display works
      if (ageGroup === 'early') {
        this.guideMessage = "Now we're going to play a letter detective game! Some letters like to play tricks and turn around. Your job is to find all the letter b's hiding in the group. Tap on each b you find!";
      } else if (ageGroup === 'middle') {
        this.guideMessage = "In this activity, you'll be a letter detective! Your job is to find specific letters in a group and identify any that appear backwards or flipped. This helps us understand how you see and process letters.";
      } else {
        this.guideMessage = "In this activity, you'll be identifying specific letters and looking for any that appear reversed. This helps us understand visual processing of letters and symbols, which is an important part of reading.";
      }
    } catch (error) {
      console.error('Error getting activity explanation:', error);
      // Fallback messages if the chatbot fails
      if (ageGroup === 'early') {
        this.guideMessage = "Now we're going to play a letter detective game! Some letters like to play tricks and turn around. Your job is to find all the letter b's hiding in the group. Tap on each b you find!";
      } else if (ageGroup === 'middle') {
        this.guideMessage = "In this activity, you'll be a letter detective! Your job is to find specific letters in a group and identify any that appear backwards or flipped. This helps us understand how you see and process letters.";
      } else {
        this.guideMessage = "In this activity, you'll be identifying specific letters and looking for any that appear reversed. This helps us understand visual processing of letters and symbols, which is an important part of reading.";
      }
    } finally {
        this.cdr.detectChanges(); // Ensure UI updates
    }
  }


  generateLetterItems(): void {
    // Clear existing items
    this.letterItems = [];

    // Generate 20 letter items
    const letters = ['b', 'd', 'p', 'q'];
    const totalItems = 20;

    // Ensure at least 5 reversed letters
    const minReversed = 5;
    const maxReversed = 8;
    const reversedCount = Math.floor(Math.random() * (maxReversed - minReversed + 1)) + minReversed;

    // Create array of indices for reversed letters
    const reversedIndices = new Set<number>();
    while (reversedIndices.size < reversedCount) {
      const index = Math.floor(Math.random() * totalItems);
      reversedIndices.add(index);
    }

    // Generate letter items
    for (let i = 0; i < totalItems; i++) {
      const letterIndex = Math.floor(Math.random() * letters.length);
      const letter = letters[letterIndex];
      const isReversed = reversedIndices.has(i);

      this.letterItems.push({
        letter,
        isReversed,
        isSelected: false
      });
    }

    // Set total items for scoring
    this.totalItems = reversedCount;
  }

  startActivity(): void {
    this.showGuide = false;
    this.startTimer();
  }

  startTimer(): void {
    this.timeRemaining = 60;
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.submitAnswers();
      }
    }, 1000);
  }

  selectLetter(index: number): void {
    if (this.isComplete) return;

    this.letterItems[index].isSelected = !this.letterItems[index].isSelected;
  }

  // Updated to handle void return type
  async submitAnswers(): Promise<void> {
    // Stop timer
    clearInterval(this.timerInterval);

    // Calculate score
    let correctSelections = 0;
    let incorrectSelections = 0;

    this.letterItems.forEach(item => {
      if (item.isReversed && item.isSelected) {
        correctSelections++;
      } else if (!item.isReversed && item.isSelected) {
        incorrectSelections++;
      }
    });

    this.score = correctSelections;
    this.percentageCorrect = this.totalItems > 0 ? Math.round((correctSelections / this.totalItems) * 100) : 0; // Avoid division by zero

    // Set feedback message based on performance
    let performance: 'good' | 'average' | 'struggling' = 'average';
    const ageGroup = this.userService.getUserAgeGroup(); // Get age group for fallback messages

    if (this.percentageCorrect >= 80) {
      performance = 'good';
      this.feedbackMessage = 'Great job! You have a good eye for spotting reversed letters.';
    } else if (this.percentageCorrect >= 50) {
      performance = 'average';
      this.feedbackMessage = 'Good effort! Spotting reversed letters can be tricky sometimes.';
    } else {
      performance = 'struggling';
      this.feedbackMessage = 'Thank you for trying! Identifying reversed letters can be challenging.';
    }

    // Get feedback from guide chatbot (now returns void)
    try {
        await this.guideChatbotService.provideFeedback('letterReversal', performance);
        // Set the feedback message locally *after* the service call (if needed for display)
        // Let's hardcode for now to ensure display works
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
    this.assessmentService.saveResult('letterReversal', {
      score: this.score,
      totalItems: this.totalItems,
      percentageCorrect: this.percentageCorrect,
      timeRemaining: this.timeRemaining,
      performance
    });

    // Mark as complete
    this.isComplete = true;
  }


  goBack(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.router.navigate(['/screening/questionnaire']);
  }

  goToNextStep(): void {
    this.screeningCoordinator.completeStep('letterReversal', {
      score: this.score,
      totalItems: this.totalItems,
      percentageCorrect: this.percentageCorrect
    });

    this.screeningCoordinator.nextStep();
  }
}
