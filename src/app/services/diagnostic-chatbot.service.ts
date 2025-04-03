import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs'; // Import Subscription
import { MultimodalLiveService } from '../../gemini/gemini-client.service';
import { UserService } from './user.service';
import { AssessmentService } from './assessment.service';
import { AccessibilityService } from './accessibility.service';

export interface QuestionnaireItem {
  id: string;
  question: string;
  responseOptions?: string[];
  nextQuestionMap?: { [response: string]: string };
  respondent: 'user' | 'parent';
}

export interface QuestionnaireResponse {
  questionId: string;
  question: string;
  answer: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticChatbotService {
  private initialized: boolean = false;
  private currentQuestionIndex: number = 0; // Start at 0
  private responses: QuestionnaireResponse[] = [];

  private messagesSubject = new BehaviorSubject<{ role: string, content: string }[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private isProcessingSubject = new BehaviorSubject<boolean>(false);
  isProcessing$ = this.isProcessingSubject.asObservable();

  private isCompleteSubject = new BehaviorSubject<boolean>(false);
  isComplete$ = this.isCompleteSubject.asObservable();

  // Store subscriptions to manage them properly
  private contentSubscription: Subscription | undefined;
  private analysisContentSubscription: Subscription | undefined;
  private transcriptionSubscription: Subscription | undefined; // Add subscription for transcriptions


  constructor(
    private multimodalLiveService: MultimodalLiveService,
    private userService: UserService,
    private assessmentService: AssessmentService,
    private accessibilityService: AccessibilityService
  ) {
      // Subscribe to transcriptions coming from the live service
      // We do this once in the constructor, the service persists
      this.subscribeToTranscriptions();
  }

  private subscribeToTranscriptions(): void {
      if (this.transcriptionSubscription) {
          this.transcriptionSubscription.unsubscribe(); // Unsubscribe previous if any
      }
      this.transcriptionSubscription = this.multimodalLiveService.transcription$.subscribe(transcript => {
          // Only process non-empty transcripts and if the service is initialized and not already processing
              // Also check if the transcript isn't empty or just whitespace
              const trimmedTranscript = transcript ? transcript.trim() : '';
              if (trimmedTranscript && this.initialized && !this.isProcessingSubject.value) {
                  console.log('DiagnosticChatbotService received transcription:', trimmedTranscript);
                  // Check if this transcript is the same as the last assistant message (prevent echo processing)
                  const currentMessages = this.messagesSubject.value;
                  const lastMessage = currentMessages[currentMessages.length - 1];
                  if (lastMessage?.role === 'assistant' && lastMessage?.content === trimmedTranscript) {
                      console.log('Skipping processing of echoed assistant message.');
                      return;
                  }

                  // Process the transcript as if it were user input from the text box
                  // Add a small delay to prevent potential race conditions with state updates
                  setTimeout(() => {
                      if (!this.isProcessingSubject.value) { // Double-check processing state
                         console.log('Processing transcription via processResponse');
                         // Pass 'transcription' source to avoid re-sending
                         this.processResponse(trimmedTranscript, 'transcription');
                      } else {
                         console.log('Skipping transcription processing because isProcessing is true.');
                      }
                  }, 100); // Increased delay slightly
          }
      });
      console.log("Subscribed to transcriptions.");
  }


  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.isProcessingSubject.next(true);

    try {
      await this.multimodalLiveService.connect({
        model: "models/gemini-2.0-flash-exp", // Changed model name
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
        systemInstruction: {
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
            },
          ],
        }
      });

      this.initialized = true;
      this.currentQuestionIndex = 0; // Reset index on successful initialization
      this.responses = [];
      this.isCompleteSubject.next(false);
      this.clearMessages(); // Clear messages from previous sessions
      // No need to re-subscribe here, constructor handles it once.
    } catch (error) {
      console.error('Error initializing diagnostic chatbot:', error);
      this.initialized = false; // Ensure initialized is false on error
    } finally {
      this.isProcessingSubject.next(false);
    }
  }

  async startQuestionnaire(): Promise<void> {
    // Ensure initialization before starting
    if (!this.initialized) {
       await this.initialize();
       // Check again if initialization failed
       if (!this.initialized) {
         console.error("Cannot start questionnaire: Initialization failed.");
         // Optionally add an error message for the user
         this.addMessage('assistant', 'Sorry, I couldn\'t start the questionnaire due to an initialization error.');
         return;
       }
    }


    const ageGroup = this.userService.getUserAgeGroup();
    const userName = this.userService.getUserInfo().name || 'there';

    let introMessage = '';

    if (ageGroup === 'early') {
      introMessage = `Hi ${userName}! I'd like to ask you some questions about reading and school. There are no right or wrong answers - I just want to learn about how you learn! Is that okay?`;
    } else if (ageGroup === 'middle') {
      introMessage = `Hi ${userName}! I'm going to ask you some questions about your experiences with reading and learning. This helps us understand how you learn best. There are no right or wrong answers, just share what's true for you. Ready to start?`;
    } else {
      introMessage = `Hello ${userName}. I'd like to ask you some questions about your experiences with reading, writing, and learning. Your honest responses will help us understand your learning style better. This is not a test, and there are no right or wrong answers. Shall we begin?`;
    }

    // Add intro message but don't send to Gemini yet, just display/speak
    this.addMessage('assistant', introMessage);
    if (this.accessibilityService.shouldAutoPlayAudio()) {
      this.accessibilityService.speak(introMessage);
    }

    // Reset index before starting questions
    this.currentQuestionIndex = 0;
    this.responses = [];
    this.isCompleteSubject.next(false);

    // Ask the *first* question (index 0)
    await this.askNextQuestion();
  }

  // Added optional source parameter
  async processResponse(response: string, source: 'textInput' | 'transcription' = 'textInput'): Promise<void> {
    if (!this.initialized) {
        console.error("Cannot process response: Service not initialized.");
        return;
     }
    // Prevent processing if already processing OR if the response is empty
    if (!response || !response.trim() || this.isProcessingSubject.value) {
        console.warn("Skipping processResponse. Already processing or empty response:", response, "Processing:", this.isProcessingSubject.value);
        // Ensure processing is false if we skip due to empty response but weren't processing
        if (!response || !response.trim()) {
             this.isProcessingSubject.next(false);
        }
        return;
    }
    console.log(`processResponse called with source: ${source}, processing set to true.`);
    this.isProcessingSubject.next(true);

    try {
      // Check if the last message is identical to prevent double processing
       const currentMessages = this.messagesSubject.value;
       const lastMessage = currentMessages[currentMessages.length - 1];
       if (lastMessage?.role === 'user' && lastMessage?.content === response) {
           console.warn("Skipping duplicate user response:", response);
           this.isProcessingSubject.next(false); // Release lock
           return;
       }

      // Add user response to messages only if it's new (check last message?)
      // For simplicity, let's add it for now, but might need refinement if duplicates appear
      this.addMessage('user', response);

      // Store the response for the *current* question
      const questions = this.getQuestions(this.userService.getUserAgeGroup());
      if (this.currentQuestionIndex < questions.length) { // Check if index is valid
        const currentQuestion = questions[this.currentQuestionIndex];
        this.responses.push({
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer: response,
          timestamp: new Date()
        });

         // Send user response (text OR transcribed audio) to Gemini *after* storing it locally
         // We wrap the user text in a Part object
         // Only send if the source was text input (not transcription)
         if (source === 'textInput') {
            console.log(`Processing response from text input [${response}], sending to backend.`);
            await this.multimodalLiveService.send({ text: response });
         } else {
            console.log(`Processing response from transcription [${response}], NOT sending back to backend.`);
            // If it's from transcription, the backend already processed it.
            // We just need to advance the state locally.
         }


      } else {
         console.warn("Attempted to process response for index out of bounds:", this.currentQuestionIndex);
      }

      // Increment index *after* processing the response and potentially sending it
      this.currentQuestionIndex++;

      // Check if there are more questions based on the *new* index
      if (this.currentQuestionIndex < questions.length) {
        // The backend should respond with the next question after receiving the user's text/audio.
        // We wait for the backend's response (which includes audio and potentially the next question text).
        // The assistant's audio is played by gemini-client.service.
        // The assistant's text is added via sendMessageAndSpeak if needed, or handled by backend response.
        // Let's assume the backend sends the next question implicitly.
        console.log("Waiting for backend response for next question...");
      } else {
        // If no more questions, finish up.
        await this.finishQuestionnaire();
      }
    } catch (error) {
       console.error("Error processing response:", error);
       // Optionally add an error message for the user
       this.addMessage('assistant', 'Sorry, there was an error processing your response.');
    } finally {
      // Release processing lock *after* potential async operations within the try block complete
      // or if an error occurs.
      console.log(`processResponse finished for source: ${source}, processing set to false.`);
      this.isProcessingSubject.next(false);
    }
  }

  // This function might only be needed for the *first* question now,
  // if the backend sends subsequent questions automatically.
  private async askNextQuestion(): Promise<void> {
     if (!this.initialized) {
        console.error("Cannot ask question: Service not initialized.");
        return;
     }
    const questions = this.getQuestions(this.userService.getUserAgeGroup());
    // Use currentQuestionIndex directly
    if (this.currentQuestionIndex < questions.length) {
      const question = questions[this.currentQuestionIndex];
      // Send the question text to Gemini and speak it
      // This assumes we *need* to send the question text to get the backend to speak it.
      // If the backend speaks automatically after receiving user input, this might cause duplicates.
      await this.sendMessageAndSpeak(question.question);
    } else {
      console.warn("askNextQuestion called but index is out of bounds:", this.currentQuestionIndex);
    }
  }

  private async finishQuestionnaire(): Promise<void> {
     if (!this.initialized) {
        console.error("Cannot finish questionnaire: Service not initialized.");
        return;
     }
    // Thank the user
    const ageGroup = this.userService.getUserAgeGroup();
    let thankYouMessage = '';

    if (ageGroup === 'early') {
      thankYouMessage = "Thank you so much for answering all my questions! You did a great job!";
    } else if (ageGroup === 'middle') {
      thankYouMessage = "Thank you for answering all these questions. You've been really helpful!";
    } else {
      thankYouMessage = "Thank you for completing the questionnaire. Your responses will help us better understand your learning profile.";
    }

    // --- Modification: Don't send thank you via multimodal service ---
    // Display locally and speak directly
    this.addMessage('assistant', thankYouMessage);
    if (this.accessibilityService.shouldAutoPlayAudio()) {
      this.accessibilityService.speak(thankYouMessage);
    }
    // --- End Modification ---

    // Analyze responses (this saves the result, doesn't speak it)
    await this.analyzeResponses();

    // Mark as complete
    this.isCompleteSubject.next(true);
  }

  private async analyzeResponses(): Promise<void> {
     if (!this.initialized) {
        console.error("Cannot analyze responses: Service not initialized.");
        return;
     }
    // Prepare analysis prompt
    const analysisPrompt = `
      As a dyslexia screening specialist, analyze the following questionnaire responses:

      ${this.responses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}

      Based on these responses, identify potential indicators of dyslexia or other reading difficulties.
      Organize your analysis by categories (reading fluency, comprehension, writing, etc.).
      Note both strengths and challenges indicated in the responses.
      Provide a brief summary of key findings.

      Remember this is a screening, not a diagnosis.
    `;

    try {
        // Get analysis from Gemini
        const analysis = await this.getGeminiAnalysis(analysisPrompt);

        // Save results
        this.assessmentService.saveResult('questionnaire', {
          responses: this.responses,
          analysis
        });
    } catch (error) {
        console.error("Error during response analysis:", error);
        // Optionally inform the user about the analysis error
        this.addMessage('assistant', 'Sorry, I encountered an error while analyzing the responses.');
    }
  }

  getQuestions(ageGroup: 'early' | 'middle' | 'teen'): QuestionnaireItem[] {
    // Early questions
    if (ageGroup === 'early') {
      return [
        {
          id: 'early-1',
          question: "Do you like when someone reads stories to you?",
          respondent: 'user'
        },
        {
          id: 'early-2',
          question: "Do you find it hard to remember the alphabet?",
          respondent: 'user'
        },
        {
          id: 'early-3',
          question: "Do you mix up letters that look similar, like b and d?",
          respondent: 'user'
        },
        {
          id: 'early-4',
          question: "Do you find it hard to rhyme words, like cat and hat?",
          respondent: 'user'
        },
        {
          id: 'early-5',
          question: "Do you sometimes read words backward, like 'was' instead of 'saw'?",
          respondent: 'user'
        },
        {
          id: 'early-6',
          question: "Do you find it hard to remember what you just read?",
          respondent: 'user'
        },
        {
          id: 'early-7',
          question: "Do you get tired or get headaches when you read?",
          respondent: 'user'
        },
        {
          id: 'early-8',
          question: "Do you prefer to draw pictures instead of writing words?",
          respondent: 'user'
        },
        {
          id: 'early-9',
          question: "Do you find it hard to tell left from right?",
          respondent: 'user'
        },
        {
          id: 'early-10',
          question: "Do you find it hard to follow directions with multiple steps?",
          respondent: 'user'
        }
      ];
    }
    // Middle questions
    else if (ageGroup === 'middle') {
      return [
        {
          id: 'middle-1',
          question: "How do you feel about reading out loud in class?",
          respondent: 'user'
        },
        {
          id: 'middle-2',
          question: "Do you find it takes you longer to read than your classmates?",
          respondent: 'user'
        },
        {
          id: 'middle-3',
          question: "Do you sometimes skip lines or lose your place when reading?",
          respondent: 'user'
        },
        {
          id: 'middle-4',
          question: "Do you find it hard to spell words correctly?",
          respondent: 'user'
        },
        {
          id: 'middle-5',
          question: "Do you mix up the order of letters or numbers sometimes?",
          respondent: 'user'
        },
        {
          id: 'middle-6',
          question: "Do you find it hard to take notes while the teacher is talking?",
          respondent: 'user'
        },
        {
          id: 'middle-7',
          question: "Do you prefer to explain your answers out loud rather than writing them down?",
          respondent: 'user'
        },
        {
          id: 'middle-8',
          question: "Do you find it hard to finish tests in the given time?",
          respondent: 'user'
        },
        {
          id: 'middle-9',
          question: "Do you sometimes know what you want to say but have trouble finding the right words?",
          respondent: 'user'
        },
        {
          id: 'middle-10',
          question: "Do you find it easier to learn when you can see pictures or watch demonstrations?",
          respondent: 'user'
        }
      ];
    }
    // Teen questions
    else {
      return [
        {
          id: 'teen-1',
          question: "How would you describe your reading speed compared to your peers?",
          respondent: 'user'
        },
        {
          id: 'teen-2',
          question: "Do you find it challenging to read unfamiliar words or names?",
          respondent: 'user'
        },
        {
          id: 'teen-3',
          question: "How often do you need to re-read paragraphs to understand them?",
          respondent: 'user'
        },
        {
          id: 'teen-4',
          question: "Do you find it difficult to take notes during lectures or discussions?",
          respondent: 'user'
        },
        {
          id: 'teen-5',
          question: "How would you describe your spelling abilities?",
          respondent: 'user'
        },
        {
          id: 'teen-6',
          question: "Do you find it challenging to organize your thoughts when writing essays or longer texts?",
          respondent: 'user'
        },
        {
          id: 'teen-7',
          question: "How often do you mix up dates, times, or appointments?",
          respondent: 'user'
        },
        {
          id: 'teen-8',
          question: "Do you find it difficult to remember sequences of instructions?",
          respondent: 'user'
        },
        {
          id: 'teen-9',
          question: "How do you feel about reading aloud in front of others?",
          respondent: 'user'
        },
        {
          id: 'teen-10',
          question: "Do you find it helpful to use different colors, highlighters, or visual aids when studying?",
          respondent: 'user'
        },
        {
          id: 'teen-11',
          question: "Have you developed any specific strategies to help with reading or writing tasks?",
          respondent: 'user'
        },
        {
          id: 'teen-12',
          question: "How much extra time do you typically need to complete reading assignments compared to what's assigned?",
          respondent: 'user'
        }
      ];
    }
  }


  // Renamed from sendMessage to clarify its purpose: sends assistant message and speaks it.
  async sendMessageAndSpeak(message: string): Promise<void> {
     if (!this.initialized) {
        console.error("Cannot send message: Service not initialized.");
        return;
     }
    // Add message to chat history
    this.addMessage('assistant', message);

    // Read message aloud if auto-audio is enabled
    if (this.accessibilityService.shouldAutoPlayAudio()) {
      this.accessibilityService.speak(message);
    }

    // Use a promise to wait for Gemini's turn completion after *sending* the text
    // This assumes the backend needs the text to generate its own audio response.
    return new Promise<void>((resolve, reject) => {
      // Clean up previous subscription if any
      if (this.contentSubscription) {
        this.contentSubscription.unsubscribe();
        this.contentSubscription = undefined;
      }

      // Subscribe to content to know when message is complete
      this.contentSubscription = this.multimodalLiveService.content$.subscribe({
        next: (content) => {
          // We might receive multiple content updates per turn.
          // We resolve *only* when the turn is marked complete.
          if (content && content.turnComplete) {
            if (this.contentSubscription) {
              this.contentSubscription.unsubscribe();
              this.contentSubscription = undefined; // Clear subscription
            }
            resolve();
          }
          // Handle potential errors from the stream if needed
          if (content?.error) {
             console.error("Error from multimodalLiveService:", content.error);
             if (this.contentSubscription) {
               this.contentSubscription.unsubscribe();
               this.contentSubscription = undefined;
             }
             reject(new Error(content.error.message || 'Unknown error from Gemini service'));
          }
        },
        error: (err) => { // Handle errors in the observable stream itself
          console.error("Error subscribing to multimodalLiveService content$:", err);
          if (this.contentSubscription) {
            this.contentSubscription.unsubscribe();
            this.contentSubscription = undefined;
          }
          reject(err);
        }
      });

      // Send the message *text* to the backend after subscribing
      try {
         // We wrap the assistant text in a Part object before sending
         this.multimodalLiveService.send({ text: message });
      } catch (sendError) {
         console.error("Error sending message via multimodalLiveService:", sendError);
         if (this.contentSubscription) {
           this.contentSubscription.unsubscribe();
           this.contentSubscription = undefined;
         }
         reject(sendError);
      }
    });
  }

  private addMessage(role: string, content: string) {
    const currentMessages = this.messagesSubject.value;
    // Optional: Prevent adding duplicate consecutive messages
    // if (currentMessages.length > 0 &&
    //     currentMessages[currentMessages.length - 1].role === role &&
    //     currentMessages[currentMessages.length - 1].content === content) {
    //   return;
    // }
    this.messagesSubject.next([...currentMessages, { role, content }]);
  }


  private async getGeminiAnalysis(prompt: string): Promise<any> {
    // No changes needed here other than ensuring subscription is managed
    return new Promise<any>((resolve, reject) => {
      const analysisService = new MultimodalLiveService();

      // Clean up previous subscription if any
      if (this.analysisContentSubscription) {
        this.analysisContentSubscription.unsubscribe();
        this.analysisContentSubscription = undefined;
      }

      analysisService.connect({
         model: "models/gemini-2.0-flash-exp", // Changed model name
         generationConfig: {
           temperature: 0.2,
           maxOutputTokens: 2048,
         },
         systemInstruction: {
           parts: [
             {
               text: 'You are a dyslexia screening specialist analyzing questionnaire responses. Provide detailed, evidence-based insights organized by skill area. Be thorough but clear, using professional language while remaining accessible to parents and educators.',
             },
           ],
         }
      }).then(() => {
        // Subscribe to content
        this.analysisContentSubscription = analysisService.content$.subscribe({
          next: (content) => {
            if (content && content.turnComplete) {
              const analysisText = content.modelTurn?.parts?.[0]?.text || '';
              const structuredAnalysis = this.parseAnalysisIntoSections(analysisText);

              if (this.analysisContentSubscription) {
                this.analysisContentSubscription.unsubscribe();
                this.analysisContentSubscription = undefined; // Clear subscription
              }
              analysisService.disconnect();
              resolve(structuredAnalysis);
            }
            if (content?.error) {
               console.error("Error from analysisService:", content.error);
               if (this.analysisContentSubscription) {
                 this.analysisContentSubscription.unsubscribe();
                 this.analysisContentSubscription = undefined;
               }
               analysisService.disconnect();
               reject(new Error(content.error.message || 'Unknown error from Gemini analysis service'));
            }
          },
          error: (err) => {
            console.error("Error subscribing to analysisService content$:", err);
            if (this.analysisContentSubscription) {
              this.analysisContentSubscription.unsubscribe();
              this.analysisContentSubscription = undefined;
            }
            analysisService.disconnect();
            reject(err);
          }
        });

        // Send the prompt after subscribing
        try {
          analysisService.send({ text: prompt });
        } catch (sendError) {
          console.error("Error sending prompt via analysisService:", sendError);
          if (this.analysisContentSubscription) {
            this.analysisContentSubscription.unsubscribe();
            this.analysisContentSubscription = undefined;
          }
          analysisService.disconnect();
          reject(sendError);
        }

      }).catch(connectError => {
        console.error("Error connecting analysisService:", connectError);
        reject(connectError);
      });
    });
  }

  private parseAnalysisIntoSections(analysisText: string): any {
    // This is a simplified implementation
    // In a real implementation, we would parse the text more carefully

    const sections: {
      readingFluency: string;
      comprehension: string;
      writing: string;
      phonologicalAwareness: string;
      workingMemory: string;
      strengths: string[];
      challenges: string[];
      summary: string;
    } = {
      readingFluency: '',
      comprehension: '',
      writing: '',
      phonologicalAwareness: '',
      workingMemory: '',
      strengths: [],
      challenges: [],
      summary: ''
    };

    // Extract sections based on headings
    const readingFluencyMatch = analysisText.match(/Reading Fluency:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (readingFluencyMatch) sections.readingFluency = readingFluencyMatch[1].trim();

    const comprehensionMatch = analysisText.match(/Comprehension:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (comprehensionMatch) sections.comprehension = comprehensionMatch[1].trim();

    const writingMatch = analysisText.match(/Writing:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (writingMatch) sections.writing = writingMatch[1].trim();

    const phonologicalMatch = analysisText.match(/Phonological Awareness:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (phonologicalMatch) sections.phonologicalAwareness = phonologicalMatch[1].trim();

    const memoryMatch = analysisText.match(/Working Memory:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (memoryMatch) sections.workingMemory = memoryMatch[1].trim();

    // Extract strengths and challenges
    const strengthsMatch = analysisText.match(/Strengths:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (strengthsMatch) {
      const strengthsText = strengthsMatch[1].trim();
      sections.strengths = strengthsText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());
    }

    const challengesMatch = analysisText.match(/Challenges:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (challengesMatch) {
      const challengesText = challengesMatch[1].trim();
      sections.challenges = challengesText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());
    }

    // Extract summary
    const summaryMatch = analysisText.match(/Summary:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (summaryMatch) sections.summary = summaryMatch[1].trim();

    return {
      rawText: analysisText,
      ...sections
    };
  }


  isComplete(): boolean {
    return this.isCompleteSubject.value;
  }

  getCurrentQuestion(): string {
    const questions = this.getQuestions(this.userService.getUserAgeGroup());
    if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < questions.length) {
      return questions[this.currentQuestionIndex].question;
    }
    return '';
  }

  clearMessages() {
    this.messagesSubject.next([]);
  }

  reset() {
    this.currentQuestionIndex = 0;
    this.responses = [];
    this.messagesSubject.next([]);
    this.isCompleteSubject.next(false);
    // Don't disconnect here, might be called mid-session
  }

  disconnect() {
    if (this.initialized) {
      // Unsubscribe observers before disconnecting
      if (this.contentSubscription) {
        this.contentSubscription.unsubscribe();
        this.contentSubscription = undefined;
      }
       if (this.analysisContentSubscription) {
        this.analysisContentSubscription.unsubscribe();
        this.analysisContentSubscription = undefined;
      }
      if (this.transcriptionSubscription) { // Unsubscribe transcription listener
        this.transcriptionSubscription.unsubscribe();
        this.transcriptionSubscription = undefined;
      }

      this.multimodalLiveService.disconnect();
      this.initialized = false;
    }
  }
}
