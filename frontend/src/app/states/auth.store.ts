import {Injectable, computed, signal, model} from '@angular/core';
import {User} from '../models/user.model';

@Injectable({providedIn: 'root'})
export class AuthStore {
  // mock user List
  users: User[] = [
    {id: 1, name: 'Elias', password: 'password'},
    {id: 2, name: 'Tobias', password: 'password'},
    {id: 3, name: 'Jonas', password: 'password'}
  ]

  // Original states (Model)
  readonly isAuthenticated = signal(true);
  readonly user = signal<User | null>(null);
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

  login(user: User): void {
    const foundUser = this.users.find(u => u.name === user.name && u.password === user.password);

    if (!foundUser) {
      this.error.set('Invalid credentials')
      return;
    }

    this.isAuthenticated.set(true);
    this.user.set(foundUser);
  }

  // User should be pre-checked by the function calling this function
  register(user: User): void {
    this.users.push(user); // mock call to backend. TODO: REPLACE IT WITH REAL DB CALL LATER

    this.isAuthenticated.set(true);
    this.user.set(user);
  }
}
