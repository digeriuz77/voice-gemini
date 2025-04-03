# Myapp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## The project aims

Designing a Global Dyslexia Support & Screening MVP
1. Accessible Design & UX Principles for Dyslexia

Creating an inclusive experience is paramount. The design should follow Universal Design principles – ensuring flexibility, simplicity, perceptible information, tolerance for error, and equitable use​
uxdesign.cc
. In practice, this means interfaces that are easy to navigate and understand for the widest range of users, including those with dyslexia or other literacy difficulties. Key UX guidelines include:

    Readable Typography: Use clean, sans-serif fonts at a generous size (16–19px for body text, with headings ~20% larger)​
    uxdesign.cc
    . Adequate spacing between letters, words, and lines is crucial to reduce crowding​
    uxdesign.cc
    . Avoid styling that impairs readability – no full italics, all-caps, or underlined continuous text​
    uxdesign.cc
    ​
    uxdesign.cc
    . Some designs offer dyslexia-friendly fonts (like OpenDyslexic or Dyslexie) as an option​
    uxdesign.cc
    , though research suggests a standard clear font with proper spacing can be just as effective​
    uxdesign.cc
    . Providing a user toggle for a preferred font or text size is ideal for personalization.

    Contrast and Color: Ensure high contrast between text and background (e.g. dark text on light background or vice versa)​
    uxdesign.cc
    . Pure white backgrounds can cause glare, so consider a subtle off-white or pastel background, and offer a dark mode. Never use busy patterns behind text​
    uxdesign.cc
    . These practices align with the British Dyslexia Association’s style guidelines for readability​
    uxdesign.cc
    .

    Clear Layout & Navigation: Keep layouts simple and predictable. Left-align text (for Western languages) and avoid multi-column layouts that can confuse the reading order​
    uxdesign.cc
    . Break up long passages into shorter paragraphs or bullet lists​
    uxdesign.cc
    . Use ample white space and distinct headings to structure content​
    uxdesign.cc
    – this helps users skim and not feel overwhelmed by a wall of text.

    Plain Language: Write instructions and content in short, simple sentences​
    uxdesign.cc
    . Minimize jargon and uncommon abbreviations​
    uxdesign.cc
    . This reduces cognitive load for users who may struggle with decoding complex text. Where advanced vocabulary is necessary, provide examples or alternatives in easier language. These content design choices make the app approachable for young students and second-language readers alike.

    Visual Aids: Incorporate supportive visuals (icons, illustrations, charts) to complement text​
    uxdesign.cc
    . For someone with dyslexia, images can provide context cues and aid understanding when text is challenging​
    uxdesign.cc
    . Ensure icons and graphics are intuitive and directly related to the accompanying text or question. For example, a question about sequences might include a simple pictorial sequence icon. Visual content should be meaningful, not just decorative, to reinforce comprehension​
    uxdesign.cc
    .

    Guidance and Feedback: Provide clear, encouraging feedback during tasks. If a user makes an error (e.g., answers a question incorrectly), use a tolerant design approach – offer hints or allow retries instead of harsh error messages. This “tolerance for error” principle helps reduce anxiety​
    uxdesign.cc
    , which is important since many dyslexic students may feel stress around reading tasks.

    Assistive Features: Build in assistive technologies from the start. A prime example is text-to-speech (TTS) for any textual content. Users should be able to tap a button to have questions or instructions read aloud. This caters to those with reading difficulties, aligning with features like Medium’s built-in article reader (powered by Speechify) where any text can be converted to audio with a click​
    uxdesign.cc
    . Additionally, support platform-native features: do not disable zooming on web (allow pinch-to-zoom) and ensure text can be selected/copied so that users can leverage tools like screen readers or even third-party reading aids​
    uxdesign.cc
    ​
    uxdesign.cc
    .

    Dyslexia-Friendly Modes: Consider an optional “reading mode” or settings toggle that packages several accommodations – e.g. enable a dyslexia-friendly font, larger text, extra spacing, high contrast theme, and TTS by default. This mode could also include a line focus or highlight that moves with the reading position (akin to Microsoft’s Immersive Reader which highlights words as it reads aloud​
    microsoft.com
    ). Such features, proven in tools like Immersive Reader, can significantly improve reading comfort and speed for dyslexic learners by adjusting line length, spacing, and highlighting​
    microsoft.com
    . The key is making these aids available but not forced – users can customize their experience to what helps them most​
    microsoft.com
    ​
    microsoft.com
    .

By following these UX principles, the app will be welcoming and usable for students with a range of needs. Accessibility isn’t an add-on – it’s baked into the design from day one, ensuring no user is left behind.
2. Scalable Tech Stack & Architecture

