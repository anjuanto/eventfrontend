import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { Event } from 'src/app/models/event';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  eventTypes: any[] = [];
  venues: any[] = [];
  amalaProjects: any[] = [];
  departments: any[] = [];
  events: Event[] = [];
  error: string | null = null;
  filteredEvents: Event[] = [];
  filterSelected: boolean = false;
  showFilters: boolean = false;
  selectedEventTypeIds: string[] = [];
  selectedVenues: number[] = [];
  selectedAmalaProjectIds: number[] = [];
  selectedStartDate: Date | null = null; // Track selected date
  minDate: Date = new Date();
  selectedEndDate: Date | null = null;
  selectedStatus: string | null = null;
  statusOptions: string[] = ['HOD-Approved','Director-Approved','Priest-Incharge-Approved','Priest-Incharge-Rejected','Director-Rejected','HOD-Rejected','Scheduled'];


  constructor(private eventService: EventService, private router: Router) { }

  ngOnInit(): void {
    this.minDate = new Date(); // Set minimum date to the current date
    this.selectedStartDate = this.minDate;
    this.loadEventTypes();
    this.loadVenues();
    this.loadAmalaProjects();
    this.loadEvents();
  }

  loadEventTypes(): void {
    this.eventService.getEventTypes().subscribe(
      (data: any[]) => {
        this.eventTypes = data;
      },
      (error) => {
        console.error('Error fetching event types', error);
      }
    );
  }
  toggleFilters(): void {
    this.showFilters = !this.showFilters; // Toggle the visibility
  }

  loadVenues(): void {
    this.eventService.getEventVenues().subscribe(
      (data: any[]) => {
        this.venues = data;
      },
      (error) => {
        console.error('Error fetching venues', error);
      }
    );
  }

  loadAmalaProjects(): void {
    this.eventService.getAmalaProjects().subscribe(
      (data: any[]) => {
        this.amalaProjects = data;
      },
      (error) => {
        console.error('Error fetching Amala Projects', error);
      }
    );
  }

  loadEvents(): void {
    this.eventService.getEventList().subscribe({
      next: (data: Event[]) => {
        this.events = data.filter(event => event.parent_id === null);
      },
      error: (err) => {
        this.error = 'Failed to load events';
        console.error('Error loading events:', err);
      }
    });
  }


  toggleEventTypeSelection(eventTypeId: string): void {
    const index = this.selectedEventTypeIds.indexOf(eventTypeId);
    if (index === -1) {
      this.selectedEventTypeIds.push(eventTypeId);
    } else {
      this.selectedEventTypeIds.splice(index, 1);
    }
    if (this.selectedEventTypeIds.length > 0) {
      const idsAsNumbers = this.selectedEventTypeIds.map(id => Number(id));
      this.filteredEvents = this.events.filter(event =>
        idsAsNumbers.includes(event.event_type_id) && event.parent_id === null
      );
    } else {
      this.filteredEvents = this.events.filter(event => event.parent_id === null);
    }
  
    this.filterSelected = this.filteredEvents.length > 0;
  }
  removeEventType(eventTypeId: string): void {
    const index = this.selectedEventTypeIds.indexOf(eventTypeId);
    if (index > -1) {
      this.selectedEventTypeIds.splice(index, 1); 
      if (this.selectedEventTypeIds.length > 0) {
        const idsAsNumbers = this.selectedEventTypeIds.map(id => Number(id));
        this.filteredEvents = this.events.filter(event =>
          idsAsNumbers.includes(event.event_type_id) && event.parent_id === null
        );
      } else {
        this.filteredEvents = [];
      }
      
      this.filterSelected = this.filteredEvents.length > 0;
    }
  }
  isEventTypeSelected(eventTypeId: string): boolean {
    return this.selectedEventTypeIds.includes(eventTypeId);
  }
    
  toggleVenueAndFilterEvents(venueId: number): void {
    const index = this.selectedVenues.indexOf(venueId);
  
    if (index >= 0) {
      this.selectedVenues.splice(index, 1); 
    } else {
      this.selectedVenues.push(venueId); 
    }

    if (this.selectedVenues.length === 0) {
      this.filteredEvents = []; 
    } else {
    
      this.filteredEvents = this.events.filter(event =>
        this.selectedVenues.includes(event.event_venue_id) && event.parent_id === null
      );
    }
  
    this.filterSelected = this.filteredEvents.length > 0;
  }
  isVenueSelected(venueId: number): boolean {
    return this.selectedVenues.includes(venueId);
  }

  removeVenue(venueId: number): void {
    const index = this.selectedVenues.indexOf(venueId);
  
    if (index >= 0) {
      this.selectedVenues.splice(index, 1);
    }
    if (this.selectedVenues.length === 0) {
      this.filteredEvents = []; 
    } else {
      this.filteredEvents = this.events.filter(event =>
        this.selectedVenues.includes(event.event_venue_id) && event.parent_id === null
      );
    }
  
    this.filterSelected = this.filteredEvents.length > 0;
  }

  toggleAmalaProjectSelection(projectId: number): void {

    const index = this.selectedAmalaProjectIds.indexOf(projectId);
    if (index >= 0) {
      this.selectedAmalaProjectIds.splice(index, 1);
    } else {
      this.selectedAmalaProjectIds.push(projectId);
    }
    if (this.selectedAmalaProjectIds.length === 0) {
      this.filteredEvents = [];
    } else {
      this.filteredEvents = this.events.filter(event => 
        this.selectedAmalaProjectIds.includes(Number(event.amala_project_id)) && event.parent_id === null
      );
    }
    this.filterSelected = this.filteredEvents.length > 0;
  }
  
  isAmalaProjectSelected(projectId: number): boolean {
    return this.selectedAmalaProjectIds.includes(projectId);
  }

  removeAmalaProject(projectId: number): void {
    const index = this.selectedAmalaProjectIds.indexOf(projectId);
  
    if (index >= 0) {
      this.selectedAmalaProjectIds.splice(index, 1);
    }
    if (this.selectedAmalaProjectIds.length === 0) {
      this.filteredEvents = []; 
    } else {
      this.filteredEvents = this.events.filter(event => 
        this.selectedAmalaProjectIds.includes(Number(event.amala_project_id)) && event.parent_id === null
      );
    }
  
    this.filterSelected = this.filteredEvents.length > 0;
  }
  
  

  showevent(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/showdetail', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }




 

// Method to filter events based on selected date range
filterEventsByDateRange(): void {
  // Log the start and end dates to check if they are different
  //console.log('Selected Start Date:', this.selectedStartDate);
  //console.log('Selected End Date:', this.selectedEndDate);

  if (this.selectedStartDate && this.selectedEndDate) {
    const startDate = new Date(this.selectedStartDate);
    const endDate = new Date(this.selectedEndDate);

   // console.log('Start Date Object:', startDate);
    //console.log('End Date Object:', endDate);

    this.filteredEvents = this.events.filter(event => {
      const eventStart = new Date(event.datetime_from);
      const eventEnd = new Date(event.datetime_to);

      // Check if the event overlaps with the selected date range
      return (
        (eventStart >= startDate && eventStart <= endDate) ||
        (eventEnd >= startDate && eventEnd <= endDate) ||
        (eventStart <= startDate && eventEnd >= endDate)
      );
    });


  } else {
    // If either date is not set, show all events
    this.filteredEvents = this.events;
  }
}
filterEventsByStatus(): void {
  if (this.selectedStatus) {
    this.filteredEvents = this.events.filter(event => event.status?.status === this.selectedStatus);
  } else {
    this.filteredEvents = this.events; // Reset to all events if no status selected
  }
}

selectStatus(status: string): void {
  // Toggle selection of status
  this.selectedStatus = this.selectedStatus === status ? null : status;
  this.filterEventsByStatus();
}





  

 
  
 
}
