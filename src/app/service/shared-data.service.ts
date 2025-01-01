import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private storageKey = 'venuesData'; // Key for localStorage

  constructor() {}

  setData(data: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getData(): any {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  clearData(): void {
    localStorage.removeItem(this.storageKey);
  }
}