To build a globally effective MVP, choosing the right technology stack is critical. The plan is to use React for the web app and Flutter for the Android app, with a cloud backend (Firebase or Supabase). This stack can deliver a responsive, cross-platform experience while leveraging robust backend services:

    React (Web): React is a great choice for building a dynamic, component-based web interface. It has a rich ecosystem of libraries for state management, routing, and internationalization. With React, we can also leverage Progressive Web App (PWA) techniques to allow offline usage and easy distribution to users (especially useful in school environments where installing apps might not be feasible on shared computers). Ensure to use semantic HTML elements and ARIA attributes in the React app for accessibility (e.g., use <button> for interactive elements, proper form labels, etc.), since many dyslexic users may rely on screen readers or other assistive tech.

    Flutter (Android): Flutter will allow a highly consistent UI across Android devices (and potentially iOS/web in the future if needed). Flutter’s rendering engine can implement custom UI elements for interactive exercises with smooth animations (important for gamified screening tasks). It also has built-in support for text-to-speech plugins and can easily include custom fonts (e.g., bundling the OpenDyslexic font file and using it in TextStyle). The single codebase for Android (and possibly iOS later) means faster iteration on features. Flutter’s accessibility widgets (such as Semantics widgets) should be used to label interactive controls, so that screen readers can describe games or questions to users who need audio support.

    Backend – Firebase vs Supabase: Both Firebase and Supabase are capable BaaS (Backend-as-a-Service) platforms. Firebase (with Firestore) offers realtime sync and built-in offline data persistence, which is a big plus for a globally used educational app​
    linkedin.com
    . Firebase’s client SDKs cache data; users can continue using the app offline and data will sync when connection resumes​
    linkedin.com
    . It also provides easy authentication (with email, Google, etc.), file storage (for any media or report files), and serverless functions for any custom logic (like generating PDFs or sending emails). Firebase is proven at scale and can handle high concurrency effortlessly​
    linkedin.com
    . The downside to watch is cost – at large scale, or with heavy download usage (if many assets or PDFs are stored), Firebase costs can rise, so careful indexing and asset hosting strategies (like using Cloud Storage with a CDN) are needed. Supabase, on the other hand, is an open-source alternative built on PostgreSQL. It offers a full SQL database and a familiar relational data model, which can be useful for complex queries (e.g., analyzing screening results across cohorts)​
    linkedin.com
    . Supabase also has built-in auth and storage, and can be self-hosted for flexibility. However, Supabase’s offline support is not as mature – it currently lacks the seamless offline sync that Firestore provides​
    linkedin.com
    . For an MVP focused on reliable offline use in schools (where internet might be inconsistent), Firebase/Firestore is likely the safer bet for the initial version. In summary, Firebase excels in real-time sync, scalability and offline-first usage​
    linkedin.com
    , whereas Supabase shines for SQL power and open-source flexibility but would need additional work for offline caching​
    linkedin.com
    . If using Supabase, one might implement a local cache manually (e.g., store recent form responses on-device and push to Postgres when online). On balance, many developers choose Firebase for a quick MVP unless there’s a strong need for SQL or self-hosting control​
    linkedin.com
    .

    Architecture: The app should separate concerns cleanly. The frontends (React and Flutter) will handle the UI and user interactions. They will communicate with the backend through secure APIs or SDK calls (for Firestore or Supabase). It’s wise to define a clear data schema for questionnaire results, user profiles, etc. For instance, each user could have a record with their profile and a collection of screening attempts (each containing answers and scores). If using Firestore, security rules must be written to ensure users can only read/write their own data (and perhaps allow anonymized data to be collected for research with consent). If using Supabase, enable Row Level Security and write policies to the same effect. In either case, use authentication tokens to identify users securely. The backend can also integrate with third-party services if needed (for example, email delivery for sending PDF reports to teachers or parents, or integration with a service that connects to local professionals). However, keep the MVP lean – focus on core functionality first.

    Scalability: Both Firebase and Supabase can scale to a global user base, but plan for efficient data usage. Use indexing and query only what’s needed (e.g., paginate long reports or summaries, instead of downloading all historical data at once). Design the questionnaire and game content to be delivered dynamically: for instance, store questions, possible answers, and logic in the backend so they can be updated or translated without requiring a new app release. This allows the app to easily add new languages or adjust questions for cultural relevance internationally. Caching this content on the client (with versioning) ensures the app loads fast and can run offline.

Offline Support Best Practices

Offline support is crucial for an educational tool used in diverse regions. Progressive Web App techniques on React can let the web app work offline: using a Service Worker to cache static assets and perhaps cached API responses (via tools like Workbox). That way, once a student loads the app, the core screens and even the question data can be available without internet. For dynamic data (like saving a quiz attempt), the app can detect connectivity and queue the submission to send later if offline. With Firebase, offline persistence can largely be handled by Firestore’s SDK – it will queue writes and serve reads from cache transparently​
linkedin.com
. For Flutter, consider using a local database (such as sqflite or Hive) to store any pending results or to cache question content. The app might start by loading data from local storage first, then attempt to fetch updates from the cloud if online.

Testing offline scenarios is important: e.g., simulate a user completing the screening fully offline (no Wi-Fi) and ensure their data syncs once the device reconnects without data loss. Provide user feedback in-app about connectivity (like “You’re offline – results will sync when online” so they know what to expect). Also, design tasks that don’t require an active internet connection to play (download any needed media in advance).
Data Privacy & Security

