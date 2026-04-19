import {Component, computed, inject, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../states/auth.store';
import { Search } from './search/search';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Search, MatInput, MatLabel, MatFormField, MatButton, MatIcon, MatIconButton, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class NavbarComponent {
  authStore = inject(AuthStore);
  isMobileMenuOpen = signal(false);
  searchQuery = signal('')

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
