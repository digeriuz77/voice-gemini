import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceInputStateService {
  // Default to muted
  private isMutedSubject = new BehaviorSubject<boolean>(true);
  isMuted$ = this.isMutedSubject.asObservable();

  constructor() { }

  setIsMuted(muted: boolean): void {
    this.isMutedSubject.next(muted);
  }

  getIsMuted(): boolean {
    return this.isMutedSubject.value;
  }
}