Given that this app handles potentially sensitive data about learning difficulties and is aimed at minors (international school students), robust data privacy measures are non-negotiable. All personal data should be stored securely and minimally. Use encryption in transit and at rest (Firebase does this by default; for Supabase/Postgres ensure TLS and possibly encrypt sensitive fields). Never store more personal information than necessary for the screening purpose – for example, you might only need a user's first name (or alias), age/grade, and an email for an account. Consider allowing anonymous accounts that the user or their parent can later link to an email, to reduce barriers for initial use.

Comply with international data protection laws: for instance, GDPR in the EU (provide a way to delete user data on request, and obtain parental consent for users under 13 as required), and similar regulations in other jurisdictions. Firebase is GDPR-compliant if configured to use EU data servers and with proper consent flows (Google provides data processing terms)​
stackoverflow.com
. If using analytics, make sure to allow opt-out or use privacy-friendly analytics (or disable detailed analytics for students by default).

Importantly, clarify that the tool is a screening aid, not a medical diagnosis. This should be stated in the app’s privacy policy and introduction. (One open-source project emphasizes it “is a screening tool, not a definitive diagnosis... aimed to flag potential dyslexia and encourage professional evaluation”​
github.com
.) The reports generated should be treated as confidential educational records. If the app will share results with third-party professionals (e.g., to help arrange exam accommodations), it must do so only with explicit user (or guardian) consent, in line with privacy laws.

To further protect privacy, consider anonymizing data for any research or improvement purposes. For example, one could strip personal identifiers and aggregate results to discover how the tool is performing. In an example project, all collected data was anonymized and stored securely for research​
github.com
. Following such practices will ensure trust among schools and parents internationally.
Multilingual & Cultural Relevance

From the outset, design the app to be multilingual and culturally adaptable. Use internationalization (i18n) frameworks: in React, libraries like i18next or React Intl can manage text translations; in Flutter, use the intl package or Flutter’s built-in localization support (ARB files). All user-facing strings should be externalized so they can be translated easily. Also ensure the font can support necessary characters (e.g., if supporting languages with non-Latin scripts, choose a font or dynamically load one that covers those Unicode ranges).

For questionnaires and instructions, direct translation is good, but also consider localization – examples or idioms may need adjusting for different cultures. The screening tasks themselves might need localization; for instance, phonological awareness tasks will differ by language (testing letter-sound mapping in English is different from in Spanish). Design the questionnaire engine to load a locale-specific question set if needed. The app could fetch, say, an "en" questionnaire or a "fr" questionnaire based on user selection. The use of a JSON-driven form structure will help here (you can have translations for each question text, and even different logic per language if required).

Multilingual support extends to text-to-speech as well: ensure the TTS solution can handle multiple languages/accents. The web Speech Synthesis API can speak many languages given the correct locale voice. On Flutter, flutter_tts plugin allows setting the language/locale for speech; you’d need to detect the current app language and choose a matching voice. Testing with native speakers (or at least fluent testers) is crucial to verify that the content is appropriately translated and that any reading passages used in screening are grade-level and culturally appropriate in each language.

Lastly, the UI should accommodate different text lengths and directions (if you plan to go beyond left-to-right languages – e.g., support Arabic or Urdu which are right-to-left, the app and fonts should support that as well). Flutter has decent RTL support, and React can handle it with CSS direction if needed.
3. Key Features and Implementation Ideas

The MVP will consist of several core components: a questionnaire engine, interactive assessment games, result dashboards, and supportive utilities (PDF report generation, text-to-speech, etc.). Below we break down each feature with design strategies, technical recommendations, and references to libraries or examples that can accelerate development.
3.1. Modular Questionnaire Engine (with Branching Logic)

A flexible questionnaire/survey module is vital for the initial screening portion – for example, a series of questions about the student’s reading habits, difficulties, or a symptom checklist. This should support branching logic (a.k.a. skip logic or conditional questions), so that the flow can adapt to user responses. For instance, if a student indicates they frequently struggle to finish reading exam texts on time, the app might branch into a specific set of follow-up questions about timing and comprehension.

Implementation approach: Define the questionnaire in a data-driven format (like a JSON schema) that includes questions, answer options, and conditional branches. Each question can have a condition like “if answer to Q5 was No, skip to Q7”. On the web, you can leverage libraries such as SurveyJS or Formbricks which are open-source form builders supporting branching logic​
github.com
​
techifysolutions.com
. SurveyJS, for example, lets you define a survey in JSON and supports multi-language text and conditional pages out of the box​
techifysolutions.com
. Using such a library in React can jump-start development – you’d get accessible form controls and even validation without starting from scratch. Another alternative is QuillForms, an open-source Typeform-style React library that specializes in interactive, conversational forms with skip logic (available on GitHub​
reddit.com
).

For Flutter, you can either write a custom form wizard or use a package. A great example is the flutter_survey package by Michel Thomas, which was built to handle nested conditional questions (inspired by Google Forms logic)​
michelphoenix98.medium.com
. With that package, you define questions in a structure where each answer can lead to a sub-list of follow-up questions, and the widget handles the state and navigation automatically​
michelphoenix98.medium.com
. The data model might look like:

Question(
  text: "Does reading on screens make you tired?",
  isSingleChoice: true,
  answerChoices: {
    "Yes": [ Question(... next question if "Yes" ...) ],
    "No": [ Question(... next question if "No" ...) ]
  }
)

