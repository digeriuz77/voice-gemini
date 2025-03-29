import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-pulse',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-pulse" [class.active]="active">
      <div *ngFor="let _ of [1, 2, 3]" class="pulse-bar"
           [style.height.px]="4 + volume * 20"></div>
    </div>
  `,
  styles: [`
    .audio-pulse {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 24px;
      height: 24px;
      padding: 4px;
    }
    
    .pulse-bar {
      width: 4px;
      background-color: currentColor;
      border-radius: 2px;
      transition: height 0.2s ease;
    }
    
    .active .pulse-bar {
      animation: pulse 1s infinite alternate ease-in-out;
    }
    
    @keyframes pulse {
      0% { transform: scaleY(0.6); }
      100% { transform: scaleY(1.2); }
    }
  `]
})
export class AudioPulseComponent {
  @Input() active: boolean = false;
  @Input() volume: number = 0;
  @Input() hover: boolean = false;
}
