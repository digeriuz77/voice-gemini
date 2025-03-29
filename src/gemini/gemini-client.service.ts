import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LiveConfig } from './types';
import { Part, GenerativeContentBlob } from '@google/generative-ai';
import { environment } from '../environments/environment.development';

type TurnState = 'idle' | 'listening' | 'processing' | 'speaking';

@Injectable({
  providedIn: 'root'
})
export class MultimodalLiveService {
  private ws: WebSocket | null = null;
  private config: LiveConfig | null = null;
  private audioContext: AudioContext | null = null;

  // Accumulate audio chunks for the current turn.
  private audioChunks: Uint8Array[] = [];
  // Timer to debounce processing of audio chunks.
  private audioProcessingTimer: any = null;
  // Timer for VAD silence detection.
  private vadTimer: any = null;
  // Keep track of the current audio source so it can be interrupted.
  private currentSource: AudioBufferSourceNode | null = null;

  // Turn state management.
  private turnState: TurnState = 'idle';
  private turnStateSubject = new BehaviorSubject<TurnState>('idle');
  public turnState$ = this.turnStateSubject.asObservable();

  // Observables for component binding.
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  private contentSubject = new BehaviorSubject<any>(null);
  public content$ = this.contentSubject.asObservable();

  private volumeSubject = new BehaviorSubject<number>(0);
  public volume$ = this.volumeSubject.asObservable();

  // Configurable playback rate adjustment (1.0 = as received; >1.0 speeds up).
  private playbackRate = 1.42; 

  constructor() {
    console.log('MultimodalLiveService initialized');
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      if (!this.audioContext) {
        console.error('Failed to create AudioContext');
        return;
      }
      console.log('Audio system initialized');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async connect(config: LiveConfig = {} as LiveConfig): Promise<void> {
    if (this.ws) {
      this.disconnect();
    }
    this.config = config;
    const url = `${environment.WS_URL}?key=${environment.API_KEY}`;

    if (!environment.API_KEY || environment.API_KEY === 'YOUR_API_KEY_HERE') {
      console.error('API key not set.');
      this.connectedSubject.next(false);
      throw new Error('API key not set');
    }

    try {
      this.ws = new WebSocket(url);
      return new Promise<void>((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
          this.disconnect();
        }, 10000);

        this.ws!.onopen = () => {
          console.log('WebSocket connection opened');
          const setupMessage = { setup: this.config };
          this.ws!.send(JSON.stringify(setupMessage));
        };

        this.ws!.onmessage = async (event) => {
          try {
            let messageData: string;
            if (event.data instanceof Blob) {
              messageData = await this.blobToText(event.data);
            } else {
              messageData = event.data;
            }
            const message = JSON.parse(messageData);

            if (message.setupComplete !== undefined) {
              console.log('Setup complete');
              this.connectedSubject.next(true);
              clearTimeout(connectionTimeout);
              resolve();
            } else if (message.serverContent) {
              console.log('Content received');
              this.contentSubject.next(message.serverContent);
              this.processAudioResponse(message.serverContent);
            } else if (message.toolCall) {
              console.log('Tool call received:', message.toolCall);
              this.contentSubject.next(message);
            }
          } catch (err) {
            console.error('Error processing message:', err);
          }
        };

        this.ws!.onerror = (err) => {
          console.error('WebSocket error:', err);
          clearTimeout(connectionTimeout);
          this.connectedSubject.next(false);
          reject(err);
        };

        this.ws!.onclose = () => {
          console.log('WebSocket connection closed');
          this.connectedSubject.next(false);
          if (this.audioChunks.length > 0) {
            this.processAccumulatedAudio();
          }
        };
      });
    } catch (error) {
      console.error('Connection error:', error);
      this.connectedSubject.next(false);
      throw error;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectedSubject.next(false);
    this.config = null;
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.updateTurnState('idle');
  }

