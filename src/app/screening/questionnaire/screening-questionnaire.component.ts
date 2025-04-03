import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DiagnosticChatbotService } from '../../services/diagnostic-chatbot.service';
import { ScreeningCoordinatorService } from '../../services/screening-coordinator.service';
import { UserService } from '../../services/user.service';
import { GuideChatbotService } from '../../services/guide-chatbot.service';
import { VoiceInputStateService } from '../../services/voice-input-state.service';
import { ControlTrayComponent } from '../../control-tray/control-tray.component';

@Component({
  selector: 'app-screening-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule, ControlTrayComponent],
  template: `
    <div class="questionnaire-container">
      <header class="questionnaire-header">
        <h1>Questionnaire</h1>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="progressPercentage"></div>
          </div>
          <div class="progress-text">Step {{ currentStepIndex }} of {{ totalSteps }}</div>
        </div>
      </header>
      
      <app-control-tray></app-control-tray>

      <main class="questionnaire-content">
        <div class="guide-container" *ngIf="showGuide">
          <div class="guide-character">
            <img [src]="guideCharacterImage" alt="Guide character">
          </div>

          <div class="guide-message">
            <p>{{ guideMessage }}</p>
            <button class="start-button" (click)="startQuestionnaire()">Start Questionnaire</button>
          </div>
        </div>

        <div class="chat-container" *ngIf="!showGuide">
          <div class="chat-messages">
            <div *ngFor="let message of messages"
                 class="message"
                 [class.user-message]="message.role === 'user'"
                 [class.assistant-message]="message.role === 'assistant'">
              <div class="message-content">{{ message.content }}</div>
            </div>

            <div *ngIf="isProcessing" class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div class="chat-input">
            <input
              type="text"
              [(ngModel)]="userInput"
              [placeholder]="isVoiceInputActive ? 'Listening... (or type here)' : 'Type your response here...'"
              [disabled]="isProcessing || isComplete"
              (keyup.enter)="sendMessage()"/>
            <button
              class="send-button"
              [disabled]="!userInput.trim() || isProcessing || isComplete"
              (click)="sendMessage()">
              Send
            </button>
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
            (click)="goToNextStep()">
            Continue to Activities
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .questionnaire-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: var(--font-family, 'Google Sans', sans-serif);
    }

    .questionnaire-header {
      margin-bottom: 20px;
    }

    .questionnaire-header h1 {
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

    .questionnaire-content {
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

    .chat-container {
      display: flex;
      flex-direction: column;
      margin-bottom: 30px;
    }

    .chat-messages {
      background-color: #f9f9f9;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
      height: 350px;
      overflow-y: auto;
    }

    .message {
      margin-bottom: 15px;
      max-width: 80%;
    }

    .user-message {
      margin-left: auto;
    }

    .assistant-message {
      margin-right: auto;
    }

    .message-content {
      padding: 10px 15px;
      border-radius: 18px;
      display: inline-block;
    }

    .user-message .message-content {
      background-color: #1f94ff;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .assistant-message .message-content {
      background-color: #e6e6e6;
      color: #333;
      border-bottom-left-radius: 4px;
    }

    .typing-indicator {
      display: inline-flex;
      align-items: center;
      background-color: #e6e6e6;
      padding: 10px 15px;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
    }

    .typing-indicator span {
      height: 8px;
      width: 8px;
      background-color: #999;
      border-radius: 50%;
      display: inline-block;
      margin: 0 2px;
      animation: typing 1.4s infinite both;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0); }
    }

    .chat-input {
      display: flex;
      gap: 10px;
    }

    .chat-input input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ccc;
      border-radius: 20px;
      font-size: 1rem;
    }

    .send-button {
      background-color: #1f94ff;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .send-button:hover:not(:disabled) {
      background-color: #0d84e8;
    }

    .send-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
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
  `]
})
export class ScreeningQuestionnaireComponent implements OnInit, OnDestroy {
  messages: { role: string, content: string }[] = [];
  userInput: string = '';
  isProcessing: boolean = false;
  isComplete: boolean = false;
  isVoiceInputActive: boolean = true;
  showGuide: boolean = true;
  guideMessage: string = '';
  guideCharacterImage: string = 'assets/images/guide-default.svg';
  progressPercentage: number = 0;
  currentStepIndex: number = 0;
  totalSteps: number = 0;

