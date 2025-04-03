import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core'; // Keep combined imports
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; // Keep Subscription
import { AudioPulseComponent } from '../audio-pulse/audio-pulse.component';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';
import { AudioRecorder } from '../../gemini/audio-recorder';
import { VoiceInputStateService } from '../services/voice-input-state.service'; // Import the new service
// import { ChatService } from '../services/chat.service'; // Removed ChatService if only used for SpeechRecognition transcript

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
              (click)="toggleConnection()"> <!-- Correct binding -->
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
export class ControlTrayComponent implements OnDestroy { // Implement OnDestroy
  @Input() supportsVideo: boolean = false;
  @Output() onVideoStreamChange = new EventEmitter<MediaStream | null>();

  muted: boolean = true;
  volume: number = 0;
  isConnected: boolean = false;
  statusMessage: string = '';

  private audioRecorder = new AudioRecorder();
  private audioSendTimer: any = null; // Timer for sending audio chunks
  private connectedSubscription: Subscription | undefined;
  private volumeSubscription: Subscription | undefined;
  private transcriptionSubscription: Subscription | undefined;

  constructor(
    private multimodalLiveService: MultimodalLiveService,
    private voiceInputStateService: VoiceInputStateService // Inject the service
    // private chatService: ChatService // Removed ChatService
  ) {
    // Store subscriptions to unsubscribe later
    this.connectedSubscription = this.multimodalLiveService.connected$.subscribe(connected => {
      this.isConnected = connected;

      if (connected) {
        this.statusMessage = 'Ready to listen';
      } else {
        this.statusMessage = '';
        // If disconnected, ensure audio is stopped and mic is muted
        if (!this.muted) {
          this.muted = true;
          this.stopAudioRecording();
        }
      }
    });

    this.volumeSubscription = this.multimodalLiveService.volume$.subscribe(volume => {
      // Note: This volume likely comes from the *output* audio playback in gemini-client.service
      // We might need a separate volume indicator for the *input* from audio-recorder
      // Let's keep showing output volume for now, input volume is handled in startAudioRecording
      // this.volume = volume;
    });

    // Subscribe to transcription updates from the service
    this.transcriptionSubscription = this.multimodalLiveService.transcription$.subscribe(transcript => {
      if (transcript && !this.muted) { // Only show transcription if mic is active
        this.statusMessage = `Transcribed: "${transcript}"`; // Show transcription
        // Optionally clear status after a delay
        setTimeout(() => {
          if (this.statusMessage.startsWith('Transcribed:')) {
             this.statusMessage = this.muted ? 'Ready to listen' : 'Listening...';
          }
        }, 2000);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all observables
    this.connectedSubscription?.unsubscribe();
    this.volumeSubscription?.unsubscribe();
    this.transcriptionSubscription?.unsubscribe();
    // Ensure recording is stopped and resources released
    this.stopAudioRecording();
    if (this.isConnected) {
        this.multimodalLiveService.disconnect();
    }
  }


  async toggleMute(): Promise<void> { // Make async
    const newMuteState = !this.muted; // Determine the target state first
    this.muted = newMuteState; // Update local state
    this.voiceInputStateService.setIsMuted(newMuteState); // Update shared state
    console.log('Microphone', this.muted ? 'muted' : 'unmuted');

    if (this.muted) { // If muting
      this.stopAudioRecording();
      this.statusMessage = this.isConnected ? 'Ready to listen' : '';
    } else {
      // Ensure connection before starting recording
      if (!this.isConnected) {
        this.statusMessage = 'Connecting...';
        try {
          // Use toggleConnection which now handles the connect logic
          await this.toggleConnection();
          // Check isConnected state *after* attempting connection
          if (!this.isConnected) {
             console.log("Connection attempt failed in toggleMute.");
             this.muted = true; // Revert mute state if connection failed
             this.voiceInputStateService.setIsMuted(true); // Ensure shared state is reverted
             return;
          }
        } catch (error) {
           console.error("Connection failed during toggleMute:", error);
           this.muted = true; // Revert mute state on error
           this.voiceInputStateService.setIsMuted(true); // Ensure shared state is reverted
           return; // Stop if connection fails
        }
      }
      // Now start recording only if connected
      if (this.isConnected) {
        this.startAudioRecording();
        this.statusMessage = 'Listening...';
      } else {
        // Handle case where connection failed silently or was disconnected between checks
        this.muted = true;
        this.voiceInputStateService.setIsMuted(true); // Ensure shared state is reverted
        this.statusMessage = 'Connection required';
      }
    }
  }

  // Handles both connecting and disconnecting
  async toggleConnection(): Promise<void> {
    if (this.isConnected) {
      // Disconnect logic
      this.multimodalLiveService.disconnect(); // This subscription handles isConnected = false and statusMessage = ''
      // Ensure mic stops if connection is manually closed
      if (!this.muted) {
         this.muted = true;
         this.voiceInputStateService.setIsMuted(true); // Update shared state
         this.stopAudioRecording();
      }
    } else {
      // Connect logic
      this.statusMessage = 'Connecting...';
      try {
        // Configuration with audio input/output
        // Use the specific config needed for the diagnostic questionnaire
        await this.multimodalLiveService.connect({
          model: "models/gemini-2.0-flash-exp", // Or the model used in DiagnosticChatbotService
          generationConfig: {
            // Ensure audio modality is configured if needed by backend
            // responseModalities: "audio", // Keep if backend expects this
            // speechConfig: { // Keep if backend expects this
            //   voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
            // },
            temperature: 0.2, // Match DiagnosticChatbotService
            maxOutputTokens: 2048, // Match DiagnosticChatbotService
          },
          systemInstruction: { // Use system instruction from DiagnosticChatbotService
            parts: [
              {
                text: `
                  You are a professional, empathetic diagnostic assistant conducting a dyslexia screening questionnaire.

                  Ask one question at a time about reading habits, learning experiences, and potential dyslexia indicators.
                  Adapt your language to be age-appropriate for the user.
                  Listen carefully to responses and ask appropriate follow-up questions.
                  Be sensitive and non-judgmental in your approach.
                  Do not diagnose or label the user - this is a screening, not a diagnosis.
                  After collecting sufficient information, summarize the key points from the conversation.
                `,
              }
            ]
          }
          // tools: [ // Keep tools if needed by backend
          //   { googleSearch: {} },
          //   { codeExecution: {} },
          // ],
        });
        // Status message will be updated by the connected$ subscription
      } catch (error) {
         console.error('Connection error:', error);
         this.statusMessage = 'Connection failed.';
         this.isConnected = false; // Ensure state reflects failure
         // No need to throw error here, let toggleMute handle the state if called from there
      }
    }
  }

  private startAudioRecording(): void {
    if (!this.isConnected || !this.audioRecorder) {
        console.warn("Cannot start recording: Not connected or recorder not available.");
        return;
    }

    console.log("Starting audio recording and sending...");
    this.audioRecorder
      .onData((base64Data, mimeType) => {
         // Simple timer to send chunks roughly every 200ms
         if (!this.audioSendTimer) {
             this.multimodalLiveService.sendRealtimeInput([{
                 mimeType: mimeType, // Use mimeType provided by recorder ('audio/pcm;rate=16000')
                 data: base64Data
             }]);
             this.audioSendTimer = setTimeout(() => {
                 this.audioSendTimer = null;
             }, 200); // Adjust interval as needed
         }
      })
      .onVolume(inputVolume => { // Use a different name to avoid conflict with output volume
        // Update volume for visualizer - TODO: Decide if this should show input or output volume
        // For now, let's assume it shows input volume when mic is active
        if (!this.muted) {
            this.volume = inputVolume;
        }
      })
      .start() // Returns promise<boolean>
      .then(success => {
         if (!success) {
            console.error('Audio recorder failed to start.');
            this.muted = true; // Revert mute state
            this.voiceInputStateService.setIsMuted(true); // Update shared state
            this.statusMessage = 'Mic start failed';
         } else {
            console.log('Audio recording started successfully.');
         }
      })
      .catch(error => {
        console.error('Failed to start audio recording:', error);
        this.muted = true; // Revert mute state
        this.voiceInputStateService.setIsMuted(true); // Update shared state
        this.statusMessage = 'Mic access failed';
      });
  }

  private stopAudioRecording(): void {
    if (this.audioSendTimer) {
       clearTimeout(this.audioSendTimer);
       this.audioSendTimer = null;
    }
    if (this.audioRecorder) {
       this.audioRecorder.stop();
    }
    this.volume = 0; // Reset volume indicator
    console.log("Audio recording stopped.");
  }

  handleVideoStreamChange(stream: MediaStream | null): void {
    this.onVideoStreamChange.emit(stream);
  }
}
