import {Component, computed, inject, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../states/auth.store';
import { Search } from './search/search';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Search],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class NavbarComponent {
  authStore = inject(AuthStore);
  isMobileMenuOpen = signal(false);

  private baseLinks: NavLink[] = [
    { path: '/tours', label: 'Tours' }
  ];

  navLinks = computed(() => {
    if (this.authStore.isAuthenticated$()) {
      return [...this.baseLinks, { path: '/profile', label: 'Profile' }];
    }
    return [...this.baseLinks, { path: '/login', label: 'Login' }];
  });

  logout(): void {
    this.authStore.logout();
  }

  toggleMenu() {
    this.isMobileMenuOpen.update(state => !state);
  }
}
