type AudioRecorderCallback = (audioData: string, mimeType: string) => void;
type VolumeCallback = (volume: number) => void;

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioProcessorNode: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private dataCallback: AudioRecorderCallback | null = null;
  private volumeCallback: VolumeCallback | null = null;
  private volumeInterval: number | null = null;
  private audioBuffer: Float32Array[] = [];
  
  // Gemini expects 16kHz input
  constructor(public sampleRate = 16000) {}
  
  async start() {
    try {
      console.log('Starting audio recorder...');
      
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Create audio context - we'll use the browser's default sample rate
      // and downsample later if needed
      this.audioContext = new AudioContext();
      const browserSampleRate = this.audioContext.sampleRate;
      
      // Create audio source from microphone
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create analyser node for volume detection
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.source.connect(this.analyser);
      
      // Set up volume monitoring
      this.startVolumeMonitoring();
      
      // Create a script processor node for PCM data
      // Use a relatively large buffer to reduce CPU usage
      this.audioProcessorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.source.connect(this.audioProcessorNode);
      this.audioProcessorNode.connect(this.audioContext.destination);
      
      // Process audio data
      this.audioProcessorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // We need to convert browser sample rate to 16kHz for Gemini
        // For now, just collect the raw samples
        this.audioBuffer.push(new Float32Array(inputData));
        
        // Send data every ~500ms (roughly 8 buffers at 16kHz)
        if (this.audioBuffer.length >= 8) {
          this.processSendAudioData(browserSampleRate);
        }
      };
      
      // Use the precise format Gemini expects for audio input
      console.log('Using audio format: audio/pcm;rate=16000');
      console.log('Audio recording started successfully');
      return true;
    } catch (error) {
      console.error('Error starting audio recorder:', error);
      throw error;
    }
  }
  
  stop() {
    if (this.audioProcessorNode) {
      this.audioProcessorNode.disconnect();
      this.audioProcessorNode = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }
    
    this.audioContext = null;
    this.analyser = null;
    this.dataCallback = null;
    this.volumeCallback = null;
    this.audioBuffer = [];
    
    console.log('Audio recording stopped');
  }
  
  private processSendAudioData(originalSampleRate: number) {
    if (!this.dataCallback || this.audioBuffer.length === 0) return;
    
    try {
      // Concatenate all collected audio buffers
      const totalSamples = this.audioBuffer.reduce((sum, buf) => sum + buf.length, 0);
      const concatenated = new Float32Array(totalSamples);
      
      let offset = 0;
      for (const buffer of this.audioBuffer) {
        concatenated.set(buffer, offset);
        offset += buffer.length;
      }
      
      // Resample to 16kHz if browser uses a different rate
      const resampledData = this.resampleAudio(concatenated, originalSampleRate, this.sampleRate);
      
      // Convert Float32Array [-1,1] to Int16Array [-32768,32767]
      const pcm16 = new Int16Array(resampledData.length);
      for (let i = 0; i < resampledData.length; i++) {
        // Clamp to [-1,1] range to avoid overflow
        const sample = Math.max(-1, Math.min(1, resampledData[i]));
        // Convert to 16-bit PCM
        pcm16[i] = Math.floor(sample * 32767);
      }
      
      // Convert to base64
      const base64 = this.arrayBufferToBase64(pcm16.buffer);
      
      // Send the data - using the exact format Gemini expects
      this.dataCallback(base64, 'audio/pcm;rate=16000');
      
      // Clear the buffer for next batch
      this.audioBuffer = [];
    } catch (error) {
      console.error('Error processing audio data:', error);
      this.audioBuffer = [];
    }
  }
  
  // Linear resampling algorithm
  private resampleAudio(audioData: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
    if (fromSampleRate === toSampleRate) {
      return audioData;
    }
    
    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const fraction = position - index;
      
      // Simple linear interpolation
      if (index + 1 < audioData.length) {
        result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
      } else {
        result[i] = audioData[index];
      }
    }
    
    return result;
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  onData(callback: AudioRecorderCallback) {
    this.dataCallback = callback;
    return this;
  }
  
  onVolume(callback: VolumeCallback) {
    this.volumeCallback = callback;
    return this;
  }
  
  private startVolumeMonitoring() {
    if (!this.analyser) return;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.volumeInterval = window.setInterval(() => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate volume level (0-1)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const volume = average / 255;
      
      if (this.volumeCallback) {
        this.volumeCallback(volume);
      }
    }, 100);
  }
}