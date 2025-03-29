import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPulseComponent } from '../audio-pulse/audio-pulse.component';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';
import { AudioRecorder } from '../../gemini/audio-recorder';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-control-tray',
  standalone: true,
  imports: [CommonModule, AudioPulseComponent],
  template: `
    <div class="control-tray">
      <button class="mic-button" 
              [class.active]="!muted"
              [disabled]="!isConnected"
              (click)="toggleMute()">
        {{ muted ? '🎤' : '🔴' }}
      </button>
      
      <div class="volume-indicator">
        <app-audio-pulse [active]="!muted" [volume]="volume"></app-audio-pulse>
      </div>
      
      <button class="connection-button"
              [class.connected]="isConnected"
              (click)="toggleConnection()">
        {{ isConnected ? 'Disconnect' : 'Connect' }}
      </button>
      
      <span class="status-text" *ngIf="statusMessage">{{ statusMessage }}</span>
    </div>
  `,
  styles: [`
    .control-tray {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #2a2f31;
      padding: 10px;
      border-radius: 8px;
    }
    
    button {
      cursor: pointer;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #404547;
      color: white;
      transition: all 0.2s ease;
    }
    
    button:hover:not(:disabled) {
      opacity: 0.9;
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .mic-button {
      background-color: #1f94ff;
    }
    
    .mic-button.active {
      background-color: #ff4600;
    }
    
    .volume-indicator {
      padding: 0 10px;
    }
    
    .connection-button {
      border-radius: 20px;
      width: auto;
      padding: 0 15px;
    }
    
    .connection-button.connected {
      background-color: #0d9c53;
    }
    
    .status-text {
      font-size: 12px;
      color: #888d8f;
      margin-left: 10px;
    }
  `]
})
export class ControlTrayComponent {
  @Input() supportsVideo: boolean = false;
  @Output() onVideoStreamChange = new EventEmitter<MediaStream | null>();
  
  muted: boolean = true;
  volume: number = 0;
  isConnected: boolean = false;
  statusMessage: string = '';
  
  private audioRecorder = new AudioRecorder();
  private speechRecognition: any = null;
  localTranscript: string = '';
  
  constructor(
    private multimodalLiveService: MultimodalLiveService,
    private chatService: ChatService
  ) {
    this.multimodalLiveService.connected$.subscribe(connected => {
      this.isConnected = connected;
      
      if (connected) {
        this.statusMessage = 'Ready to listen';
      } else {
        this.statusMessage = '';
        // If disconnected, ensure audio is stopped
        if (!this.muted) {
          this.muted = true;
          this.stopAudioRecording();
        }
      }
    });
    
    this.multimodalLiveService.volume$.subscribe(volume => {
      this.volume = volume;
    });
  }
  
  toggleMute(): void {
    this.muted = !this.muted;
    console.log('Microphone', this.muted ? 'muted' : 'unmuted');
    
    if (this.muted) {
      this.stopAudioRecording();
      this.statusMessage = 'Ready to listen';
    } else {
      this.startAudioRecording();
      this.statusMessage = 'Listening...';
    }
  }
  
  toggleConnection(): void {
    if (this.isConnected) {
      this.multimodalLiveService.disconnect();
      this.statusMessage = '';
    } else {
      this.statusMessage = 'Connecting...';
      
      // Configuration with audio responses
      this.multimodalLiveService.connect({
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
          // Use audio for responses
          responseModalities: "audio", 
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
        systemInstruction: {
          parts: [
            {
              text: 'You are a helpful voice assistant. Keep your responses concise and conversational. Users will talk to you using their voice, and you should respond in a way that works well for voice interaction.',
            },
          ],
        },
        tools: [
          { googleSearch: {} }, 
          { codeExecution: {} },
        ],
      }).catch(error => {
        console.error('Connection error:', error);
        this.statusMessage = 'Connection failed. Check console for details.';
      });
    }
  }
  
  private startAudioRecording(): void {
    if (!this.isConnected) return;
    
    // Create a SpeechRecognition instance for local transcription
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        // Update a local transcript
        this.localTranscript = transcript;
        
        // If it's a final result, add it to the chat
        const isFinal = event.results[0].isFinal;
        if (isFinal) {
          // Add to chat using the service
          this.chatService.addMessage('user', transcript);
        }
      };
      
      recognition.start();
      this.speechRecognition = recognition;
    }
    
    this.audioRecorder
      .onData((base64Data, mimeType) => {
        // Send audio data to Gemini - ensure correct PCM format
        this.multimodalLiveService.sendRealtimeInput([{
          mimeType: 'audio/pcm;rate=16000',
          data: base64Data
        }]);
      })
      .onVolume((volume) => {
        this.volume = volume;
      })
      .start()
      .catch(error => {
        console.error('Failed to start audio recording:', error);
        this.muted = true;
        this.statusMessage = 'Microphone access failed';
      });
  }
  
  private stopAudioRecording(): void {
    // Stop the speech recognition
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = null;
    }
    
    this.audioRecorder.stop();
    this.volume = 0;
  }
  
  handleVideoStreamChange(stream: MediaStream | null): void {
    this.onVideoStreamChange.emit(stream);
  }
}