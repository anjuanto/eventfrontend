import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { EventService } from 'src/app/service/event.service';
import { PageEvent } from '@angular/material/paginator'; // Import PageEvent

@Component({
  selector: 'app-venueincharge',
  templateUrl: './venueincharge.component.html',
  styleUrls: ['./venueincharge.component.css'],
})
export class VenueinchargeComponent implements OnInit {
  events: any[] = [];
  errorMessage: string | null = null;
  customStartDate?: Date;
  customEndDate?: Date;
  showCustomDatePickers = false;
  selectedDateRange: 'week' | 'month' | 'today' | 'custom' | null = null;
  paginatedEvents: any[] = []; 
  pageSize: number = 3;
  currentPage: number = 0;
  searchTerm: string = ''; 

  constructor(private eventService: EventService, private router: Router) {} // Inject Router

  ngOnInit(): void {
    const user_id = 3236; // Replace with dynamic logic if necessary
    this.loadVenueInchargeEvents(user_id); // Pass user_id as a number
  }
  
  
  
  setDateRangeAndFetchEvents(range: 'week' | 'month' | 'today' | 'custom' | null): void {
    const today = new Date();
    const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
    let startDate: Date | null = null;
    let endDate: Date | null = null;
  
    // Set the selected date range based on user input
    if (range === 'today') {
      startDate = normalizeDate(today);
      endDate = normalizeDate(today);
    } else if (range === 'week') {
      startDate = normalizeDate(today);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (range === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (range === 'custom') {
      if (this.customStartDate && this.customEndDate) {
        startDate = normalizeDate(this.customStartDate);
        endDate = normalizeDate(this.customEndDate);
      } else {
        this.errorMessage = 'Please select both start and end dates for the custom range.';
        return;
      }
    }
  
    // Fetch data with the selected date range (if any)
    this.selectedDateRange = range;
    this.loadVenueInchargeEvents(3236, startDate, endDate); // Pass startDate and endDate
  
    // Hide the custom date pickers once the range is selected
    this.showCustomDatePickers = false;
  }
  
  
  loadVenueInchargeEvents(userId: number, startDate?: Date | null, endDate?: Date | null): void {
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : null;
  
    const payload: any = { user_id: userId };
    if (formattedStartDate) payload.start_date = formattedStartDate;
    if (formattedEndDate) payload.end_date = formattedEndDate;
  
    console.log('Payload being sent to API:', payload);
  
    this.eventService.getVenueInchargeEvents(payload).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response && response.events && response.events.events) {
          this.events = response.events.events;  // Update the events data
          this.events.sort((a: any, b: any) => {
            const dateA = new Date(a.datetime_from).getTime();
            const dateB = new Date(b.datetime_from).getTime();
            return dateA - dateB; // Ascending order
          });
          if (this.events.length === 0) {
            this.errorMessage = 'No events found for the specified venue incharge.';
          } else {
            this.errorMessage = null;
          }
        } else {
          this.events = [];  // Initialize as empty if the response does not contain events
          this.errorMessage = 'No events found for the specified venue incharge.';
        }
        this.updatePaginatedEvents();  // Re-trigger pagination logic after data is updated
      },
      error: (error) => {
        console.error('API Error:', error);
        this.errorMessage = error.error?.message || 'An error occurred while fetching events.';
      }
    });
  }
  
  updatePaginatedEvents(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
  
    if (Array.isArray(this.events)) {
      this.paginatedEvents = this.events.slice(startIndex, endIndex);
    } else {
      console.error('Expected an array, but got:', this.events);
    }
  }
  
  handlePageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedEvents();
  }
 
  filterEvents(): void {
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.trim().toLowerCase();
      this.paginatedEvents = this.events.filter(event =>
        (event.title && event.title.toLowerCase().includes(searchLower)) ||
        (event.event_venue?.name && event.event_venue.name.toLowerCase().includes(searchLower))
      );
    } else {
      // If the search term is empty, reset to the paginated events
      this.updatePaginatedEvents();
    }
  }
  
  
  

  toggleCustomDatePickers(): void {
    this.showCustomDatePickers = !this.showCustomDatePickers;
  }

  goBack(): void {
    this.router.navigate(['/event-master']); // Replace '/eventmaster' with the actual route
  }
}
