import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GuideChatbotService, ChatMessage } from '../../services/guide-chatbot.service';
import { ScreeningCoordinatorService } from '../../services/screening-coordinator.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-screening-introduction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="introduction-container">
      <header class="introduction-header">
        <h1>Introduction</h1>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="10"></div>
          </div>
          <div class="progress-text">Step 2 of 11</div>
        </div>
      </header>
      
      <main class="introduction-content">
        <div class="guide-container">
          <!-- Removed guide character image as files are missing -->
          <!-- <div class="guide-character">
            <img [src]="guideCharacterImage" alt="Guide character">
          </div> -->
          
          <div class="chat-container">
            <div class="chat-messages">
              <div *ngFor="let message of messages" 
                   class="message" 
                   [class.user-message]="message.role === 'user'"
                   [class.assistant-message]="message.role === 'assistant'">
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
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
                placeholder="Type your response here..."
                [disabled]="isProcessing"
                (keyup.enter)="sendMessage()">
              <button 
                class="send-button" 
                [disabled]="!userInput.trim() || isProcessing"
                (click)="sendMessage()">
                Send
              </button>
            </div>
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
            Continue to Questionnaire
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .introduction-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: var(--font-family, 'Google Sans', sans-serif);
    }
    
    .introduction-header {
      margin-bottom: 20px;
    }
    
    .introduction-header h1 {
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
    
    .introduction-content {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }
    
    .guide-container {
      display: flex;
      margin-bottom: 30px;
    }
    
    /* Removed guide character styles */
    /* .guide-character {
      flex: 0 0 100px;
      margin-right: 20px;
    }
    
    .guide-character img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
    } */
    
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .chat-messages {
      background-color: #f9f9f9;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
      height: 300px;
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
    
    .message-time {
      font-size: 0.8rem;
      color: #999;
      margin-top: 5px;
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
    
    .next-button:hover {
      background-color: #0d84e8;
    }
  `]
})
export class ScreeningIntroductionComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  userInput: string = '';
  isProcessing: boolean = false;
  // Removed guideCharacterImage property
  // guideCharacterImage: string = 'assets/images/guide-default.svg';
  
  private messagesSubscription: Subscription | null = null;
  private processingSubscription: Subscription | null = null;
  
  constructor(
    private router: Router,
    private guideChatbotService: GuideChatbotService,
    private screeningCoordinator: ScreeningCoordinatorService,
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    // Removed setting guide character image
    // const ageGroup = this.userService.getUserAgeGroup();
    // this.guideCharacterImage = ageGroup === 'early' 
    //   ? 'assets/images/guide-child.svg' 
    //   : 'assets/images/guide-teen.svg';
    
    // Subscribe to messages
    this.messagesSubscription = this.guideChatbotService.messages$.subscribe(
      messages => this.messages = messages
    );
    
    // Subscribe to processing state
    this.processingSubscription = this.guideChatbotService.isProcessing$.subscribe(
      isProcessing => this.isProcessing = isProcessing
    );
    
    // Start introduction
    this.startIntroduction();
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    
    if (this.processingSubscription) {
      this.processingSubscription.unsubscribe();
    }
    
    // Disconnect chatbot
    this.guideChatbotService.disconnect();
  }
  
  async startIntroduction(): Promise<void> {
    // Clear any existing messages
    this.guideChatbotService.clearMessages();
    
    // Start introduction
    await this.guideChatbotService.introduceScreening();
  }
  
  async sendMessage(): Promise<void> {
    if (!this.userInput.trim() || this.isProcessing) return;
    
    const message = this.userInput;
    this.userInput = '';
    
    // Process user response
    await this.guideChatbotService.processUserResponse(message);
  }
  
  formatTime(date?: Date): string {
    if (!date) return '';
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  goBack(): void {
    this.router.navigate(['/screening']);
  }
  
  goToNextStep(): void {
    this.screeningCoordinator.nextStep();
  }
}