  /**
   * Sends a new message, resets any accumulated audio, and sets turn state to listening.
   */
  send(message: Part | Part[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    // Reset accumulated audio for the new turn.
    this.audioChunks = [];
    if (this.audioProcessingTimer) {
      clearTimeout(this.audioProcessingTimer);
      this.audioProcessingTimer = null;
    }
    // Interrupt any currently playing audio.
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    // Set state to listening.
    this.updateTurnState('listening');

    const parts = Array.isArray(message) ? message : [message];
    const clientContentMessage = {
      clientContent: {
        turns: [{ role: 'user', parts: parts }],
        turnComplete: true
      }
    };

    console.log('Sending message');
    this.ws.send(JSON.stringify(clientContentMessage));
    this.updateInputVolume();
  }

  sendRealtimeInput(chunks: GenerativeContentBlob[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    const realtimeInputMessage = { realtimeInput: { mediaChunks: chunks } };
    this.ws.send(JSON.stringify(realtimeInputMessage));
    this.updateInputVolume();
  }

  sendToolResponse(response: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    const toolResponseMessage = { toolResponse: response };
    this.ws.send(JSON.stringify(toolResponseMessage));
  }

  private updateInputVolume(): void {
    this.volumeSubject.next(0.8);
    setTimeout(() => this.volumeSubject.next(0.4), 100);
    setTimeout(() => this.volumeSubject.next(0.0), 200);
  }

  /**
   * Update the current turn state and notify subscribers.
   */
  private updateTurnState(state: TurnState): void {
    this.turnState = state;
    this.turnStateSubject.next(state);
  }

  /**
   * Processes incoming serverContent messages.
   * Each audio chunk is accumulated, and after a 500ms pause without new chunks,
   * the accumulated audio is combined and played.
   */
  private processAudioResponse(serverContent: any): void {
    if (!serverContent?.modelTurn?.parts) return;

    const audioPart = serverContent.modelTurn.parts.find(
      (part: any) =>
        part.inlineData &&
        part.inlineData.mimeType &&
        part.inlineData.mimeType.startsWith('audio/')
    );
    if (!audioPart || !audioPart.inlineData?.data) return;

    // Convert base64 audio data to Uint8Array.
    const binary = atob(audioPart.inlineData.data);
    const bufferArray = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bufferArray[i] = binary.charCodeAt(i);
    }

    // Accumulate audio chunk.
    this.audioChunks.push(bufferArray);

    // Debounce processing: reset timer on each new chunk.
    if (this.audioProcessingTimer) {
      clearTimeout(this.audioProcessingTimer);
    }
    this.audioProcessingTimer = setTimeout(() => {
      this.processAccumulatedAudio();
    }, 500);

    // Example VAD integration: simulate a call based on volume.
    // In a real implementation, compute the volume level of the input.
    const simulatedVolume = 0.2; // Replace with actual volume measurement.
    this.onVoiceActivityChange(simulatedVolume > 0.1);
  }

  /**
   * Handles voice activity changes.
   * Call this method with true when voice is detected, and false when silence is detected.
   * If silence persists (300ms), end the turn and process audio.
   */
  public onVoiceActivityChange(isSpeaking: boolean): void {
    if (isSpeaking) {
      // Clear any VAD timer if voice is detected.
      if (this.vadTimer) {
        clearTimeout(this.vadTimer);
        this.vadTimer = null;
      }
      this.updateTurnState('listening');
    } else {
      // If silence is detected, start a timer to end the turn.
      if (!this.vadTimer) {
        this.vadTimer = setTimeout(() => {
          this.updateTurnState('processing');
          this.processAccumulatedAudio();
          this.vadTimer = null;
        }, 300);
      }
    }
  }

  /**
   * Combines accumulated audio chunks and plays the result.
   */
  private processAccumulatedAudio(): void {
    if (this.audioChunks.length === 0) return;
    const combinedBuffer = this.combineAudioChunks(this.audioChunks);
    // Use sample rate 16000 as indicated by your mime type.
    const sampleRate = 16000;
    this.playRawPCMData(combinedBuffer, sampleRate);
    this.audioChunks = [];
    this.audioProcessingTimer = null;
  }

  private combineAudioChunks(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  /**
   * Plays raw PCM data using an AudioBufferSourceNode.
   * @param rawData The combined audio data.
   * @param sampleRate The sample rate to use for the AudioBuffer.
   */
  private playRawPCMData(rawData: Uint8Array, sampleRate: number): void {
    if (!this.audioContext) {
      console.error('AudioContext is not initialized');
      return;
    }

    const sampleCount = rawData.length / 2;
    const float32Data = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const low = rawData[i * 2];
      const high = rawData[i * 2 + 1];
      let sample = (high << 8) | low;
      if (sample >= 32768) sample = sample - 65536;
      float32Data[i] = sample / 32768;
    }

    const audioBuffer = this.audioContext.createBuffer(1, sampleCount, sampleRate);
    audioBuffer.copyToChannel(float32Data, 0);

    // Stop any previous audio playback.
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = this.playbackRate;
    source.connect(this.audioContext.destination);
    source.onended = () => {
      this.currentSource = null;
      this.updateTurnState('idle');
    };
    source.start();
    this.currentSource = source;
    this.updateTurnState('speaking');
  }

  private async blobToText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to text'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
  }
}
