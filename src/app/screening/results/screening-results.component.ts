import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultsAnalyzerService, AnalysisResult } from '../../services/results-analyzer.service';
import { GuideChatbotService } from '../../services/guide-chatbot.service';
import { UserService } from '../../services/user.service';
import { ScreeningCoordinatorService } from '../../services/screening-coordinator.service';

@Component({
  selector: 'app-screening-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-container">
      <header class="results-header">
        <h1>Screening Results</h1>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="100"></div>
          </div>
          <div class="progress-text">Step 11 of 11</div>
        </div>
      </header>

      <main class="results-content">
        <div class="loading-container" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Analyzing results...</p>
        </div>

        <div class="results-summary" *ngIf="!isLoading && analysisResult">
          <div class="guide-message">
            <div class="guide-character">
              <img [src]="guideCharacterImage" alt="Guide character">
            </div>
            <div class="message-bubble">
              <p>{{ guideSummary }}</p>
            </div>
          </div>

          <div class="risk-level-card">
            <h2>Screening Result</h2>
            <div class="risk-level" [ngClass]="getRiskLevelClass()">
              <div class="risk-indicator">
                <div class="risk-icon">
                  <span *ngIf="analysisResult?.preliminaryScore?.riskLevel === 'Low'">✓</span>
                  <span *ngIf="analysisResult?.preliminaryScore?.riskLevel === 'Moderate'">!</span>
                  <span *ngIf="analysisResult?.preliminaryScore?.riskLevel === 'High'">!!</span>
                </div>
                <div class="risk-label">{{ analysisResult.preliminaryScore.riskLevel || 'Unknown' }} Risk</div>
              </div>
              <p class="risk-description">{{ getRiskDescription() }}</p>
            </div>
          </div>

          <div class="skill-areas">
            <h2>Skill Areas</h2>
            <div class="skill-grid">
              <div *ngFor="let skill of analysisResult?.skillAreas" class="skill-card" [ngClass]="getSkillClass(skill?.status)">
                <h3>{{ skill?.name }}</h3>
                <div class="skill-meter">
                  <div class="skill-progress" [style.width.%]="skill?.score"></div>
                </div>
                <p class="skill-description">{{ skill?.description }}</p>
              </div>
            </div>
          </div>

          <div class="strengths-challenges">
            <div class="strengths">
              <h2>Strengths</h2>
              <ul>
                <li *ngFor="let strength of analysisResult?.strengths">{{ strength }}</li>
              </ul>
            </div>

            <div class="challenges">
              <h2>Areas for Support</h2>
              <ul>
                <li *ngFor="let challenge of analysisResult?.challenges">{{ challenge }}</li>
              </ul>
            </div>
          </div>

          <div class="recommendations">
            <h2>Recommendations</h2>

            <div class="recommendation-section">
              <h3>Next Steps</h3>
              <ul>
                <li *ngFor="let step of analysisResult?.recommendations?.nextSteps">{{ step }}</li>
              </ul>
            </div>

            <div class="recommendation-section">
              <h3>Helpful Accommodations</h3>
              <ul>
                <li *ngFor="let accommodation of analysisResult?.recommendations?.accommodations">{{ accommodation }}</li>
              </ul>
            </div>

            <div class="recommendation-section">
              <h3>Suggested Activities</h3>
              <ul>
                <li *ngFor="let activity of analysisResult?.recommendations?.activities">{{ activity }}</li>
              </ul>
            </div>
          </div>

          <div class="disclaimer">
            <h3>Important Note</h3>
            <p>
              This screening tool provides insights into learning patterns and potential areas for support.
              Remember that this is a screening tool, not a diagnosis. The results can help identify
              strategies that may support learning and reading development.
            </p>
            <p>
              If you have concerns about learning difficulties, we recommend consulting with educational
              professionals such as teachers, school psychologists, or learning specialists who can provide
              personalized guidance and support.
            </p>
          </div>
        </div>

        <div class="actions">
          <button
            class="back-button"
            (click)="goBack()">
            Back
          </button>

          <button
            class="download-button"
            [disabled]="isLoading"
            (click)="downloadReport()">
            Download PDF Report
          </button>

          <button
            class="finish-button"
            [disabled]="isLoading"
            (click)="finishScreening()">
            Finish Screening
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .results-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: var(--font-family, 'Google Sans', sans-serif);
    }

    .results-header {
      margin-bottom: 20px;
    }

    .results-header h1 {
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

    .results-content {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #1f94ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .guide-message {
      display: flex;
      align-items: flex-start;
      margin-bottom: 30px;
      background-color: #f5f9ff;
      border-radius: 12px;
      padding: 15px;
    }

    .guide-character {
      flex: 0 0 60px;
      margin-right: 15px;
    }

    .guide-character img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .message-bubble {
      flex: 1;
      background-color: white;
      border-radius: 12px;
      padding: 15px;
      position: relative;
    }

    .message-bubble:before {
      content: '';
      position: absolute;
      left: -10px;
      top: 20px;
      border-width: 10px 10px 10px 0;
      border-style: solid;
      border-color: transparent white transparent transparent;
    }

    .risk-level-card {
      background-color: #f9f9f9;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .risk-level {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      border-radius: 8px;
    }

    .risk-level.low {
      background-color: #e6f7e6;
    }

    .risk-level.moderate {
      background-color: #fff8e6;
    }

    .risk-level.high {
      background-color: #ffe6e6;
    }

    .risk-indicator {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .risk-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin-right: 10px;
    }

    .low .risk-icon {
      background-color: #4caf50;
      color: white;
    }

    .moderate .risk-icon {
      background-color: #ff9800;
      color: white;
    }

    .high .risk-icon {
      background-color: #f44336;
      color: white;
    }

    .risk-label {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .risk-description {
      text-align: center;
    }

    .skill-areas {
      margin-bottom: 30px;
    }

    .skill-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }

    .skill-card {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      border-top: 4px solid #ccc;
    }

    .skill-card.strength {
      border-top-color: #4caf50;
    }

    .skill-card.average {
      border-top-color: #2196f3;
    }

    .skill-card.challenge {
      border-top-color: #f44336;
    }

    .skill-card h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 1rem;
    }

    .skill-meter {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .skill-progress {
      height: 100%;
      background-color: #2196f3;
    }

    .strength .skill-progress {
      background-color: #4caf50;
    }

    .average .skill-progress {
      background-color: #2196f3;
    }

    .challenge .skill-progress {
      background-color: #f44336;
    }

    .skill-description {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }

    .strengths-challenges {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .strengths, .challenges {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
    }

    .strengths h2, .challenges h2 {
      margin-top: 0;
      font-size: 1.2rem;
    }

    .strengths ul, .challenges ul {
      margin: 0;
      padding-left: 20px;
    }

    .strengths li, .challenges li {
      margin-bottom: 8px;
    }

    .recommendations {
      margin-bottom: 30px;
    }

    .recommendation-section {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .recommendation-section h3 {
      margin-top: 0;
      font-size: 1.1rem;
    }

    .recommendation-section ul {
      margin: 0;
      padding-left: 20px;
    }

    .recommendation-section li {
      margin-bottom: 8px;
    }

    .disclaimer {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 30px;
      border-left: 4px solid #ff9800;
    }

    .disclaimer h3 {
      margin-top: 0;
      font-size: 1.1rem;
    }

    .actions {
      display: flex;
      justify-content: space-between;
    }

    .back-button, .download-button, .finish-button {
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

    .download-button {
      background-color: #4caf50;
      color: white;
      border: none;
    }

    .finish-button {
      background-color: #1f94ff;
      color: white;
      border: none;
    }

    .back-button:hover {
      background-color: #e6e6e6;
    }

    .download-button:hover:not(:disabled) {
      background-color: #3d8b40;
    }

    .finish-button:hover:not(:disabled) {
      background-color: #0d84e8;
    }

    .download-button:disabled, .finish-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .strengths-challenges {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
        gap: 10px;
      }

      .actions button {
        width: 100%;
      }
    }
  `]
})
export class ScreeningResultsComponent implements OnInit {
  isLoading: boolean = true;
  analysisResult: AnalysisResult | null = null;
  guideSummary: string = ''; // Keep this to display the message
  guideCharacterImage: string = 'assets/images/guide-default.svg';

  constructor(
    private router: Router,
    private resultsAnalyzerService: ResultsAnalyzerService,
    private guideChatbotService: GuideChatbotService,
    private userService: UserService,
    private screeningCoordinator: ScreeningCoordinatorService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    // Set guide character based on age group
    const ageGroup = this.userService.getUserAgeGroup();
    this.guideCharacterImage = ageGroup === 'early'
      ? 'assets/images/guide-child.svg'
      : 'assets/images/guide-teen.svg';

    try {
      // Analyze results
      this.analysisResult = await this.resultsAnalyzerService.analyzeResults();

      // Get guide summary based on risk level (now returns void)
      const riskLevel = this.analysisResult.preliminaryScore.riskLevel;
      await this.guideChatbotService.summarizeResults(riskLevel);

      // Set the summary text locally *after* the service call (if needed for display)
      // Hardcoding for now to ensure display works
      if (ageGroup === 'early') {
        if (riskLevel === 'Low') {
          this.guideSummary = "You did a fantastic job with all our games today! Your brain is doing really well with letters and words. Remember, everyone learns in their own special way, and you have lots of strengths!";
        } else {
          this.guideSummary = "Thank you for playing all these games with me today! You tried so hard, and that's what matters most. Everyone's brain works differently, and these activities help us understand how you learn best. Your grown-ups will get some ideas about ways to make reading and learning even more fun for you!";
        }
      } else if (ageGroup === 'middle') {
        if (riskLevel === 'Low') {
          this.guideSummary = "Great job completing all the activities! You showed strong skills across most areas. Remember that everyone has their own learning style, and these activities help us understand yours better.";
        } else {
          this.guideSummary = "Thank you for completing all the activities! These exercises help us understand how you process information and learn best. Everyone has different strengths and challenges, and this screening helps identify strategies that might work well for you. Your results will include some helpful suggestions for learning.";
        }
      } else {
        if (riskLevel === 'Low') {
          this.guideSummary = "You've successfully completed the screening process. Your results indicate strong performance across most skill areas. Remember that understanding your learning style can help you leverage your strengths effectively.";
        } else {
          this.guideSummary = "Thank you for completing the screening process. These activities help identify patterns in how you process information, which can lead to effective learning strategies. Everyone's brain processes information differently, and these results will help identify approaches that might work best for you. Remember that this is a screening tool, not a diagnosis, and the report will include practical recommendations.";
        }
      }

    } catch (error) {
      console.error('Error analyzing results or getting summary:', error);
      this.guideSummary = 'Thank you for completing the screening. There was an error analyzing your results, but we\'ve saved your responses for later review.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Ensure UI updates after async operations
    }
  }


  getRiskLevelClass(): string {
    if (!this.analysisResult) return '';

    const riskLevel = this.analysisResult.preliminaryScore.riskLevel.toLowerCase();
    return riskLevel as string;
  }

  getRiskDescription(): string {
    if (!this.analysisResult) return '';

    const riskLevel = this.analysisResult.preliminaryScore.riskLevel;

    if (riskLevel === 'Low') {
      return 'The screening indicates few or no signs typically associated with dyslexia. Continue to monitor reading development and provide enrichment activities.';
    } else if (riskLevel === 'Moderate') {
      return 'The screening indicates some signs that may be associated with dyslexia. Consider implementing suggested strategies and monitoring progress.';
    } else {
      return 'The screening indicates several signs commonly associated with dyslexia. Consider a comprehensive evaluation by a qualified professional.';
    }
  }

  getSkillClass(status: string | undefined): string {
    if (!status) return '';
    return status.toLowerCase();
  }

  goBack(): void {
    // Go back to the last assessment (assuming it was pattern matching)
    // TODO: Make this dynamic based on actual last step if needed
    this.router.navigate(['/screening/pattern-matching']);
  }

  async downloadReport(): Promise<void> {
    if (!this.analysisResult) return;

    try {
      const reportPath = await this.resultsAnalyzerService.generatePDFReport(this.analysisResult);
      console.log('Report generated:', reportPath);

      // In a real implementation, this would trigger a download
      alert('Report downloaded: ' + reportPath);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again later.');
    }
  }

  finishScreening(): void {
    // Complete the screening and return to home
    this.screeningCoordinator.resetProgress();
    this.router.navigate(['/']);
  }
}
