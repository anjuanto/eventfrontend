import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private group: any = null; // Declare the group property

  setGroupDetails(group: any): void {
    this.group = group;
    localStorage.setItem('groupDetails', JSON.stringify(group)); // Save to localStorage
  }

  getGroupDetails(): any {
    if (!this.group) {
      const groupString = localStorage.getItem('groupDetails');
      try {
        this.group = groupString ? JSON.parse(groupString) : null;
      } catch (error) {
        console.error('Error parsing group details from localStorage:', error);
        this.group = null;
      }
    }
    return this.group;
  }

  clearGroupDetails(): void {
    this.group = null;
    localStorage.removeItem('groupDetails');
  }
}