  private messagesSubscription: Subscription | null = null;
  private processingSubscription: Subscription | null = null;
  private completeSubscription: Subscription | null = null;
  private voiceStateSubscription: Subscription | null = null;
  private stepIndexSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private diagnosticChatbotService: DiagnosticChatbotService,
    private guideChatbotService: GuideChatbotService,
    private screeningCoordinator: ScreeningCoordinatorService,
    private userService: UserService,
    private voiceInputStateService: VoiceInputStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.totalSteps = this.screeningCoordinator.getAllSteps().length;
  }

  ngOnInit(): void {
    // Set guide character based on age group
    const ageGroup = this.userService.getUserAgeGroup();
    this.guideCharacterImage = ageGroup === 'early'
      ? 'assets/images/guide-child.svg'
      : 'assets/images/guide-teen.svg';

    // Set guide message based on age group
    this.setGuideMessage(ageGroup);

    // Subscribe to step index changes
    this.stepIndexSubscription = this.screeningCoordinator.currentStepIndex$.subscribe(index => {
      this.currentStepIndex = index + 1;
      this.progressPercentage = (this.currentStepIndex / this.totalSteps) * 100;
    });

    // Subscribe to messages
    this.messagesSubscription = this.diagnosticChatbotService.messages$.subscribe(
      messages => this.messages = messages
    );

    // Subscribe to processing state
    this.processingSubscription = this.diagnosticChatbotService.isProcessing$.subscribe(
      isProcessing => this.isProcessing = isProcessing
    );

    // Subscribe to completion state
    this.completeSubscription = this.diagnosticChatbotService.isComplete$.subscribe(
      isComplete => this.isComplete = isComplete
    );

    // Subscribe to voice input state
    this.voiceStateSubscription = this.voiceInputStateService.isMuted$.subscribe(
      isMuted => {
        this.isVoiceInputActive = !isMuted;
        this.cdr.markForCheck();
      }
    );

    // Set initial voice input state
    this.isVoiceInputActive = !this.voiceInputStateService.getIsMuted();
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
    if (this.processingSubscription) this.processingSubscription.unsubscribe();
    if (this.completeSubscription) this.completeSubscription.unsubscribe();
    if (this.voiceStateSubscription) this.voiceStateSubscription.unsubscribe();
    if (this.stepIndexSubscription) this.stepIndexSubscription.unsubscribe();

    this.diagnosticChatbotService.disconnect();
  }

  setGuideMessage(ageGroup: 'early' | 'middle' | 'teen'): void {
    if (ageGroup === 'early') {
      this.guideMessage = "Now I'm going to ask you some questions about reading and school. There are no right or wrong answers - I just want to learn about how you learn! Just tell me what you think.";
    } else if (ageGroup === 'middle') {
      this.guideMessage = "I'm going to ask you some questions about your experiences with reading and learning. This helps us understand how you learn best. There are no right or wrong answers, just share what's true for you.";
    } else {
      this.guideMessage = "I'd like to ask you some questions about your experiences with reading, writing, and learning. Your honest responses will help us understand your learning style better. This is not a test, and there are no right or wrong answers.";
    }
  }

  async startQuestionnaire(): Promise<void> {
    this.showGuide = false;
    await this.diagnosticChatbotService.startQuestionnaire();
  }

  async sendMessage(): Promise<void> {
    if (this.isVoiceInputActive || !this.userInput.trim() || this.isProcessing || this.isComplete) return;

    const message = this.userInput;
    this.userInput = '';
    await this.diagnosticChatbotService.processResponse(message);
  }

  goBack(): void {
    this.router.navigate(['/screening/introduction']);
  }

  goToNextStep(): void {
    this.screeningCoordinator.nextStep();
  }
}
