import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-master',
  templateUrl: './event-master.component.html',
  styleUrls: ['./event-master.component.css']
})
export class EventMasterComponent {
  currentDate: string;
  date: Date;
  month: string = '';  // Default empty string
  day: number = 0;     // Default to 0
  weekday: string = ''; // Default empty string

  // Define month and weekday names
  monthNames: string[] = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  weekdays: string[] = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  constructor(private router: Router) {
    const today = new Date();
    this.currentDate = today.getDate().toString();
    this.date = today; // Initialize the date
  }

  ngOnInit() {
    if (!this.date) {
      this.date = new Date(); // Fallback to current date if not set
    }
    this.month = this.monthNames[this.date.getMonth()];
    this.day = this.date.getDate();
    this.weekday = this.weekdays[this.date.getDay()];
  }
  
  navigateToEvents() {
    this.router.navigate(['/events']);
  }

  navigateToVenueForm() {
    this.router.navigate(['/create-event']);
  }

  navigateToHodApprovedevent() {
    this.router.navigate(['/hod-approvedevents']);
  }

  navigateTopic() {
    this.router.navigate(['/pic']);
  }

  navigateTodirector() {
    this.router.navigate(['/director']);
  }

  navigateToedit() {
    this.router.navigate(['/eventedit']);
  }

  navigateToaccount() {
    this.router.navigate(['/account']);
  }

  navigateTocompletedevent() {
    this.router.navigate(['/complete']);
  }

  navigateTouser() {
    this.router.navigate(['/user']);
  }

  navigateTopharmacy() {
    this.router.navigate(['/pharmacy']);
  }

  navigateTopurchase() {
    this.router.navigate(['/purchase']);
  }

  navigateTosoftware() {
    this.router.navigate(['/software']);
  }

  navigateTocalender() {
    this.router.navigate(['/calander']);
  }
  navigateToassignedstaff() {
    this.router.navigate(['/assigendstaff']);
  }
  navigateTovenueincharge() {
    this.router.navigate(['/Venueincharge']);
  }
}