This kind of structured definition makes the questionnaire modular – content designers can add new questions or pathways without changing core logic.

UX considerations: Each question should be presented clearly, one at a time, to avoid overwhelming the user. Use simple language as mentioned, and whenever possible, add a visual or example. For instance, a question about letter reversals might show an image of a reversed “b/d” alongside the text. Provide a progress indicator (“Question 5 of 10”) so users know how much is left, which can help motivation. Also, allow going back to previous questions if possible, in case the user wants to change an answer (but if answers change the branch, be cautious about resetting subsequent answers).

On submission of the questionnaire, the app can compute a preliminary score or risk level (e.g., based on how many “at-risk” indicators were answered) to include in the final report. The logic for scoring should be transparent and adjustable as you refine the screening instrument. Storing the questions and logic on the backend means you can tweak the algorithm or wording for all users easily (for example, after a pilot, you might find certain questions are not useful and remove them).
3.2. Interactive Assessment Games (Pattern-Matching & Memory Tasks)

Beyond self-reported questions, a powerful differentiator for the MVP is interactive tasks that screen for dyslexia-related cognitive patterns (without feeling like a test). These can include pattern-matching, visual memory, and phonological games that research links to dyslexic traits or difficulties. The goal is early screening, so tasks should be simple, quick, but indicative of underlying skills:

    Pattern Matching: For example, a game could show a sequence of letters or symbols and ask the user to identify the one that doesn’t belong, or continue the pattern. Another idea is a rapid naming task: flash cards of letters or objects appear and the user must quickly name them (the app records response time). This correlates with rapid automatized naming, often slower in dyslexic individuals​
    dyslexiaida.org
    . Technically, in React you could implement this with timed state changes (or use Canvas/WebGL for more custom drawing). In Flutter, you can use the animation library or game engines like Flame if needed, but basic widgets with timers can suffice for a simple sequence. Ensure the tasks have clear instructions and maybe a practice round. For accessibility, include both text and an audio prompt describing the task, and use easily distinguishable visuals (high contrast shapes, not confusable letters for pattern tasks).

    Visual Memory Task: Dyslexia is sometimes associated with working memory challenges, so a common screening is a memory game. For instance, show a grid of symbol pairs, then hide them and ask the user to find matches (classic concentration game). Or show a pattern of dots for a few seconds and then ask the user to recreate it. These test memory and spatial recall. Implementing a memory card game is straightforward in both React and Flutter: you can render a grid of cards (divs or Flutter GridView), handle taps to flip them, and use state to track matches. There are many example projects for simple memory games in Flutter and React since it's a common tutorial (even a FlipCard widget exists in Flutter for flipping animations). Just be sure to make it accessible: e.g., if a user has trouble with fine motor control, ensure card tap areas are large; also possibly provide a way to hear the item on the card in addition to seeing it (though mostly these are visual). Limit the memory game to a reasonable number of items (for a screening maybe a 4x4 grid at most).

    Phonological Awareness Task: Although the question emphasis is on pattern and visual memory, an MVP might also include a simple audio-based task, since dyslexia is fundamentally a phonological issue. For example, the app could play a sound like "/ba/ /da/ /ba/ /ba/" and ask which sound was different – testing auditory discrimination. Or show a few letters and play a spoken sound, asking the user to pick the letter for that sound (testing letter-sound mapping). Such tasks can be done in React/Flutter by playing audio files (or using TTS for phonemes, though recorded audio might be clearer for phonetics) and capturing the selection.

To keep the scope in check, you might start with 1–2 key games (perhaps one visual pattern game, one auditory/phonological game). These should be engaging: use gamification elements like a friendly mascot or reward stars/badges for completing a task. In fact, existing tools have shown success with this approach – for example, Dytective (from Change Dyslexia in Spain) uses a 15-minute gamified test with a variety of mini-games to detect dyslexia risk, making the experience feel like playing rather than testing​
unesco.org
. Their approach reached over 250,000 users in 43 countries, validating that game-based screeners can be globally appealing​
unesco.org
.

Technical tips: Flutter is well-suited for custom graphics-heavy tasks if needed (via CustomPaint or Flame engine), but try leveraging simple compositions of widgets first (containers, images, text) to create games – it’s easier to maintain. React can use HTML/CSS for a lot (e.g., animations via CSS or simple JS intervals). If performance becomes an issue (for example, a fast-paced game), consider using canvas or an <svg> with D3 or other libraries for more control. But likely, simple interactive tasks won’t need extreme optimization in an MVP.

Accessibility in games: This can be tricky, but always provide instructions in multiple formats (visual text, audio narration, maybe an example animation). Don’t rely solely on color to convey information (some users might have color blindness too). Allow the user to pause or replay a prompt if they need more time (especially since dyslexic users might process more slowly under time pressure​
uxdesign.cc
). If a task is timed, ensure the timing is generous or adaptive. You might implement adaptive difficulty: e.g., if a user is struggling, the game could subtly slow down or offer an extra hint, whereas if they breeze through, it might get a bit more challenging. This keeps users from feeling frustrated or bored. Nadine Gaab’s Early Literacy Screening app took a similar adaptive game-based approach, adjusting to the child’s performance and keeping it fun with animal characters and feedback​
k12dive.com
​
k12dive.com
.

