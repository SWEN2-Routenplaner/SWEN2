import { Component } from '@angular/core';
import {SavedToursComponent} from './saved-tours/saved-tours';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-default',
  imports: [
    SavedToursComponent,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './default.html',
  styleUrl: './default.css',
  standalone: true
})
export class DefaultComponent {

}
