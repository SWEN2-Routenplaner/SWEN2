import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../states/auth-store';
import { Search } from './search/search';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Search],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class NavbarComponent {
  authStore = inject(AuthStore);

  logout(): void {
    this.authStore.logout();
  }
}
