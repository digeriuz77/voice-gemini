import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';
import { Subscription } from 'rxjs';
import { ControlTrayComponent } from '../control-tray/control-tray.component';
import { AudioPulseComponent } from '../audio-pulse/audio-pulse.component';
import { ChatService, ChatMessage } from '../services/chat.service';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-voice-chat',
  standalone: true,
  imports: [CommonModule, ControlTrayComponent, AudioPulseComponent],
  template: `
    <div class="voice-chat-container">
      <h2>Voice Assistant</h2>
      
      <div class="status-indicator">
        <span [class.connected]="isConnected">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
      
      <div class="chat-messages" #chatContainer>
        <div *ngIf="messages.length === 0 && !streamedMessage" class="welcome-message">
          <h3>Welcome to Gemini Voice Chat</h3>
          <p>To get started:</p>
          <ol>
            <li>Click the <strong>Connect</strong> button below</li>
            <li>Click the microphone button to start speaking</li>
            <li>Ask a question or give a command</li>
          </ol>
          <p>Try saying: <em>"What can you help me with?"</em></p>
        </div>
      
        <div *ngFor="let message of messages" 
             class="message" 
             [ngClass]="message.role">
          <div class="message-header">
            {{ message.role === 'user' ? 'You' : 'Assistant' }}
          </div>
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
        
        <div *ngIf="streamedMessage" class="message assistant streaming">
          <div class="message-header">Assistant</div>
          <div class="message-content">{{ streamedMessage }}</div>
        </div>
        
        <div *ngIf="isListening" class="listening-indicator">
          <app-audio-pulse [active]="true" [volume]="volume"></app-audio-pulse>
          <span>Listening...</span>
        </div>
      </div>
      
      <div class="api-key-warning" *ngIf="showApiKeyWarning">
        ⚠️ Please update your API key in src/environments/environment.development.ts
      </div>
      
      <div class="controls">
        <app-control-tray 
          [supportsVideo]="false"
          (onVideoStreamChange)="handleVideoStreamChange($event)">
        </app-control-tray>
        
        <div class="additional-controls">
          <button (click)="clearChat()" [disabled]="!messages.length">
            Clear Chat
          </button>
          
          <button *ngIf="isConnected" (click)="sendTestMessage()">
            Test Message
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .voice-chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h2 {
      color: #e1e2e3;
      margin-bottom: 15px;
    }
    
    .status-indicator {
      margin-bottom: 15px;
    }
    
    .status-indicator span {
      padding: 5px 10px;
      border-radius: 15px;
      background-color: #404547;
      font-size: 14px;
    }
    
    .status-indicator span.connected {
      background-color: #0d9c53;
      color: #1c1f21;
    }
    
    .chat-messages {
      flex-grow: 1;
      overflow-y: auto;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 15px;
      border-radius: 8px;
      background-color: #1c1f21;
      min-height: 300px;
      max-height: 60vh;
    }
    
    .welcome-message {
      color: #888d8f;
      text-align: center;
      padding: 20px;
      background-color: rgba(31, 148, 255, 0.1);
      border-radius: 8px;
      margin: auto 0;
    }
    
    .welcome-message h3 {
      color: #1f94ff;
      margin-bottom: 15px;
    }
    
    .welcome-message ol {
      text-align: left;
      margin: 15px 0;
      padding-left: 25px;
    }
    
    .welcome-message li {
      margin-bottom: 8px;
    }
    
    .welcome-message em {
      color: #c3c6c7;
      font-style: italic;
    }
    
    .message {
      padding: 12px 15px;
      border-radius: 8px;
      max-width: 85%;
      word-break: break-word;
    }
    
    .message.user {
      background-color: #0f3557;
      color: #e1e2e3;
      align-self: flex-end;
    }
    
    .message.assistant {
      background-color: #2a2f31;
      color: #e1e2e3;
      align-self: flex-start;
    }
    
    .message.streaming {
      position: relative;
      overflow: hidden;
    }
    
    .message.streaming::after {
      content: '|';
      animation: blink 1s step-end infinite;
      margin-left: 2px;
    }
    
    @keyframes blink {
      from, to { opacity: 0; }
      50% { opacity: 1; }
    }
    
    .message-header {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 14px;
      opacity: 0.8;
    }
    
    .message-content {
      line-height: 1.4;
    }
    
    .listening-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 20px;
      background-color: #bd3000;
      color: #e1e2e3;
      align-self: center;
    }
    
    .api-key-warning {
      background-color: #bd3000;
      color: white;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .controls {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding-top: 20px;
    }
    
    .additional-controls {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
    
    .additional-controls button {
      background-color: #2a2f31;
      color: #c3c6c7;
      border: 1px solid #404547;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .additional-controls button:hover:not(:disabled) {
      background-color: #404547;
    }
  `]
})
export class VoiceChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  isConnected: boolean = false;
  isListening: boolean = false;
  volume: number = 0;
  messages: ChatMessage[] = [];
  streamedMessage: string = '';
  showApiKeyWarning: boolean = false;
  
  private connectedSubscription: Subscription | undefined;
  private messagesSubscription: Subscription | undefined;
  private streamingMessageSubscription: Subscription | undefined;
  private volumeSubscription: Subscription | undefined;
  
  constructor(
    private multimodalLiveService: MultimodalLiveService,
    private chatService: ChatService
  ) {}
  
  ngOnInit(): void {
    // Check if API key is set
    if (!environment.API_KEY || environment.API_KEY === 'YOUR_API_KEY_HERE') {
      this.showApiKeyWarning = true;
    }
    
    this.connectedSubscription = this.multimodalLiveService.connected$.subscribe(
      (connected) => {
        this.isConnected = connected;
        
        if (connected) {
          this.startListening();
        } else {
          this.isListening = false;
        }
      }
    );
    
    this.messagesSubscription = this.chatService.messages$.subscribe(
      (messages) => {
        this.messages = messages;
      }
    );
    
    this.streamingMessageSubscription = this.chatService.streamingMessage$.subscribe(
      (message) => {
        this.streamedMessage = message;
      }
    );
    
    this.volumeSubscription = this.multimodalLiveService.volume$.subscribe(
      (volume) => {
        this.volume = volume;
      }
    );
  }
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  
  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
  
  ngOnDestroy(): void {
    if (this.connectedSubscription) {
      this.connectedSubscription.unsubscribe();
    }
    
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    
    if (this.streamingMessageSubscription) {
      this.streamingMessageSubscription.unsubscribe();
    }
    
    if (this.volumeSubscription) {
      this.volumeSubscription.unsubscribe();
    }
    
    this.multimodalLiveService.disconnect();
  }
  
  startListening(): void {
    this.isListening = true;
    // In a real implementation, this would start audio recording
  }
  
  handleVideoStreamChange(stream: MediaStream | null): void {
    // We're not using video in this implementation
    console.log('Video stream changed:', stream ? 'Active' : 'Inactive');
  }
  
  sendTextMessage(text: string): void { 
    if (!this.isConnected || !text.trim()) return; 
    this.chatService.sendMessage(text);
    
    
  }
  
  clearChat(): void {
    this.chatService.clearChat();
  }
  
  sendTestMessage(): void {
    this.sendTextMessage("What can you help me with?");
  }
}