All these interactive pieces should log results (e.g., how many correct, time taken, any notable errors) to feed into the final screening report. The combination of questionnaire and game performance gives a more holistic picture of the student’s profile.
3.3. Results Dashboard & PDF Report Generation

After the user completes the screening (questionnaire + tasks), the app should provide clear, constructive results. This serves two purposes: immediate feedback to the student or parent, and a report for professionals that the student can take to seek formal assessment or exam accommodations.

Designing the Dashboard: The in-app results dashboard can show the user's performance in a friendly manner. For example, it might display a summary like “You answered X out of Y indicators that suggest dyslexic traits.” and “In the pattern game, your score was above average time, which may indicate difficulty with rapid visual processing.” Use simple graphs or icons to visualize this – perhaps a meter or gauge for each skill area (reading, memory, phonological) indicating relative strength. Keep the tone positive and emphasize this is not a diagnosis. Highlight next steps, e.g., “Based on these results, you might benefit from a full assessment. You can use the generated report to discuss accommodations like extra exam time with a specialist.”

For building such visualizations, there are many chart libraries. On the web, Chart.js, Recharts, or D3.js can create bar charts, radar charts, etc. If you want something quick, Chart.js is straightforward for showing, say, a bar for each category score. In Flutter, you could use packages like charts_flutter or fl_chart to draw bar or pie charts representing the results. Ensure charts have labels and/or tooltips because some users might find interpreting a chart challenging without text – e.g., label segments as “Memory: 70%”.

PDF Report Generation: The MVP should allow exporting this summary to a PDF, since the primary goal is helping users share findings with educators or psychologists for exam accommodations. There are a few ways to generate PDFs:

    In the web app, one popular method is using a client-side library like jsPDF or pdfmake, which can take an HTML element or JSON definition and produce a PDF file. These libraries support text, simple styling, and images (like embedding the chart from the dashboard)​
    pdfendpoint.com
    . Another method is to use a headless browser (like Puppeteer) on a cloud function to generate a nicely formatted PDF from a template HTML, but that adds complexity and cost. For an MVP, using jsPDF to capture a report div is usually sufficient. (Developers often combine html2canvas with jsPDF: render the chart or any custom component to an image and then put it into the PDF.) Ensure that the PDF includes all the critical info: user’s name, date, the questionnaire answers summary, game scores, and an explanation of results. You might include a disclaimer that a formal evaluation is recommended. Also, if possible, embed links or references to local dyslexia associations or services in the PDF for convenience.

    In Flutter (Android), you can generate PDFs on-device using the Dart pdf package​
    pub.dev
    . This library provides a Flutter-like API to create a document with text, images, shapes, etc., all in Dart code, and then save it as a PDF file. It supports multi-page layout, styling, and even using TrueType fonts (so you can embed the dyslexia-friendly font in the PDF)​
    pub.dev
    ​
    pub.dev
    . There’s also a printing plugin that can help share or print the PDF once generated​
    pub.dev
    . For example, you could generate a PDF with a header "Dyslexia Screening Report", put the scores and interpretations, and maybe a line for a professional to sign after evaluation. The PDF generation code might take the same data from the dashboard and lay it out with pw.Text and pw.Chart (if using the printing package’s capabilities).

Open-source examples: The pdfme project is an interesting React-based PDF generation tool that even has a template designer​
github.com
, but likely overkill for MVP. Simpler, @react-pdf/renderer is a library that lets you write JSX-like code to define PDF content in React and generates a PDF – this could unify how you design the report (write a component for the report, it renders to PDF instead of DOM). On Flutter, the pdf package’s example on GitHub shows how to create a multi-page document with charts and images​
pub.dev
, which could be a helpful reference.

Privacy for reports: If the PDF contains personal data, decide whether you store it or just generate and immediately share it. Probably the latter – generate on the client and either prompt download (web) or share (Flutter) without uploading it to your server, to minimize data handling. If using Firebase cloud functions to generate PDFs for some reason, ensure those are secure.
3.4. Text-to-Speech & Dyslexia-Friendly Features Integration

