import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { StatusService } from 'src/app/service/status.service'; // Import the StatusService
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  departmentId = 147;
  events: any[] = [];
  event: any[] = [];
  filteredEvents: any[] = []; // Store filtered events based on status
  currentStatus: string = 'all';  // Track the current status filter
  searchTerm: string = '';
  errorMessage: string = '';
  groupedEvents: { [key: string]: number } | null = null;
  paginatedEvents: Event[] = []; 
  pageSize: number = 3; 
  pageIndex: number = 0; 
  customStartDate?: Date;
  customEndDate?: Date;

  constructor(
    private eventService: EventService,
    private statusService: StatusService,  // Inject the StatusService
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const departmentId = this.departmentId; 
    const meeting = false; 
    this.loadGroupedEvents(departmentId, meeting);
    const defaultStatus = 'all'; 
    const defaultStartDate = ''; 
    const defaultEndDate = '';
    this.fetchByStatus(defaultStatus, defaultStartDate, defaultEndDate);
  }

  loadGroupedEvents(departmentId: number, meeting: boolean): void {
    this.eventService.getEventsGroupedByStatuss(departmentId, meeting).subscribe({
      next: (data) => {
        console.log(data);
        // Check if the 'events' property is an array, and if not, log the structure
        if (!Array.isArray(data.events)) {
          console.error('Expected data.events to be an array, but got:', data.events);
          return;
        }
  
        const allStatuses = this.statusService.getAllStatuses();
        const rejectedStatuses = this.statusService.getRejectedStatuses();
        const pendingStatuses = this.statusService.getScheduledStatuses();
        const processingStatuses = this.statusService.getProcessingStatuses();
        const approvedStatuses = this.statusService.getApprovedStatuses();
        const completedStatuses = this.statusService.getCompletedStatuses();
        const meetingStatuses = this.statusService.getScheduledStatuses();
  
        const groupedCounts = {
          all: this. countAllStatuses(data.events, data.meeting_event_count), // Sum of event_count and meeting_event_count for 'all'
          rejected: this.countStatuses(data.events, rejectedStatuses),
          pending: this.countStatuses(data.events, pendingStatuses),
          processing: this.countStatuses(data.events, processingStatuses),
          approved: this.countStatuses(data.events, approvedStatuses),
          completed: this.countStatuses(data.events, completedStatuses),
          meeting: data.meeting_event_count
        };
  
        console.log('Grouped Counts:', groupedCounts);
        this.groupedEvents = groupedCounts;
      },
      error: (error) => {
        console.error('Error fetching grouped events:', error);
      },
    });
  }
  
  private countStatuses(
    data: { status_id: number; event_count: number; meeting_event_count: number; status_detail: { status: string } }[],
    statuses: string[]
  ): number {
    // Ensure data is an array before filtering
    if (!Array.isArray(data)) {
      console.error('Expected data to be an array in countStatuses, but got:', data);
      return 0;
    }
  
    // Filter events matching the given statuses
    const filtered = data.filter((item) => statuses.includes(item.status_detail.status));
  
    // Sum of event_count and meeting_event_count for all matching statuses
    return filtered.reduce(
      (total, item) => total + (item.event_count || 0) + (item.meeting_event_count || 0),
      0
    );
  }
  private countAllStatuses(
    data: { event_count: number; meeting_event_count: number }[],
    meetingEventCount: number
  ): number {
    // Ensure 'data' is an array before using 'reduce'
    if (!Array.isArray(data)) {
      console.error('Expected data to be an array in countAllStatuses, but got:', data);
      return 0;
    }
  
    // Calculate the sum of all event_count and meeting_event_count
    const eventCountSum = data.reduce(
      (total, item) => total + (item.event_count || 0) + (item.meeting_event_count || 0),
      0
    );
  
    // Add the global meeting_event_count to the total
    return eventCountSum + (meetingEventCount || 0);
  }

  fetchByStatus(status: string, start_date: string = '', end_date: string = ''): void {
    if (!status || !['all','pending','Processing','Approved','rejected','Completed','meeting'].includes(status)) {
      this.currentStatus = 'all'; // Default value
    } else {
      this.currentStatus = status;
    }
  
    let statuses: string[] = [];
    switch (this.currentStatus) {
      case 'all':
        statuses = this.statusService.getAllStatuses();
        break;
        case 'pending':
        statuses = this.statusService.getScheduledStatuses();
        break;
        case 'Processing':
        statuses = this.statusService.getProcessingStatuses();
        break;
        case 'Approved':
        statuses = this.statusService.getApprovedStatuses();
        console.log(statuses);
        break;
        case 'rejected':
        statuses = this.statusService.getRejectedStatuses();
        break;
        case 'Completed':
        statuses = this.statusService.getCompletedStatuses();
        break;
        case 'meeting':
        statuses = this.statusService.getScheduledStatuses();
        break;
        default:
        statuses = [this.currentStatus];
        break;
    }
  
    const statusString = statuses.join(',');
    console.log('Status String:', statusString);
    const formattedStartDate = start_date ? new Date(start_date).toISOString() : '';
    const formattedEndDate = end_date ? new Date(end_date).toISOString() : '';
    console.log('Formatted Start Date:', formattedStartDate);
    console.log('Formatted End Date:', formattedEndDate);
    const departmentId = this.departmentId; 
    const awaitFlag = false; 
    const meeting = this.currentStatus === 'meeting' ? true : (this.currentStatus === 'all' ? undefined : false);


    

    this.eventService
    .getEventsByDateRangeAndStatus(
      formattedStartDate,
      formattedEndDate,
      statusString,
      departmentId,
      awaitFlag,
      meeting
    )
    .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.events = Array.isArray(response.events) ? response.events : [];
            console.log('Filtering from events array');
            this.filteredEvents = [...this.events];
            this.events.sort((a: any, b: any) => {
              const dateA = new Date(a.datetime_from).getTime();
              const dateB = new Date(b.datetime_from).getTime();
              return dateA - dateB; // Ascending order
            });
          
  
          this.updatePaginatedEvents();
        },
        (error) => {
          console.error('Error loading events:', error);
          this.snackBar.open('Error loading events', 'Close', { duration: 3000 });
        }
      );
  }

  fetchDateRange(status: 'Completed' | 'all'): void {
    const today = new Date();
    const getDateString = (date: Date): string => {
      return date.toISOString().split('T')[0]; // Get YYYY-MM-DD part from ISO string
    };
  
    let start_date: string | undefined;
    let end_date: string | undefined;
  
    if (status === 'Completed') {
   
      if (this.customStartDate && this.customEndDate) {
        start_date = getDateString(this.customStartDate);
        end_date = getDateString(this.customEndDate);
      } else {
        this.errorMessage = 'Please select both start and end dates for the custom range.';
        return;
      }
    }
  }

  onSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredEvents = this.events;  
    } else {
      this.filteredEvents = this.events.filter(event =>
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.updatePaginatedEvents();
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredEvents = this.events;  
  }
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  updatePaginatedEvents(): Event[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredEvents.slice(startIndex, endIndex);
  }

  deleteEvent(eventId: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: `Are you sure, you want to delete this event? ` },
    });
  
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(eventId).subscribe(
          () => {
            this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
            //this.fetchEvents(); // Refresh the events list after deletion
          },
          (error) => {
            console.error('Error deleting event:', error);
            this.snackBar.open('Failed to delete event', 'Close', { duration: 3000 });
          }
        );
      }
    });
  }
  approveEvent(event: any): void {
    const approvalStatus = 'Scheduled';

    this.eventService.updatestatus(event.id, approvalStatus).subscribe(
      () => {
        this.snackBar.open('Event Re-submit successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['snackbar-success']
        });
        event.status.status = approvalStatus;
        this.filteredEvents = this.events;
      },
      (error) => {
        this.errorMessage = error.error.message || 'Error in Re-submit  event';
        this.snackBar.open('Error in Re-submit event', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    );
  }


  VenueEdit(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/venueedit', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }

  goback(): void {
    this.router.navigate(['/event-master']);
  }

  showevent(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/showdetail', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }
}
