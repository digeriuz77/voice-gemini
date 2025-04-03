import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  avatar?: string;
  modifiers?: string[];
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

    // Subscribe to transcription updates
    this.multimodalLiveService.transcription$.subscribe(transcription => {
      if(transcription) {
        this.processUserMessage(transcription, 'default', []);
      }
    });
    this.multimodalLiveService.content$.subscribe(content => {
      if (!content) return;
      
      // Handle model turn data (streaming)
      if (content.modelTurn && content.modelTurn.parts) {
        const parts = content.modelTurn.parts;
        for (const part of parts) {
          if (part.text) {
            this.streamingMessageSubject.next(part.text);
            const currentMessages = this.messagesSubject.value;
            let hasAudio = false;
            // Check if contains audio
            if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
                hasAudio = true;
            }
            // Track if this message has audio
            if (hasAudio && currentMessages.length > 0) {
                const lastMessage = currentMessages[currentMessages.length - 1];
                if (lastMessage.role === 'assistant') {
                    lastMessage.hasAudio = true;
                    this.messagesSubject.next([...currentMessages]);
                }
            }
          }
        }
      }
      
      // Handle turn completion
      if (content.turnComplete) {
        if(this.streamingMessageSubject.value) {
          this.addMessage(        
            'assistant',
            this.streamingMessageSubject.value
          )
          this.streamingMessageSubject.next("")
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
   * Centralized handling of user messages
   *  Adding to history, then sending to Gemini service.
   *  This method is now the single entry point for user messages.
   */
  private processUserMessage(content: string, avatar: string, modifiers: string[]): void {
    const messages = [...this.messagesSubject.value];
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      avatar,
      modifiers,
      content,
      timestamp: new Date(),
    };
    messages.push(newMessage);
    this.messagesSubject.next(messages);
    this.multimodalLiveService.send({ text: content });
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
    // Call the new method to process the user message
    this.processUserMessage(content, 'default', []);
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