To maximize accessibility, integrate text-to-speech (TTS) and other reading aids into the app’s core functionality:

    Text-to-Speech: As mentioned, all textual content (questions, instructions, even answer options) should be playable as audio. On web, the simplest way is using the Browser’s Web Speech API – e.g., use speechSynthesis.speak() with a SpeechSynthesisUtterance. This is JavaScript built-in in modern browsers and doesn’t require extra libraries, though you should detect if the browser supports it and perhaps fall back to an API if not. A library like speech-js or say.js can simplify usage, but not strictly needed. On Flutter, the flutter_tts plugin is a popular choice​
    gamesinflutter.com
    . It supports Android, iOS, web, etc., by leveraging native platform TTS engines or web API where available​
    pub.dev
    . With flutter_tts, you can set the language, speed, and pitch easily. For example, set a slower speech rate by default to aid comprehension (but allow the user to adjust if they want faster). Make sure to preload or warm up TTS if needed so there’s minimal delay when the user taps the “read aloud” button.

    In terms of UI, have a clear speaker icon or “Listen” button next to text blocks. For longer passages, you might highlight words as they are read (this is done in Immersive Reader and proven to help tracking​
    microsoft.com
    ). Implementing highlight sync is advanced (requires knowing the timing of each word), which might be too much for MVP; as a simpler step, you could break text by sentence and highlight the current sentence.

    Dyslexia-Friendly Font & Themes: Allow users to switch to a font like OpenDyslexic or Lexend Deca in settings. Both are free to use. OpenDyslexic has a unique style with heavier bottoms on letters to reduce flipping, and Lexend is a sans-serif specifically designed to improve reading speed. You can include these fonts in the app (e.g., import via Google Fonts in web, include .ttf in Flutter assets). According to some research, just using a clean sans-serif (like Arial, Verdana) with good spacing may be as effective​
    uxdesign.cc
    , but providing the option hurts nothing and some users may prefer the look of a font they know is for them. One project recommends having such fonts as an option and notes that aesthetic preferences should take a backseat to functionality for the user​
    uxdesign.cc
    . So even if the design team loves a certain stylish font, ensure at least the option for a plainer, more readable mode.

    Also implement a high-contrast mode or color theme choices. Some dyslexic users find white background too stark – offering a gentle cream background or a pastel colored overlay can help​
    uxdesign.cc
    . Perhaps have a few theme presets (e.g., default, dark, and a “dyslexia mode” which might be a pale yellow background with dark text, as some find that easier on the eyes). These theming capabilities can be built using CSS variables or context in React, and ThemeData in Flutter, toggled by the user in a settings screen.

    Other Assistive Tools: Consider incorporating syllable breakdown or focus mode if time permits. For example, a toggle to show subtle breaks between syllables in longer words (Immersive Reader has this feature too​
    supportservices.jobcorps.gov
    ). This can be done by having pre-syllabified text or using a library (there are syllable counters in many languages, but may not be trivial for all languages). A simpler approach is a “reading guide” – highlight one line of text at a time (graying out the rest) to help focus. These might be enhancements beyond the MVP, but keeping the architecture open to adding them is wise.

    Testing Accessibility: Make sure to test the app with actual users if possible or use accessibility evaluation tools. For instance, use browser extensions to simulate dyslexia (there are some that jumble letters) to ensure your content still makes sense. Use screen readers like NVDA or VoiceOver on your app to see if all interactive elements are labeled (especially for games, e.g., ensure a memory card announces something like “card 1 of 8, not flipped” for a screen reader user). While the target is students who likely have some vision, designing for multiple disabilities at once (universal design) often improves the experience for the primary target too.

By weaving these features into the app, you ensure it’s not just a screening tool but a supportive environment. For example, a student could use the app’s TTS to help read practice material or use the colored overlay even outside the screening context (if you allow them to import text or provide some reading practice section, which could be a future expansion). This aligns with the mission of early support: not just flagging a difficulty but also providing some immediate tools to cope with it.
4. Inspiration from Successful Tools

