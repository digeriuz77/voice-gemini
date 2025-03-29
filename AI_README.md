# Voice Chat Application

## Purpose

This application provides a voice chat interface leveraging Google Cloud's Genkit framework and Gemini API for natural language processing and voice interaction. Users can engage in voice conversations, with their speech transcribed, processed by Gemini, and responses synthesized back into speech.

## Main Technologies

*   **Angular:** Front-end framework for building the user interface.
*   **Genkit:** Google Cloud framework for building and deploying AI-powered applications.
*   **Gemini API:** Google's multimodal AI model for understanding and generating human language.
*   **Firebase:** Backend services for authentication, database (if applicable), and hosting.
*   **TypeScript:** Primary programming language.

## Project Structure

The project follows a standard Angular application structure with the following key directories:

*   **`src/`**: Contains the main application source code.
    *   **`app/`**:  Contains the Angular components, services, and routing configuration.
        *   **`app.component.*`**: The root component of the application.
        *   **`voice-chat/`**: Component for the main voice chat interface.
        *   **`control-tray/`**: Component for controlling voice input and settings.
        *   **`landing/`**:  Component for the initial landing page.
        *   **`audio-pulse/`**: Component for visual representation of audio input.
        *   **`services/`**:  Contains application-wide services.
            *   **`chat.service.ts`**: Manages the overall chat flow and state.
            *   **`genkit.service.ts`**:  Handles communication with the Genkit backend.
            *   **`firebase.service.ts`**:  Handles Firebase authentication and data interactions.
    *   **`gemini/`**: Contains code specifically related to Gemini API integration.
        *   **`gemini-client.service.ts`**:  Handles direct communication with the Gemini API.
        *   **`audio-recorder.ts`**:  Manages audio recording and processing.
        *   **`types.ts`**:  Defines data types used in the Gemini integration.
        *   **`utils.ts`**:  Utility functions for Gemini-related tasks.
    *   **`environments/`**: Contains environment-specific configuration.

## Key Code Flows

1.  **User Interaction:** The user interacts with the `voice-chat` component, initiating voice input through the `control-tray`.

2.  **Audio Recording:** The `audio-recorder` in the `gemini` module records the user's voice.

3.  **Transcription and Processing:** The recorded audio is sent to the Genkit backend via the `genkit.service`. The backend uses the Gemini API to transcribe the audio and generate a response.

4.  **Response Synthesis:** The Genkit backend returns the Gemini-generated text response to the `genkit.service`. The backend also synthesizes the text response to audio.

5.  **Output:** The synthesized audio response is played back to the user, and the text conversation is displayed in the `voice-chat` component.  The `chat.service` manages the conversation history and state.

## Updating the Project

To effectively update the project, consider the following:

*   **Dependencies:** Manage dependencies using `npm`.
*   **Components:** Add or modify components within the `src/app/` directory. Ensure proper routing and integration with existing services.
*   **Services:**  Extend or modify services in `src/app/services/` to add new functionality or change existing behavior.  Pay close attention to how services interact with components and other services.
*   **Gemini Integration:**  Modify the files in `src/gemini/` to adjust how the application interacts with the Gemini API, such as changing prompts, parameters, or handling different types of interactions.  Any changes here likely require corresponding changes in the Genkit backend.
*   **Backend:**  This README primarily describes the frontend.  Remember to coordinate changes with the Genkit backend, which handles transcription, Gemini processing, and speech synthesis.  The `genkit.service.ts` manages the communication with the backend.
*   **Configuration:** Update environment-specific settings in `src/environments/` as needed.
*   **Testing:** Implement unit and integration tests for new or modified code.