import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar';
import {IonApp} from '@ionic/angular/standalone';
import { AuthStore } from './states/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, IonApp],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Tourplanner');
  authStore = inject(AuthStore);

  ngOnInit() {
    this.authStore.fetchUser();
  }
}