Learning from existing solutions can guide our design and implementation. A few noteworthy examples of dyslexia screening or support tools that have seen global success:

    Dytective by Change Dyslexia: Developed by Dr. Luz Rello, Dytective is a game-based dyslexia screener that combines AI with fun exercises. It delivers a 15-minute test via dozens of mini-games (pattern sequences, sound-letter mapping, etc.) and achieved 83% accuracy in identifying at-risk children in research trials​
    cs.cmu.edu
    . Importantly, it reached broad adoption – over 250,000 people across 43 countries have used the tool​
    unesco.org
    , in multiple languages (originating in Spanish). This validates the approach of short, engaging tasks and demonstrates the demand for accessible screening. Our MVP can take inspiration from Dytective’s variety of tasks and its balance of speed and accuracy. Technically, Dytective uses machine learning to analyze user responses; for our MVP, we might not dive deep into ML, but we could design the data collection to allow adding an ML model later (e.g., tracking response times, error patterns, which could train a classifier to predict dyslexia risk).

    Early Literacy Screening App (Boston Children’s Hospital): Nadine Gaab’s team created an adaptive tablet app for pre-readers, used in U.S. schools, which won an MIT Solve award​
    k12dive.com
    . It’s noteworthy that it lets children self-administer a screening through games with minimal adult intervention​
    k12dive.com
    . This underscores the importance of an intuitive UI – even a 5-year-old should be able to navigate the activities with little guidance. They employ engaging animal characters and interactive feedback to keep kids motivated​
    k12dive.com
    . Our app, while targeting slightly older students (exam-age, perhaps 11+ years old), can still benefit from a fun and non-judgmental tone. The success of this tool also highlights how providing immediate strategies or next steps when a child struggles is useful; in our context, if a student does poorly on a memory task, the app might suggest memory training games or strategies as a follow-up, making it not just a screening but a gateway to improvement resources.

    Microsoft’s Immersive Reader & Learning Tools: Though not a dyslexia test, Immersive Reader is used worldwide to assist reading. It was originally designed for readers with dyslexia/dysgraphia​
    support.microsoft.com
    and integrates features like read-aloud, line focus, adjustable spacing, and even picture dictionary for word meanings​
    microsoft.com
    ​
    microsoft.com
    . Its wide adoption in schools (built into Office, Teams, etc.) shows that when accessibility features are convenient and stigma-free, users embrace them. For our design, this is a cue to make assistive features (like TTS, font changes) very easy to find and use – a student shouldn’t have to dig through settings or feel embarrassed to use “the dyslexic mode”. Perhaps include a brief tutorial or tooltips when the user first uses the app, informing them of these options and normalizing their use (“Many users like to listen to the questions – feel free to tap the speaker icon any time”). Immersive Reader’s success also encourages us to support a range of reading preferences (some will want audio, some larger text, etc.).

    Traditional Screening Tests (e.g., Shaywitz DyslexiaScreen, Lucid Rapid): There are established screening tools used in schools, often paper-based or one-on-one tests. While not “apps,” they provide insight into what skills are typically assessed – for example, tests of rapid naming, pseudo-word decoding, and orthographic processing are common​
    apps.esc1.net
    . Our app’s questionnaire and games cover similar ground (without doing formal decoding tests since we can’t fully do that in an app without a human listening to the child read). The Shaywitz DyslexiaScreen is a quick teacher-filled checklist for K-2 kids​
    apps.esc1.net
    , emphasizing how brief a screening can be. We translate that brevity into our user-driven approach, aiming for ~15-20 minutes total like other quick screeners. Lucid Rapid (used in UK schools) is a software that in 30 minutes assesses memory, phonological skills, etc., and gives a risk index. These precedents reassure that our chosen features (memory, pattern, questionnaire) align with what’s been found effective. They also underscore the importance of reporting – these tools generate clear reports for teachers/parents. Ensuring our PDF output is professional and informative will mirror the reporting standard of existing products.

    Community and Open-Source Efforts: There are open-source projects (like the ones we found on GitHub) that target dyslexia. For instance, an Urdu-language Dyslexia Screening Platform was built with a focus on accessibility and multilingual support​
    github.com
    ​
    github.com
    . It underlines the need for localization and culturally relevant content (e.g., focusing on Urdu-specific challenges). Another project used machine learning to analyze reading & eye-tracking data for dyslexia prediction​
    github.com
    – while we may not incorporate eye-tracking, it’s interesting to note future possibilities (if a webcam could track eye movements during reading, perhaps the app could detect patterns; this is beyond MVP scope but shows the innovation in the field). We can also draw from the collective knowledge of these projects on what pitfalls to avoid. Open-source apps often mention challenges like keeping users engaged or handling a wide age range. Engaging with the community (forums or research papers) can help us continuously refine our tool with proven techniques.

In summary, our MVP stands on the shoulders of prior tools: combining the engagement of gamified tests (Dytective, Gaab’s app), the accessibility of reading support tools (Immersive Reader), and the rigor of established screeners. This convergence, along with modern tech stack choices, positions the app to be effective globally.
5. Integration Ideas and Next Steps

To tie everything together, here are recommendations and integration strategies for building the MVP in a way that prioritizes accessibility, inclusivity, and scalability:

    Design Strategy: Adopt a user-centered design process. Involve educators and students in testing early wireframes or prototypes. Use design elements known to help dyslexic users – clear fonts, adequate spacing, visual supports – as non-negotiables​
    uxdesign.cc
    ​
    uxdesign.cc
    . Keep the interface uncluttered and consistent (e.g., same icon for “play audio” everywhere). Provide multiple ways to consume content (read, listen, watch).

    Tech Stack Summary: Use React for web (possibly as a PWA for offline use) and Flutter for mobile, sharing design assets and branding between them for consistency. Leverage Firebase for its real-time database and offline capabilities to start​
    linkedin.com
    . As the user base grows, monitor costs; if needed, consider moving to a hybrid approach (for instance, continue using Firebase Auth but store data in Firestore or use Supabase for certain datasets that need SQL querying). Both React and Flutter can interface with Firebase easily (Flutter has Firebase plugins; React can use the Firebase JS SDK).

    Modular Development: Build the questionnaire as a separate module (maybe even as a mini-library) so that it can be updated or expanded without touching the game code, and vice versa. This modular approach also means parts of the system (like the survey engine) could potentially be open-sourced for community contributions or reused for other screenings.

    Libraries & Resources: Take advantage of existing libraries to save time:

        For forms: SurveyJS (React) or flutter_survey (Flutter) to implement branching questionnaires quickly​
        michelphoenix98.medium.com
        .

        For games: Look at Flutter’s Flame engine examples for mini-games, or use simple stateful widgets for memory games etc. The Flutter Casual Games Toolkit​
        flutter.dev
        might have useful patterns for structuring a game loop.

        For charts: Chart.js (React) and fl_chart (Flutter) to visualize results without heavy custom drawing.

        For PDF: jsPDF or @react-pdf for web​
        pdfendpoint.com
        , and Dart pdf for Flutter​
        pub.dev
        . These have many tutorials (e.g., generating PDF in Flutter​
        geeksforgeeks.org
        ) to guide the implementation.

        For TTS: Web Speech API (no extra dependency) and flutter_tts​
        gamesinflutter.com
        , which is well-documented and widely used.

        For fonts: Google Fonts provides Lexend and other readable fonts. OpenDyslexic can be obtained from its website (as .woff or .ttf) and self-hosted.

    Data & Analytics: Initially, focus analytics on usage (how many complete the screening, how long it takes, where drop-offs happen). Avoid overly invasive analytics, but understanding usage will guide improvements. For instance, if many users quit during a certain game, that might indicate it’s too hard or not engaging. With a backend like Firebase, you can use Google Analytics for Firebase to log custom events (just be sure to disclose this and allow opt-out to respect privacy). On the flip side, collecting screening result data (with consent) could start building a valuable anonymized dataset. Over time, applying data analysis or machine learning on aggregated results might refine the screening’s accuracy (just as research like Luz Rello’s used machine learning to improve Dytective​
    cs.cmu.edu
    ).

    Global Deployment: Plan for cloud functions or services in multiple regions to ensure the app is snappy worldwide. Firebase has multi-region support; Supabase can be self-hosted in various regions if needed. Use a CDN for assets (images, scripts) so that, say, a user in Asia loads resources from a nearby server. Also, prepare for translations – even if you launch in one language, structure the app to add others. Perhaps partner with dyslexia associations in different countries to get help translating and localizing content; this also helps adoption (those organizations might promote the app if it’s in their language and culturally tuned).

    Support & Professional Integration: Since the goal is to connect users to professional services for exam accommodations, consider building a feature (maybe not MVP, but soon after) to facilitate that connection. For example, after showing results, the app could list certified dyslexia specialists or centers in the user’s region (a simple integration could be using a map API or a maintained list of providers). Alternatively, the app could generate an email template or recommendation letter to take to a school’s special needs coordinator. These integrations make it easier for the user to act on the screening results – a critical step so that the MVP actually leads to real-world support.

    Testing & Iteration: Finally, treat the MVP as an evolving product. Gather feedback from initial users (maybe do a closed beta with a few international schools). There may be unforeseen challenges – e.g., maybe younger students struggle with the login process, so you might switch to a class code system or no-login flow. Or perhaps a certain game isn’t yielding useful data, so you swap it out. Staying agile and user-focused will ensure the product truly helps students worldwide obtain the accommodations and support they need.

