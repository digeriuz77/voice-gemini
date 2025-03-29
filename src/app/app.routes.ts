import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { VoiceChatComponent } from './voice-chat/voice-chat.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'chat', component: VoiceChatComponent },
  { path: '**', redirectTo: '' }
];
