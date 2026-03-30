import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {signal} from '@angular/core';

type TransportMode = 'car' | 'bike' | 'walk' | null;

@Component({
  selector: 'app-new-tour',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './new-tour.html',
  styleUrl: './new-tour.css',
  standalone: true
})
export class NewTourComponent {
  expanded = signal(false);
  selectedMode = signal<TransportMode>(null);

  toggleTransportMode(mode: TransportMode): void {
    // unselect if already selected
    if(this.selectedMode() === mode){
      this.selectedMode.set(null);
    }else{
      this.selectedMode.set(mode);
    }
  }

  toggleExpanded(): void {
    this.expanded.update(expanded => !expanded);
  }
}