By following these strategies, the resulting MVP will not only be globally effective in terms of technical reach and language support, but also genuinely helpful and empathetic to users with dyslexia. The combination of thoughtful design, careful tech choices, offline-first functionality, and evidence-based features will set the stage for a tool that can make a positive impact in many students’ lives – guiding them toward the professional help for exam arrangements and giving them early confidence that their challenges are recognized and can be addressed.

Sources:

    Bjorn the UX Dog. “Accessibility: how to involve dyslexic users in your design.” UX Collective – discusses universal design and dyslexia (e.g. five principles: flexibility, simplicity, etc.)​
    uxdesign.cc
    , and suggests offering dyslexia-friendly fonts like OpenDyslexic or Dyslexie as an option​
    uxdesign.cc
    .

    Eva Katharina Wolf. “Software accessibility for users with Dyslexia.” UX Collective – provides tips like using short sentences, bulleted lists​
    uxdesign.cc
    , not blocking native features (zoom, spellcheck, copy)​
    uxdesign.cc
    , and highlights features such as text-to-speech (e.g., Medium’s integration of Speechify)​
    uxdesign.cc
    and Bionic Reading.

    British Dyslexia Association – Dyslexia Friendly Style Guide (2018) summarizes best practices for text: use clear sans-serif fonts at comfortable size, ample spacing, avoid italics/underlines​
    uxdesign.cc
    , ensure good contrast and consider off-white backgrounds​
    uxdesign.cc
    , left-align text and avoid dense layouts​
    uxdesign.cc
    .

    Firebase vs Supabase for MVP: Amit Goti, “Firebase vs Supabase: Best for FlutterFlow” – notes Firestore’s offline persistence and massive scalability​
    linkedin.com
    , and mentions Supabase’s strengths (SQL, open source) but that its offline support is still in development​
    linkedin.com
    . Verdict: Firebase is ideal for offline-heavy, large-scale needs​
    linkedin.com
    .

    Survey/Form Libraries: SurveyJS documentation – demonstrates dynamic JSON-driven forms with conditional branching and multi-language support​
    techifysolutions.com
    . Michel Thomas’s flutter_survey package – handles nested conditional questions in Flutter, as shown in his example code and Medium article​
    michelphoenix98.medium.com
    .

    PDF Generation: Node.js HTML-to-PDF blog – lists popular libraries like Puppeteer, html-pdf, pdfmake, jsPDF for generating PDFs from web content​
    pdfendpoint.com
    . Dart pdf package – allows Flutter apps to generate multi-page PDFs with text, images, and graphics entirely on-device​
    pub.dev
    .

    Existing Tools: UNESCO report on Change Dyslexia – highlights that the Dytective screening game has reached 250k people in 43 countries​
    unesco.org
    . K-12Dive article on Gaab’s Early Literacy app – describes a 20-minute game-based, adaptive screening app being piloted in multiple U.S. states​
    k12dive.com
    , featuring child-friendly design (animal characters) and aiming for preventive early identification.