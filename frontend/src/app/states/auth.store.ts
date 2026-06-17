import {Injectable, computed, signal, model, inject} from '@angular/core';
import {User} from '../models/user.model';
import {HttpClient} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class AuthStore {
  private http = inject(HttpClient);

  // Original states (Model)
  readonly isAuthenticated = signal(false);
  readonly user = signal<any | null>(null);
  readonly error = signal<string | null>(null);

  // Derived states (View Model/Computed)
  readonly isAuthenticated$ = computed(() => this.isAuthenticated());
  readonly user$ = computed(() => this.user());
  readonly error$ = computed(() => this.error());

  /*
  * Functions
  * */
  logout(): void {
    this.isAuthenticated.set(false);
    this.user.set(null);
  }

  login(): void {
    // Redirect to backend to initiate OAuth2/OIDC flow with Authentik
    window.location.href = 'http://localhost:8080/oauth2/authorization/authentik';
  }

  fetchUser(): void {
    this.http.get('http://localhost:8080/api/user/me', { withCredentials: true })
      .subscribe({
        next: (data: any) => {
          if (data.authenticated) {
            this.isAuthenticated.set(true);
            this.user.set(data);
          } else {
            this.isAuthenticated.set(false);
            this.user.set(null);
          }
        },
        error: (err) => {
          console.error('Failed to fetch user', err);
          this.isAuthenticated.set(false);
          this.user.set(null);
        }
      });
  }

  // User should be pre-checked by the function calling this function
  register(user: User): void {
    // this.users.push(user); // mock call removed

    this.isAuthenticated.set(true);
    this.user.set(user);
  }
}
