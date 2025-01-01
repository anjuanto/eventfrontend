import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/service/event.service';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-assigenedstaff',
  templateUrl: './assigenedstaff.component.html',
  styleUrls: ['./assigenedstaff.component.css']
})
export class AssigenedstaffComponent implements OnInit {
  userId: number = 3236; // Hardcoding the user_id as 3236
  assignedUserDetails: any[] = []; // All assigned user data
  AssignedUserDetails: any[] = [] ;
  errorMessage: string | null = null;
  customStartDate?: Date;
  customEndDate?: Date;
  showCustomDatePickers = false;
  totalItems: number = 0;
  pageSize: number = 2;
  currentPage: number = 0;
  loading: boolean = false;
  

  searchQuery: string = ''; // Variable to hold the search query
  filteredAssignedUserDetails: any[] = []; // To store filtered assigned users for search

  // To store the count of users for each date range
  userCountByRange: { [key: string]: number } = {
    today: 0,
    week: 0,
    month: 0,
    custom: 0
  };

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true; 
    this.setDateRangeAndFetchEvents('all');
  }
  setDateRangeAndFetchEvents(range: 'all' | 'week' | 'month' | 'today' | 'custom'): void {
    const today = new Date();
    const normalizeDate = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let completed: string | undefined; // Default to undefined
    
    // Handle different date ranges
    if (range === 'today') {
      this.showCustomDatePickers = false;
      startDate = normalizeDate(today);
      endDate = normalizeDate(today);
    } else if (range === 'week') {
      this.showCustomDatePickers = false;
      startDate = normalizeDate(today);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Adjust for inclusive range
    } else if (range === 'month') {
      this.showCustomDatePickers = false;
      startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
      endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0));
    } else if (range === 'custom') {
      this.showCustomDatePickers = false;
        // Validate if custom start and end dates are provided
      if (this.customStartDate && this.customEndDate) {
        startDate = normalizeDate(this.customStartDate);
        endDate = normalizeDate(this.customEndDate);
        completed = 'true'; // Set completed to 'true' for custom range
      } else {
        this.errorMessage = 'Please select both start and end dates for the custom range.';
        this.loading = false;
        return;
      }
    } else if (range === 'all') {
      this.showCustomDatePickers = false;
      startDate = undefined;
      endDate = undefined;
    }
  
    // Fetch data for the selected range
    if (range !== 'custom' || (startDate && endDate)) {
      this.getAssignedUserDetails(this.userId, startDate, endDate, range, completed);
    }
  }
  
  getAssignedUserDetails(userId: number,startDate?: Date,endDate?: Date,range?: 'today' | 'week' | 'month' | 'custom' | 'all',completed?: string ): void {
    this.loading = true; // Set loading before fetching data
    this.assignedUserDetails = []; // Clear previous data to avoid mixing
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : undefined;
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : undefined;
  
    // Pass `completed` to the service
    this.eventService.getAssignedUserDetails(userId, formattedStartDate, formattedEndDate, completed).subscribe(
      (response) => {
        if (response.success) {
          console.log(response);
          this.assignedUserDetails = response.data;
          this.assignedUserDetails.sort((a: any, b: any) => {
            const dateA = new Date(a.event_master.datetime_from).getTime();
            const dateB = new Date(b.event_master.datetime_from).getTime();
            return dateA - dateB; // Ascending order
          });
          this.totalItems = this.assignedUserDetails.length;
          this.filteredAssignedUserDetails = [...this.assignedUserDetails];
          if (range) {
            this.userCountByRange[range] = this.totalItems;
          }
          this.updatePaginatedAssignedUserDetails();
        } else {
          this.errorMessage = response.message;
        }
        this.loading = false; // Turn off loading after processing
      },
      (error) => {
        console.error('Error fetching assigned user details:', error);
        this.errorMessage = 'An error occurred while fetching the data.';
        this.loading = false; // Turn off loading in case of an error
      }
    );
  }
  
  toggleCustomDatePickers(): void {
    this.assignedUserDetails = [];
    this.filteredAssignedUserDetails = []; 
    this.totalItems = 0; 
    this.updatePaginatedAssignedUserDetails(); 
    this.showCustomDatePickers = !this.showCustomDatePickers;
  }
  
  updatePaginatedAssignedUserDetails(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.AssignedUserDetails = this.filteredAssignedUserDetails.slice(startIndex, endIndex);
    //console.log(  this.AssignedUserDetails);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedAssignedUserDetails();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery = query;

    if (query) {
      this.filteredAssignedUserDetails = this.assignedUserDetails.filter(user => {
        // Adjust based on your data structure (assuming 'title' exists in user details)
        return user?.event_master?.title?.toLowerCase().includes(query);
      });
    } else {
      this.filteredAssignedUserDetails = [...this.assignedUserDetails];
    }

    this.updatePaginatedAssignedUserDetails(); // Recalculate pagination after search
  }

  onCardClick(eventMasterId: number): void {
    console.log('Clicked Event Master ID:', eventMasterId);

    const matchedEvent = this.assignedUserDetails.find(
      item => item.event_master?.id === eventMasterId
    );

    if (matchedEvent) {
      console.log('Matched Event:', matchedEvent);

      const eventMasterProductDetails = Object.values(matchedEvent.event_master?.eventMasterProductDetails || {});
      console.log('Event Master Product Details:', eventMasterProductDetails);

      if (eventMasterProductDetails.length > 0) {
        this.router.navigate(['/assignwork', eventMasterId], {
          state: {
            eventMasterProductDetails,
            eventMasterId,
            event_master: matchedEvent.event_master, // Include the full event_master details
          },
        });
      } else {
        console.error(`No eventMasterProductDetails found for this event_master_id: ${eventMasterId}`);
      }
    } else {
      console.error(`No event found for event_master_id: ${eventMasterId}`);
    }
  }



  goBack(): void {
    this.router.navigate(['/event-master']);
  }
}
