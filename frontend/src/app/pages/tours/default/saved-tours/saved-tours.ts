import {Component, inject} from '@angular/core';
import {ToursStore} from '../../../../states/tours.store';
import {TourItemComponent} from './tour-item/tour-item';
import {CommonModule} from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-saved-tours',
  imports: [
    CommonModule,
    TourItemComponent,
    MatExpansionModule
  ],
  templateUrl: './saved-tours.html',
  styleUrl: './saved-tours.css',
  standalone: true
})
export class SavedToursComponent {
  toursStore = inject(ToursStore);
  tours = this.toursStore.allTours;
}
