import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/service/event.service';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-software',
  templateUrl: './software.component.html',
  styleUrls: ['./software.component.css'],
})
export class SoftwareComponent implements OnInit {
  user_id: number = 3236;
  departmentId: number = 147; // Example department ID
  groupedData: any = null;
  incharge: boolean = false;
  message: string = '';
  userId: number | null = null;
  department: string = '';
  eventFlags: { [key: number]: boolean } = {};
  customStartDate?: Date;
  customEndDate?: Date;
  errorMessage: string = '';
  showCustomDatePickers = false; 

     // Pagination variables
     paginatedEventIds: string[] = [];
     pageSize: number = 2;
     totalItems: number = 0;
     currentPage: number = 0;

     searchQuery: string = ''; // Store search input
filteredGroupedData: any = null; // Store filtered data
assignedUsers: { [eventId: number]: any[] } = {};

showAllUsers: boolean = false;
panelExpanded = false;

     


  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    const status = 'Notified Supporting Departments';  
    this.fetchGroupedData(null, null, this.user_id, status);  
}

  setDateRangeAndFetchEvents(range: 'week' | 'month' | 'today' | 'custom'): void {
    const today = new Date();
    const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let status: string = 'Notified Supporting Departments'; // Default status

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
            status = 'completed';  // Set status to 'completed' for custom range
        } else {
            this.errorMessage = 'Please select both start and end dates for the custom range.';
            return;
        }
    }

    if (startDate && endDate) {
        console.log('Fetching events:', startDate, endDate); // Debugging dates
        this.fetchGroupedData(startDate, endDate, this.user_id, status);  // Pass status to the fetch method
        this.showCustomDatePickers = false;
    }
}

fetchGroupedData(startDate: Date | null, endDate: Date | null, userId?: number, status?: string): void {
  // Do not assign current date if startDate or endDate is null
  const formatDate = (date: Date) => {
      const offsetDate = new Date(date.getTime() + (330 * 60 * 1000)); // Add 330 minutes (IST offset) to UTC
      return offsetDate.toISOString().slice(0, 10); // Extracts YYYY-MM-DD
  };
  const formattedStartDate = startDate ? formatDate(startDate) : undefined;
  const formattedEndDate = endDate ? formatDate(endDate) : undefined;
  console.log('Formatted Start Date:', formattedStartDate);
  console.log('Formatted End Date:', formattedEndDate);

  this.eventService.getServiceGroupedByDepartment(userId || this.user_id, formattedStartDate, formattedEndDate, status).subscribe({
      next: (response: any) => {
          console.log(response);
          this.groupedData = response.data;
          this.filteredGroupedData = this.groupedData;
          this.incharge = response.incharge;
          this.message = response.message;
          this.userId = response.user_id;

          // Store the response data in localStorage
          localStorage.setItem('groupedData', JSON.stringify(this.groupedData));

          if (this.groupedData) {
              const dynamicKeys = Object.keys(this.groupedData);
              const filteredKeys = dynamicKeys.filter(key => !isNaN(Number(key)));
              const selectedItems = filteredKeys.map(key => this.groupedData[key]);

              selectedItems.forEach(item => {
                  const eventMasterId = item?.eventMaster?.id;
                  if (eventMasterId) {
                      const departmentId = item?.eventMaster?.departmentId;
                      this.checkAssignedUsers(eventMasterId, departmentId);
                  }
              });
              this.updatePaginatedEventIds();
          } else {
              console.error('No grouped data found');
          }
      },
      error: (error) => {
          console.error('Error fetching data:', error);
      },
  });
}
  toggleCustomDatePickers(): void {
    this.groupedData = [];
    this.filteredGroupedData = [];
    this.showCustomDatePickers = !this.showCustomDatePickers;
  }
  checkAssignedUsers(eventMasterId: number, departmentId: number): void {
    this.eventService.getAssignedUser(eventMasterId, departmentId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          //console.log(response);
          // Store the assigned users in the assignedUsers object
          this.assignedUsers[eventMasterId] = response.data;
        }
      },
      error: (error) => {
        console.error('Error checking assigned users:', error);
      },
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery = query;
  
    if (query) {
      this.filteredGroupedData = Object.keys(this.groupedData)
        .filter(key => {
          const event = this.groupedData[key];
          // Check if eventMaster and title exist before searching
          const title = event?.eventMaster?.title?.toLowerCase(); // Adjust property name based on your structure
          return title && title.includes(query);
        })
        .reduce((obj: any, key) => {
          obj[key] = this.groupedData[key];
          return obj;
        }, {});
    } else {
      this.filteredGroupedData = this.groupedData;
    }
  
    this.updatePaginatedEventIds(); // Recalculate pagination after search
    this.updatePaginatedEvents(); // Recalculate paginated events
  }
  
  updatePaginatedEventIds(): void {
    const eventIds = Object.keys(this.filteredGroupedData || this.groupedData); 
    this.totalItems = eventIds.length;
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEventIds = eventIds.slice(startIndex, endIndex);
  }

  updatePaginatedEvents(): any[] {
    const eventKeys = Object.keys(this.filteredGroupedData || this.groupedData);
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedKeys = eventKeys.slice(startIndex, endIndex);
  
    return paginatedKeys.map(key => {
      const event = this.filteredGroupedData ? this.filteredGroupedData[key] : this.groupedData[key];
      return event ? { ...event, id: key } : null;
    }).filter(event => event !== null);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedEventIds();
    this.updatePaginatedEvents();
  }

  // updatePaginatedEventIds(): void {
  //   // Get the event IDs (keys from groupedData)
  //   const eventIds = Object.keys(this.groupedData);
  //   this.totalItems = eventIds.length;
  //   const startIndex = this.currentPage * this.pageSize;
  //   const endIndex = startIndex + this.pageSize;
  //   this.paginatedEventIds = eventIds.slice(startIndex, endIndex);
  // }
  
  // updatePaginatedEvents(): any[] {
  //   if (!this.groupedData || typeof this.groupedData !== 'object') {
  //     console.warn('Grouped data is not initialized or is invalid.');
  //     return [];
  //   }
  //   const eventKeys = Object.keys(this.groupedData);
  //   const startIndex = this.currentPage * this.pageSize;
  //   const endIndex = startIndex + this.pageSize;
  //   const paginatedKeys = eventKeys.slice(startIndex, endIndex);
  //  // console.log('Paginated Keys:', paginatedKeys); 
  
  //   const paginatedEvents = paginatedKeys.map(key => {
  //     const event = this.groupedData[key];
  //     if (!event) {
  //       console.warn(`Group data not found for the key: ${key}`);
  //       return null;
  //     }
  //     return { ...event, id: key };
  //   }).filter(event => event !== null); 
  //   //console.log('Paginated Events:', paginatedEvents); // Debug output
  //   return paginatedEvents;
  // }
  
  // onPageChange(event: PageEvent): void {
  //   this.pageSize = event.pageSize;
  //   this.currentPage = event.pageIndex;
  //   this.updatePaginatedEventIds();
  // }
  goToGroupDetails(groupKey: string): void {
    if (this.groupedData && this.groupedData[groupKey]) {
      console.log('Group Key (Event ID):', groupKey);
      this.router.navigate(['/group-details', groupKey])
    }else {
      console.error('Group data not found for the key:', groupKey);
    }
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

 
 // Toggle the expansion panel
 togglePanel() {
  this.panelExpanded = !this.panelExpanded;
}
  navigateBack(): void {
    this.router.navigate(['/event-master']);
  }
}

