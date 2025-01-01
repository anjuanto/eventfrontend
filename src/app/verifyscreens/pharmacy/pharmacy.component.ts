import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/service/event.service'; // Adjust the path as needed
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator'; // Import PageEvent


@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css'],


})
export class PharmacyComponent implements OnInit {
  customStartDate?: Date;
  customEndDate?: Date;
  errorMessage: string = '';
  showCustomDatePickers = false;
  eventsData: any[] = [];  // Property to store the fetched data
  paginatedEvents: any[] = []; // Subset of events for the current page
  selectedDateRange: 'week' | 'month' | 'today' | 'custom' | null = null;
  pageSize: number = 5;
  currentPage: number = 0;
  searchTerm: string = ''; // Search term for filtering

  constructor(private eventService: EventService, private router: Router) {}


  ngOnInit(): void {
    // By default, fetch all events without any date range
    this.fetchGroupedData(null, null);


  }

  setDateRangeAndFetchEvents(range: 'week' | 'month' | 'today' | 'custom' | null): void {
    const today = new Date();
    const normalizeDate = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    // Set the selected date range based on user input
    if (range === 'today') {
      this.showCustomDatePickers = false;
      startDate = normalizeDate(today);
      endDate = normalizeDate(today);
    } else if (range === 'week') {
      this.showCustomDatePickers = false;
      startDate = normalizeDate(today);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (range === 'month') {
      this.showCustomDatePickers = false;
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (range === 'custom') {
      this.showCustomDatePickers = false;
      if (this.customStartDate && this.customEndDate) {
        startDate = normalizeDate(this.customStartDate);
        endDate = normalizeDate(this.customEndDate);
      } else {
        this.errorMessage = 'Please select both start and end dates for the custom range.';
        return;
      }
    }

    this.selectedDateRange = range;
    this.fetchGroupedData(startDate, endDate, );
    this.showCustomDatePickers = false;
  }

  fetchGroupedData(startDate: Date | null, endDate: Date | null): void {
    const params: any = {
      ...(startDate && { start_date: startDate.toISOString().split('T')[0] }),
      ...(endDate && { end_date: endDate.toISOString().split('T')[0] }),
      status: "Director-Approved,Notified Supporting Departments,Completed",
    };
   
    console.log('Params being sent:', params);
    this.eventService.getEventsByDate(params).subscribe({
      next: (data) => {
        console.log('Grouped data:', data);
        if (Array.isArray(data.events)) {
          this.eventsData = data.events;

          this.eventsData.sort((a: any, b: any) => {
            const dateA = new Date(a.datetime_from).getTime();
            const dateB = new Date(b.datetime_from).getTime();
            return dateA - dateB; // Ascending order
          });
          console.log('Sorted Events:', this.eventsData);
        } else if (data.events && typeof data.events === 'object') {
          this.eventsData = Object.values(data.events);
        } else {
          this.eventsData = [];
          console.warn('Unexpected data format for events:', data.events);
        }
  
        this.updatePaginatedEvents(); // Update paginated events after data assignment
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      },
    });
  }
  handlePageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedEvents();
  }

  updatePaginatedEvents(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.eventsData.slice(startIndex, endIndex);
  }

  toggleCustomDatePickers(): void {
    this.eventsData =[];
    this.showCustomDatePickers = !this.showCustomDatePickers;
  }
  filterEvents(): void {
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.trim().toLowerCase();
      this.paginatedEvents = this.eventsData.filter(event =>
        (event.title && event.title.toLowerCase().includes(searchLower)) ||
        (event.event_venue?.name && event.event_venue.name.toLowerCase().includes(searchLower))
      );
    } else {
      // If the search term is empty, reset to the paginated events
      this.updatePaginatedEvents();
    }
  }

  showevent(id: number): void {
    const entityType = 'pharmacy';
  
    this.eventService.verifyEntity(entityType, id).subscribe(
      (response) => {
        console.log(response.message);
  
        // Find and update the event in the eventsData array
        const eventToUpdate = this.eventsData.find(event => event.id === id);
        if (eventToUpdate) {
          eventToUpdate.accounts_verified = 1; // Update the accounts_verified property
        } else {
          console.error('Event not found in the data');
        }
  
        // Navigate to the details page
        const currentUrl = this.router.url;
        this.router.navigate(['/showdetail', id], {
          queryParams: { returnUrl: currentUrl },
        });
      },
      (error) => {
        console.error('Error verifying entity:', error);
        // Handle button text change or show error feedback if required
      }
    );
  }
  goBack(): void {
    this.router.navigate(['/event-master']); 
  }  



}
