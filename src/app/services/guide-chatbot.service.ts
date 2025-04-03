import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';
import { UserService } from './user.service';
import { AccessibilityService } from './accessibility.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GuideChatbotService {
  private initialized: boolean = false;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  
  private isProcessingSubject = new BehaviorSubject<boolean>(false);
  isProcessing$ = this.isProcessingSubject.asObservable();
  
  constructor(
    private multimodalLiveService: MultimodalLiveService,
    private userService: UserService,
    private accessibilityService: AccessibilityService
  ) {}
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    const ageGroup = this.userService.getUserAgeGroup();
    const systemInstruction = this.getSystemInstructionForAgeGroup(ageGroup);
    
    this.isProcessingSubject.next(true);
    
    try {
      await this.multimodalLiveService.connect({
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
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
              text: systemInstruction,
            },
          ],
        }
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing guide chatbot:', error);
    } finally {
      this.isProcessingSubject.next(false);
    }
  }
  
  private getSystemInstructionForAgeGroup(ageGroup: 'early' | 'middle' | 'teen'): string {
    if (ageGroup === 'early') {
      return `
        You are a friendly, encouraging guide named Lexi for young children ages 5-10 using a dyslexia screening app.
        
        Speak in simple, clear language appropriate for young children. Use short sentences and familiar words.
        Be very encouraging and positive. Praise effort, not just results.
        Explain each activity in a fun, engaging way that makes it feel like a game, not a test.
        If the child seems confused or frustrated, offer simple, step-by-step guidance.
        Use a warm, friendly tone throughout all interactions.
        
        Remember that young children may have short attention spans, so keep explanations brief.
        Use plenty of positive reinforcement like "Great job!" and "You're doing amazing!"
        Avoid using technical terms about dyslexia or learning difficulties.
        Frame challenges as adventures or puzzles to solve.
      `;
    } else if (ageGroup === 'middle') {
      return `
        You are a friendly, supportive guide named Lexi for children ages 8-10 using a dyslexia screening app.
        
        Use clear, straightforward language that's appropriate for elementary school students.
        Be encouraging and positive, but not overly childish.
        Explain activities clearly, with just enough detail to help them understand what to do.
        If they seem confused, break down instructions into smaller steps.
        Maintain a supportive, patient tone throughout all interactions.
        
        Acknowledge their effort with specific praise like "I noticed how carefully you worked on that!"
        Explain the purpose of activities in simple terms they can understand.
        Use occasional humor to keep engagement high.
        Remind them it's okay to take their time and that everyone learns differently.
      `;
    } else {
      return `
        You are a supportive, respectful guide named Lexi for students ages 11-16 using a dyslexia screening app.
        
        Use clear, age-appropriate language without talking down to them.
        Be encouraging but straightforward - teens appreciate authenticity.
        Explain the purpose behind each activity so they understand why they're doing it.
        If they seem frustrated, acknowledge it and offer specific strategies to help.
        Maintain a respectful, supportive tone that recognizes their growing independence.
        
        Avoid overly childish language or excessive enthusiasm that might seem patronizing.
        Acknowledge that these activities can be challenging and that's completely normal.
        Explain how the results might help them understand their learning style better.
        Emphasize that everyone's brain works differently, and the goal is to find strategies that work for them.
      `;
    }
  }

  async introduceScreening(): Promise<void> { // Changed return type
    await this.initialize();

    const ageGroup = this.userService.getUserAgeGroup();
    let introMessage = '';
    
    if (ageGroup === 'early') {
      introMessage = "Hi there! I'm Lexi, and I'm going to be your guide for some fun activities today! We're going to play some games with letters, words, and pictures. These games will help us learn about how your amazing brain works with reading. Are you ready to start our adventure?";
    } else if (ageGroup === 'middle') {
      introMessage = "Hi there! I'm Lexi, and I'll be your guide through these activities. We're going to do some interesting exercises with words, patterns, and memory games. These will help us understand more about how you learn and process information. Ready to get started?";
    } else {
      introMessage = "Hello! I'm Lexi, and I'll be guiding you through this screening process. We'll be working through several activities that test different skills related to reading and information processing. The goal is to better understand your learning style and identify any areas where specific strategies might help. Ready to begin?";
    }

    this.sendMessage(introMessage); // Call void method
    // Removed return response;
  }

  async explainActivity(activityId: string): Promise<void> { // Changed return type
    await this.initialize();

    const ageGroup = this.userService.getUserAgeGroup();
    let explanation = '';
    
    // Activity-specific explanations based on age group
    switch (activityId) {
      case 'letterReversal':
        if (ageGroup === 'early') {
          explanation = "Now we're going to play a letter detective game! Some letters like to play tricks and turn around. Your job is to find all the letter b's hiding in the group. Tap on each b you find!";
        } else if (ageGroup === 'middle') {
          explanation = "In this activity, you'll be a letter detective! Your job is to find specific letters in a group and identify any that appear backwards or flipped. This helps us understand how you see and process letters.";
        } else {
          explanation = "In this activity, you'll be identifying specific letters and looking for any that appear reversed. This helps us understand visual processing of letters and symbols, which is an important part of reading.";
        }
        break;
        
      case 'patternMatching':
        if (ageGroup === 'early') {
          explanation = "Let's play a matching game! Look at the pattern on top, then find the one below that matches it exactly. It's like a puzzle where you need to find the perfect match!";
        } else if (ageGroup === 'middle') {
          explanation = "This activity is all about finding patterns. You'll see a pattern at the top, and your job is to find the matching pattern from the options below. This helps us understand how you process visual information.";
        } else {
          explanation = "This pattern matching activity tests visual discrimination - how well you can identify matching patterns and spot differences between similar items. This skill is important for efficient reading.";
        }
        break;
        
      case 'visualMemory':
        if (ageGroup === 'early') {
          explanation = "Now we're going to play a memory game! I'll show you a picture for a few seconds. Try to remember what it looks like, because then it will disappear and you'll need to recreate it. It's like a magic trick for your brain!";
        } else if (ageGroup === 'middle') {
          explanation = "This is a visual memory challenge. You'll see a pattern briefly, and then you'll need to recreate it from memory. This helps us understand how well you can remember and reproduce visual information.";
        } else {
          explanation = "This activity tests visual working memory - your ability to hold and manipulate visual information in your mind. You'll be shown patterns briefly and asked to reproduce them, which helps assess memory skills important for reading.";
        }
        break;
        
      case 'rhymeDetection':
        if (ageGroup === 'early') {
          explanation = "Let's play a rhyming game! Words that rhyme sound the same at the end, like 'cat' and 'hat'. I'll show you a word, and you need to find all the words that rhyme with it. It's like finding word families!";
        } else if (ageGroup === 'middle') {
          explanation = "In this activity, you'll be identifying words that rhyme with a target word. Rhyming helps us understand how well you can recognize similar sound patterns in words, which is important for reading.";
        } else {
          explanation = "This phonological awareness activity focuses on rhyme detection. You'll identify words that share the same ending sounds, which helps assess how you process and manipulate the sounds in language.";
        }
        break;
        
      case 'directionalConcepts':
        if (ageGroup === 'early') {
          explanation = "Now we're going to play with directions! I'll ask you to draw lines in different ways - up and down, side to side, or slanted. This helps us see how you understand directions in space.";
        } else if (ageGroup === 'middle') {
          explanation = "This activity tests your understanding of directional concepts like vertical, horizontal, and diagonal. You'll be drawing lines in different orientations on shapes.";
        } else {
          explanation = "This activity assesses spatial and directional awareness. You'll demonstrate your understanding of concepts like vertical, horizontal, and diagonal by drawing lines in specific orientations.";
        }
        break;
        
      case 'wordRecognition':
        if (ageGroup === 'early') {
          explanation = "Let's play a word finding game! I'll show you a special word, and you need to find it hiding in a group of other words. It's like a word treasure hunt!";
        } else if (ageGroup === 'middle') {
          explanation = "In this activity, you'll be identifying specific words among similar-looking words. This helps us understand how you recognize and process words while reading.";
        } else {
          explanation = "This word recognition activity assesses how efficiently you can identify target words among distractors, which is a key component of reading fluency.";
        }
        break;
        
      case 'auditoryMemory':
        if (ageGroup === 'early') {
          explanation = "Now we're going to play a listening game! I'll say some words, and you need to repeat them back to me in the same order. It's like a game of copy-cat, but with your ears and voice!";
        } else if (ageGroup === 'middle') {
          explanation = "This is an auditory memory challenge. I'll say a sequence of words, and you'll need to repeat them back in the same order. This helps us understand how well you can remember what you hear.";
        } else {
          explanation = "This activity tests auditory working memory - your ability to hold and recall spoken information. You'll hear sequences of words and need to repeat them in order, which is important for processing verbal instructions.";
        }
        break;
        
      case 'questionnaire':
        if (ageGroup === 'early') {
          explanation = "Now I'm going to ask you some questions about reading and school. There are no right or wrong answers - I just want to learn about how you learn! Just tell me what you think.";
        } else if (ageGroup === 'middle') {
          explanation = "I'm going to ask you some questions about your experiences with reading and learning. This helps us understand how you learn best. There are no right or wrong answers, just share what's true for you.";
        } else {
          explanation = "I'd like to ask you some questions about your experiences with reading, writing, and learning. Your honest responses will help us understand your learning style better. This is not a test, and there are no right or wrong answers.";
        }
        break;
        
      default:
        if (ageGroup === 'early') {
          explanation = "Let's try a fun activity! I'll explain what to do step by step. Just do your best and remember, it's okay if some parts feel tricky!";
        } else if (ageGroup === 'middle') {
          explanation = "We're going to try an activity that helps us understand more about how you learn. I'll explain what to do, and you just try your best.";
        } else {
          explanation = "This activity is designed to help us better understand specific aspects of how you process information. I'll provide instructions, and you can ask questions if anything isn't clear.";
        }
    }

    this.sendMessage(explanation); // Call void method
    // Removed return response;
  }

  async provideFeedback(activityId: string, performance: 'good' | 'average' | 'struggling'): Promise<void> { // Changed return type
    await this.initialize();

    const ageGroup = this.userService.getUserAgeGroup();
    let feedback = '';
    
    // Generic feedback based on performance and age group
    if (performance === 'good') {
      if (ageGroup === 'early') {
        feedback = "Wow! You did an amazing job! Your brain is working so well with these puzzles!";
      } else if (ageGroup === 'middle') {
        feedback = "Great work! You showed really good skills on that activity.";
      } else {
        feedback = "Excellent work. You demonstrated strong skills in that area.";
      }
    } else if (performance === 'average') {
      if (ageGroup === 'early') {
        feedback = "Good job finishing that activity! Some parts might have been tricky, and that's totally okay!";
      } else if (ageGroup === 'middle') {
        feedback = "Good effort on that activity. Some parts might have been challenging, which is completely normal.";
      } else {
        feedback = "Good work completing that section. Everyone finds different aspects challenging, which is perfectly normal.";
      }
    } else {
      if (ageGroup === 'early') {
        feedback = "Thank you for trying so hard! Some puzzles can be really tricky, and that's okay. Everyone's brain works differently!";
      } else if (ageGroup === 'middle') {
        feedback = "Thanks for working through that activity. Some of these tasks can be challenging, and that's completely normal. Everyone has different strengths.";
      } else {
        feedback = "Thanks for persevering through that activity. These tasks are designed to identify areas that might be challenging, so it's entirely normal to find some sections difficult.";
      }
    }

    this.sendMessage(feedback); // Call void method
    // Removed return response;
  }

  async summarizeResults(riskLevel: 'Low' | 'Moderate' | 'High'): Promise<void> { // Changed return type
    await this.initialize();

    const ageGroup = this.userService.getUserAgeGroup();
    let summary = '';
    
    if (ageGroup === 'early') {
      if (riskLevel === 'Low') {
        summary = "You did a fantastic job with all our games today! Your brain is doing really well with letters and words. Remember, everyone learns in their own special way, and you have lots of strengths!";
      } else {
        summary = "Thank you for playing all these games with me today! You tried so hard, and that's what matters most. Everyone's brain works differently, and these activities help us understand how you learn best. Your grown-ups will get some ideas about ways to make reading and learning even more fun for you!";
      }
    } else if (ageGroup === 'middle') {
      if (riskLevel === 'Low') {
        summary = "Great job completing all the activities! You showed strong skills across most areas. Remember that everyone has their own learning style, and these activities help us understand yours better.";
      } else {
        summary = "Thank you for completing all the activities! These exercises help us understand how you process information and learn best. Everyone has different strengths and challenges, and this screening helps identify strategies that might work well for you. Your results will include some helpful suggestions for learning.";
      }
    } else {
      if (riskLevel === 'Low') {
        summary = "You've successfully completed the screening process. Your results indicate strong performance across most skill areas. Remember that understanding your learning style can help you leverage your strengths effectively.";
      } else {
        summary = "Thank you for completing the screening process. These activities help identify patterns in how you process information, which can lead to effective learning strategies. Everyone's brain processes information differently, and these results will help identify approaches that might work best for you. Remember that this is a screening tool, not a diagnosis, and the report will include practical recommendations.";
      }
    }

    this.sendMessage(summary); // Call void method
    // Removed return response;
  }

  // Modified sendMessage: Now just displays/speaks locally, doesn't interact with backend
  // Changed return type to void
  sendMessage(message: string): void {
    // No longer needs to initialize or connect for just speaking locally
    // await this.initialize();

    // No longer needs processing state for local-only action
    // this.isProcessingSubject.next(true);

    // Add assistant message to history
    this.addMessage('assistant', message);
    
    // Read message aloud if auto-audio is enabled
    if (this.accessibilityService.shouldAutoPlayAudio()) {
      this.accessibilityService.speak(message);
    }

    // --- Removed backend interaction ---
    // No longer sending to multimodalLiveService
    // No longer waiting for turnComplete
    // No longer setting/unsetting processing state here
    // --- End Removal ---
  }


  // This method might be redundant now if user responses aren't sent to the guide bot
  async processUserResponse(response: string): Promise<void> {
    // Add user message to history
    this.addMessage('user', response);
    
    // In a more complex implementation, we could analyze the response
    // and generate a contextual reply
  }
  
  private addMessage(role: 'user' | 'assistant', content: string) {
    const messages = [...this.messagesSubject.value];
    
    messages.push({
      role,
      content,
      timestamp: new Date()
    });
    
    this.messagesSubject.next(messages);
  }
  
  clearMessages() {
    this.messagesSubject.next([]);
  }
  
  disconnect() {
    if (this.initialized) {
      this.multimodalLiveService.disconnect();
      this.initialized = false;
    }
  }
}
