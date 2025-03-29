import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasAudio?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  
  private streamingMessageSubject = new BehaviorSubject<string>('');
  streamingMessage$ = this.streamingMessageSubject.asObservable();
  
  constructor(private multimodalLiveService: MultimodalLiveService) {
    this.multimodalLiveService.content$.subscribe(content => {
      if (!content) return;
      
      // Handle model turn data (streaming)
      if (content.modelTurn) {
        const parts = content.modelTurn.parts || [];
        let hasAudio = false;
        
        for (const part of parts) {
          // Handle text part
          if (part.text) {
            const currentText = this.streamingMessageSubject.value;
            this.streamingMessageSubject.next(currentText + part.text);
          }
          
          // If it's an audio part with a text transcript
          if (part.textTranscript) {
            const currentText = this.streamingMessageSubject.value;
            this.streamingMessageSubject.next(currentText + part.textTranscript);
          }
          
          // Check if contains audio
          if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
            hasAudio = true;
          }
        }
        
        // Track if this message has audio
        if (hasAudio) {
          // Add this info to the current message metadata
          const messages = this.messagesSubject.value;
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.hasAudio = true;
              this.messagesSubject.next([...messages]);
            }
          }
        }
      }
      
      // Handle turn completion
      if (content.turnComplete) {
        const streamedContent = this.streamingMessageSubject.value;
        if (streamedContent) {
          this.addMessage('assistant', streamedContent);
          this.streamingMessageSubject.next('');
        }
      }
    });
  }
  
  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }
  
  /**
   * Add a new message to the chat
   */
  addMessage(role: 'user' | 'assistant', content: string): void {
    const messages = [...this.messagesSubject.value];
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    
    messages.push(newMessage);
    this.messagesSubject.next(messages);
  }
  
  /**
   * Send a user message to the Gemini service
   */
  sendMessage(content: string): void {
    if (!content.trim()) return;
    
    // Add message to local state
    this.addMessage('user', content);
    
    // Send to Gemini service
    this.multimodalLiveService.send({ text: content });
  }
  
  /**
   * Clear all chat messages
   */
  clearChat(): void {
    this.messagesSubject.next([]);
    this.streamingMessageSubject.next('');
  }
  
  /**
   * Get current streaming message (assistant response in progress)
   */
  getStreamingMessage(): string {
    return this.streamingMessageSubject.value;
  }
}