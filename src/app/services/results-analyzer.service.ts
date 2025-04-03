import { Injectable } from '@angular/core';
import { AssessmentService } from './assessment.service';
import { UserService } from './user.service';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';

export interface AnalysisResult {
  preliminaryScore: {
    mistakeCount: number;
    threshold: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
  };
  skillAreas: {
    name: string;
    score: number;
    description: string;
    status: 'strength' | 'average' | 'challenge';
  }[];
  strengths: string[];
  challenges: string[];
  recommendations: {
    nextSteps: string[];
    accommodations: string[];
    activities: string[];
  };
  summary: string;
  rawAnalysis: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultsAnalyzerService {
  constructor(
    private assessmentService: AssessmentService,
    private userService: UserService
  ) {}
  
  async analyzeResults(): Promise<AnalysisResult> {
    // Collect all assessment results
    const results = {
      letterReversal: this.assessmentService.getResult('letterReversal'),
      patternMatching: this.assessmentService.getResult('patternMatching'),
      visualMemory: this.assessmentService.getResult('visualMemory'),
      rhymeDetection: this.assessmentService.getResult('rhymeDetection'),
      directionalConcepts: this.assessmentService.getResult('directionalConcepts'),
      wordRecognition: this.assessmentService.getResult('wordRecognition'),
      auditoryMemory: this.assessmentService.getResult('auditoryMemory'),
      questionnaire: this.assessmentService.getResult('questionnaire')
    };
    
    // Get user info
    const userInfo = this.userService.getUserInfo();
    
    // Calculate preliminary score based on traditional test scoring
    const preliminaryScore = this.calculatePreliminaryScore(results, userInfo.age || 10);
    
    // Prepare data for Gemini analysis
    const analysisPrompt = this.prepareAnalysisPrompt(results, userInfo, preliminaryScore);
    
    // Send to Gemini for analysis
    const analysis = await this.getGeminiAnalysis(analysisPrompt);
    
    // Process the analysis into a structured format
    const processedAnalysis = this.processAnalysis(analysis, preliminaryScore);
    
    return processedAnalysis;
  }
  
  private calculatePreliminaryScore(results: any, age: number): { mistakeCount: number; threshold: number; riskLevel: 'Low' | 'Moderate' | 'High' } {
    // Calculate a preliminary score based on traditional test scoring
    // This follows the guidelines from the traditional test:
    // Kindergarten to 1st grade: 10 mistakes
    // Grades 2-4: 7 mistakes
    // Grades 5-8: 5 mistakes
    // Grades 9-higher: 3 mistakes
    
    // Count "mistakes" across assessments
    let mistakeCount = 0;
    
    // Count mistakes in letter reversal
    if (results.letterReversal) {
      mistakeCount += Math.round((1 - results.letterReversal.percentageCorrect / 100) * 3);
    }
    
    // Count mistakes in pattern matching
    if (results.patternMatching) {
      mistakeCount += Math.round((1 - results.patternMatching.percentageCorrect / 100) * 2);
    }
    
    // Count mistakes in visual memory
    if (results.visualMemory) {
      mistakeCount += Math.round((1 - results.visualMemory.averageAccuracy / 100) * 2);
    }
    
    // Count mistakes in rhyme detection
    if (results.rhymeDetection) {
      mistakeCount += Math.round((1 - results.rhymeDetection.percentageCorrect / 100) * 2);
    }
    
    // Count mistakes in directional concepts
    if (results.directionalConcepts) {
      mistakeCount += results.directionalConcepts.maxScore - results.directionalConcepts.score;
    }
    
    // Count mistakes in word recognition
    if (results.wordRecognition) {
      mistakeCount += Math.round((1 - results.wordRecognition.percentageCorrect / 100) * 3);
    }
    
    // Count mistakes in auditory memory
    if (results.auditoryMemory) {
      mistakeCount += Math.round((1 - results.auditoryMemory.averageAccuracy / 100) * 3);
    }
    
    // Determine threshold based on age
    let threshold = 10; // Default for youngest
    
    if (age >= 7 && age <= 9) {
      threshold = 7; // Grades 2-4
    } else if (age >= 10 && age <= 13) {
      threshold = 5; // Grades 5-8
    } else if (age >= 14) {
      threshold = 3; // Grades 9+
    }
    
    // Determine risk level
    let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
    if (mistakeCount >= threshold) {
      riskLevel = 'High';
    } else if (mistakeCount >= threshold * 0.7) {
      riskLevel = 'Moderate';
    }
    
    return {
      mistakeCount,
      threshold,
      riskLevel
    };
  }
  
  private prepareAnalysisPrompt(results: any, userInfo: any, preliminaryScore: any): string {
    // Create a detailed prompt for Gemini to analyze
    return `
      As a dyslexia screening specialist, analyze the following assessment results for a ${userInfo.age || 'school-age'}-year-old student.
      
      ASSESSMENT RESULTS:
      
      1. Letter Reversal Detection:
      ${JSON.stringify(results.letterReversal || 'Not completed')}
      
      2. Pattern Matching:
      ${JSON.stringify(results.patternMatching || 'Not completed')}
      
      3. Visual Memory:
      ${JSON.stringify(results.visualMemory || 'Not completed')}
      
      4. Rhyme Detection:
      ${JSON.stringify(results.rhymeDetection || 'Not completed')}
      
      5. Directional Concepts:
      ${JSON.stringify(results.directionalConcepts || 'Not completed')}
      
      6. Word Recognition:
      ${JSON.stringify(results.wordRecognition || 'Not completed')}
      
      7. Auditory Memory:
      ${JSON.stringify(results.auditoryMemory || 'Not completed')}
      
      8. Questionnaire Responses:
      ${JSON.stringify(results.questionnaire?.responses || 'Not completed')}
      
      9. Questionnaire Analysis:
      ${JSON.stringify(results.questionnaire?.analysis || 'Not completed')}
      
      Preliminary Score:
      ${JSON.stringify(preliminaryScore)}
      
      Based on these results, please provide:
      
      1. A comprehensive analysis of potential dyslexic traits, organized by skill area (visual processing, phonological awareness, memory, etc.)
      
      2. Specific strengths identified in the assessment
      
      3. Specific challenges identified in the assessment
      
      4. Recommendations for next steps, including:
         - Suggestions for formal evaluation if warranted
         - Specific accommodations that might help in school
         - Activities or exercises that could help strengthen identified weak areas
      
      5. A brief, encouraging summary for the student that emphasizes strengths while acknowledging challenges
      
      Important: This is a screening tool, not a diagnosis. Make this clear in your analysis.
    `;
  }
  
  private async getGeminiAnalysis(prompt: string): Promise<string> {
    // Use the MultimodalLiveService to get analysis from Gemini
    return new Promise<string>((resolve) => {
      // Create a new instance to avoid conflicts with other services
      const analysisService = new MultimodalLiveService();
      
      // Configure Gemini for analysis (not voice)
      analysisService.connect({
        model: "models/gemini-2.0-pro",
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
        systemInstruction: {
          parts: [
            {
              text: 'You are a dyslexia screening specialist providing analysis of assessment results. Provide detailed, evidence-based insights organized by skill area. Be thorough but clear, using professional language while remaining accessible to parents and educators. Remember to emphasize that screening is not diagnosis.',
            },
          ],
        }
      }).then(() => {
        // Subscribe to content
        const subscription = analysisService.content$.subscribe(content => {
          if (content && content.turnComplete) {
            // Extract the analysis text from the response
            const analysisText = content.modelTurn?.parts?.[0]?.text || '';
            
            // Clean up
            subscription.unsubscribe();
            analysisService.disconnect();
            
            resolve(analysisText);
          }
        });
        
        // Send the prompt
        analysisService.send({ text: prompt });
      });
    });
  }
  
  private processAnalysis(analysisText: string, preliminaryScore: any): AnalysisResult {
    // Process the raw analysis text into a structured format
    
    // Extract skill areas
    const skillAreas: {
      name: string;
      score: number;
      description: string;
      status: 'strength' | 'average' | 'challenge';
    }[] = [];
    
    // Extract visual processing section
    const visualProcessingMatch = analysisText.match(/Visual Processing:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (visualProcessingMatch) {
      skillAreas.push({
        name: 'Visual Processing',
        score: this.estimateScoreFromText(visualProcessingMatch[1]),
        description: this.extractDescription(visualProcessingMatch[1]),
        status: this.determineStatus(visualProcessingMatch[1])
      });
    }
    
    // Extract phonological awareness section
    const phonologicalMatch = analysisText.match(/Phonological Awareness:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (phonologicalMatch) {
      skillAreas.push({
        name: 'Phonological Awareness',
        score: this.estimateScoreFromText(phonologicalMatch[1]),
        description: this.extractDescription(phonologicalMatch[1]),
        status: this.determineStatus(phonologicalMatch[1])
      });
    }
    
    // Extract working memory section
    const memoryMatch = analysisText.match(/Working Memory:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (memoryMatch) {
      skillAreas.push({
        name: 'Working Memory',
        score: this.estimateScoreFromText(memoryMatch[1]),
        description: this.extractDescription(memoryMatch[1]),
        status: this.determineStatus(memoryMatch[1])
      });
    }
    
    // Extract reading fluency section
    const readingMatch = analysisText.match(/Reading Fluency:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (readingMatch) {
      skillAreas.push({
        name: 'Reading Fluency',
        score: this.estimateScoreFromText(readingMatch[1]),
        description: this.extractDescription(readingMatch[1]),
        status: this.determineStatus(readingMatch[1])
      });
    }
    
    // Extract directional awareness section
    const directionalMatch = analysisText.match(/Directional Awareness:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (directionalMatch) {
      skillAreas.push({
        name: 'Directional Awareness',
        score: this.estimateScoreFromText(directionalMatch[1]),
        description: this.extractDescription(directionalMatch[1]),
        status: this.determineStatus(directionalMatch[1])
      });
    }
    
    // Extract strengths
    const strengths: string[] = [];
    const strengthsMatch = analysisText.match(/Strengths:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (strengthsMatch) {
      const strengthsText = strengthsMatch[1].trim();
      strengths.push(...strengthsText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim()));
    }
    
    // Extract challenges
    const challenges: string[] = [];
    const challengesMatch = analysisText.match(/Challenges:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (challengesMatch) {
      const challengesText = challengesMatch[1].trim();
      challenges.push(...challengesText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim()));
    }
    
    // Extract recommendations
    const recommendations = {
      nextSteps: [] as string[],
      accommodations: [] as string[],
      activities: [] as string[]
    };
    
    // Extract next steps
    const nextStepsMatch = analysisText.match(/Next Steps:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (nextStepsMatch) {
      const nextStepsText = nextStepsMatch[1].trim();
      recommendations.nextSteps.push(...nextStepsText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim()));
    }
    
    // Extract accommodations
    const accommodationsMatch = analysisText.match(/Accommodations:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (accommodationsMatch) {
      const accommodationsText = accommodationsMatch[1].trim();
      recommendations.accommodations.push(...accommodationsText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim()));
    }
    
    // Extract activities
    const activitiesMatch = analysisText.match(/Activities:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (activitiesMatch) {
      const activitiesText = activitiesMatch[1].trim();
      recommendations.activities.push(...activitiesText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim()));
    }
    
    // Extract summary
    let summary = '';
    const summaryMatch = analysisText.match(/Summary:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }
    
    // If we couldn't extract specific sections, provide defaults
    if (skillAreas.length === 0) {
      skillAreas.push(
        {
          name: 'Visual Processing',
          score: 50,
          description: 'Ability to interpret and organize visual information.',
          status: 'average'
        },
        {
          name: 'Phonological Awareness',
          score: 50,
          description: 'Ability to recognize and work with sounds in spoken language.',
          status: 'average'
        },
        {
          name: 'Working Memory',
          score: 50,
          description: 'Ability to hold and manipulate information in short-term memory.',
          status: 'average'
        },
        {
          name: 'Reading Fluency',
          score: 50,
          description: 'Ability to read text accurately, quickly, and with expression.',
          status: 'average'
        },
        {
          name: 'Directional Awareness',
          score: 50,
          description: 'Understanding of spatial concepts like left/right, up/down.',
          status: 'average'
        }
      );
    }
    
    if (strengths.length === 0) {
      strengths.push(
        'Shows interest in learning',
        'Demonstrates good effort during tasks',
        'Has creative problem-solving approaches'
      );
    }
    
    if (challenges.length === 0) {
      challenges.push(
        'May benefit from additional support with reading tasks',
        'May need extra time to process written information',
        'May find certain aspects of reading challenging'
      );
    }
    
    if (recommendations.nextSteps.length === 0) {
      recommendations.nextSteps.push(
        'Consider sharing these screening results with teachers',
        'Monitor progress with reading and writing tasks',
        'Consider a comprehensive evaluation with a learning specialist if difficulties persist'
      );
    }
    
    if (recommendations.accommodations.length === 0) {
      recommendations.accommodations.push(
        'Provide extra time for reading assignments and tests',
        'Allow for verbal responses when appropriate',
        'Provide written instructions in addition to verbal directions'
      );
    }
    
    if (recommendations.activities.length === 0) {
      recommendations.activities.push(
        'Practice reading with a variety of materials that match interests',
        'Play word games that build phonological awareness',
        'Use multisensory approaches to learning new words'
      );
    }
    
    if (summary === '') {
      summary = 'This screening provides insights into learning patterns and potential areas for support. Remember that this is a screening tool, not a diagnosis. The results can help identify strategies that may support learning and reading development.';
    }
    
    return {
      preliminaryScore,
      skillAreas,
      strengths,
      challenges,
      recommendations,
      summary,
      rawAnalysis: analysisText
    };
  }
  
  private estimateScoreFromText(text: string): number {
    // Estimate a score from 0-100 based on the text description
    // This is a simplified implementation
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('significant strength') || lowerText.includes('very strong') || lowerText.includes('excellent')) {
      return 90;
    } else if (lowerText.includes('strength') || lowerText.includes('strong') || lowerText.includes('good')) {
      return 80;
    } else if (lowerText.includes('above average')) {
      return 70;
    } else if (lowerText.includes('average')) {
      return 60;
    } else if (lowerText.includes('below average')) {
      return 40;
    } else if (lowerText.includes('difficulty') || lowerText.includes('challenge') || lowerText.includes('weak')) {
      return 30;
    } else if (lowerText.includes('significant difficulty') || lowerText.includes('significant challenge') || lowerText.includes('very weak')) {
      return 20;
    }
    
    // Default to average if we can't determine
    return 50;
  }
  
  private extractDescription(text: string): string {
    // Extract a concise description from the text
    // This is a simplified implementation
    
    // Try to get the first sentence
    const firstSentenceMatch = text.match(/^[^.!?]*[.!?]/);
    if (firstSentenceMatch) {
      return firstSentenceMatch[0].trim();
    }
    
    // If no sentence found, return the first 100 characters
    return text.substring(0, 100).trim() + '...';
  }
  
  private determineStatus(text: string): 'strength' | 'average' | 'challenge' {
    // Determine if this area is a strength, average, or challenge
    // This is a simplified implementation
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('strength') || lowerText.includes('strong') || lowerText.includes('good') || 
        lowerText.includes('excellent') || lowerText.includes('above average')) {
      return 'strength';
    } else if (lowerText.includes('difficulty') || lowerText.includes('challenge') || lowerText.includes('weak') || 
               lowerText.includes('struggle') || lowerText.includes('below average')) {
      return 'challenge';
    }
    
    // Default to average
    return 'average';
  }
  
  async generatePDFReport(analysisResult: AnalysisResult): Promise<string> {
    // In a real implementation, this would generate a PDF report
    // For now, we'll just return a placeholder
    
    console.log('Generating PDF report for analysis:', analysisResult);
    
    // Simulate PDF generation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('dyslexia-screening-report.pdf');
      }, 1000);
    });
  }
}
