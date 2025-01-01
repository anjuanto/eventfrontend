import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  venues: any = {}; // Initialize venues as an empty object
  displayedColumns: string[] = ['id', 'Title','date_range','venue_edit'];
  dataSource: any[] = []; // Holds the children array for the table
  @Input() event: any;

  constructor(
    private router: Router,
    private eventService: EventService // Inject your service
  ) {}

  ngOnInit(): void {
    const parentId = sessionStorage.getItem('parent_id');

    
    if (parentId) {
      this.fetchVenueDetails(+parentId); // Ensure parentId is passed as a number
    } else {
      console.error('No parent ID found in sessionStorage.');
    }
  }

  fetchVenueDetails(parentId: number): void {
    this.eventService.getEvent(parentId).subscribe({
      next: (venueData: any) => {
        this.venues = venueData;
        console.log(this.venues);
  
        this.dataSource = [
          {
            ...this.venues,
            editingTimeFrom: false,
            editingTimeTo: false,
            editTimeFrom: this.formatTime(this.venues.datetime_from),
            editTimeTo: this.formatTime(this.venues.datetime_to),
            editDateFrom: this.formatDate(this.venues.datetime_from),
            editDateTo: this.formatDate(this.venues.datetime_to)
          },
          ...(this.venues.children || []).map((child: any) => ({
            ...child,
            editingTimeFrom: false,
            editingTimeTo: false,
            editTimeFrom: this.formatTime(child.datetime_from),
            editTimeTo: this.formatTime(child.datetime_to),
            editDateFrom: this.formatDate(child.datetime_from),
            editDateTo: this.formatDate(child.datetime_to)
          }))
        ];
      },
      error: (error) => {
        console.error('Error fetching event data:', error);
      }
    });
  }

// Convert datetime to a specific time zone or handle local time
formatTime(datetime: string): string {
  const date = new Date(datetime);
  // Format time as 'HH:MM' in 24-hour format without 'AM/PM'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false});
}


formatDate(datetime: string): string {
  const date = new Date(datetime);
  // Ensure the date is formatted as needed
  return date.toLocaleDateString();
}

  // Edit specific time field
  editTime(element: any, field: 'time_from' | 'time_to') {
    this.dataSource.forEach(row => {
      row.editingTimeFrom = false;
      row.editingTimeTo = false;
    });
    if (field === 'time_from') {
      element.editingTimeFrom = true;
    } else if (field === 'time_to') {
      element.editingTimeTo = true;
    }
  }

  cancelEdit(element: any, field: 'time_from' | 'time_to') {
    if (field === 'time_from') {
      element.editingTimeFrom = false;
      element.editTimeFrom = this.formatTime(element.datetime_from);
    } else if (field === 'time_to') {
      element.editingTimeTo = false;
      element.editTimeTo = this.formatTime(element.datetime_to);
    }
  }

 

  updateDateTime(originalDateTime: string, newTime: string): string {
    const [date, time] = originalDateTime.split(' ');
    return `${date} ${newTime}`;
  }

  back() {
    this.router.navigate(['/create-event']);
  }
  VenueEdit(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/venueedit', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }
}
