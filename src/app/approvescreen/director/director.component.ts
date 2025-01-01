import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { StatusService } from 'src/app/service/status.service';  // Import the StatusService
import { PageEvent } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RejectionDialogComponent } from 'src/app/reusecomponents/budgetshow/rejection-dialog/rejection-dialog.component';
import { RejectionReason} from 'src/app/models/event';
import { MatDialog } from '@angular/material/dialog';
import { Event } from '../../models/event';



@Component({
  selector: 'app-director',
  templateUrl: './director.component.html',
  styleUrls: ['./director.component.css']
})
export class DirectorComponent implements OnInit {

  filteredEvents: any[] = [];
  currentStatus: string = '';
  showApprovalButtons = false;
  errorMessage: string = '';
  showEvents = false;
  searchTerm: string = '';  
  paginatedEvents: Event[] = []; 
  pageSize: number = 2; 
  pageIndex: number = 0; 
  currentPage = 0;   
  rejectionDetails: RejectionReason[] = []; // Ensure the type is defined
  isSelected = false;
  selectedRange: string = '';
  showCustomDatePickers = false; 
  customStartDate?: Date;
  customEndDate?: Date;
  awaitevents: any[] =[];
  event: any[] = [];
  departmentId = undefined;
  await: any[] =[];
  events: any[] = [];

  // Properties to store event counts for badges
  approvedCount = 0;
  rejectedCount = 0;
  pendingCount = 0;
  statuses: string[] = [];
  groupedEvents: { [key: string]: number } | null = null;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog, 
    public statusService: StatusService   // Inject the StatusService
  ) {}
  ngOnInit(): void {

    const meeting = false; 
    const awaitFlag = true;
    const status ='HOD-Approved'; // Define the status
    this.loadGroupedEvents(meeting, awaitFlag, status);
    const defaultStatus = 'all'; 
    const defaultStartDate = ''; 
    const defaultEndDate = '';
    this.fetchByStatus(defaultStatus, defaultStartDate, defaultEndDate);
  }
  // loadGroupedEvents(meeting: boolean, awaitFlag: boolean, status?: string): void {
  //   this.eventService.getEventsGroupedByStatuss(undefined,meeting, awaitFlag, status).subscribe({
  //     next: (data) => {
  //       console.log('Response Data:', data);
  
  //       const allStatuses = this.statusService.getDirectorStatuses().all;
  //       const rejectedStatuses = this.statusService.getDirectorStatuses().rejected;
  //       const pendingStatuses = this.statusService.getDirectorStatuses().pending;
  //       const approvedStatuses = this.statusService.getDirectorStatuses().approved;
  //       const wait = this.statusService.getPriestInchargeStatuses().pending;
  //       const completedStatuses = this.statusService.getCompletedStatuses();
  
  //       // Ensure `data.events` is used for counting statuses
  //       const groupedCounts = {
  //         all: this.countAllStatuses(data.events,data.await_event_count),
  //         rejected: this.countStatuses(data.events, rejectedStatuses),
  //         pending: this.countStatuses(data.events, pendingStatuses),
  //         approved: this.countStatuses(data.events, approvedStatuses),
  //         completed: this.countStatuses(data.events, completedStatuses),
  //         wait:data.await_event_count
  //       };
  
  //       console.log('Grouped Counts:', groupedCounts);
  //       this.groupedEvents = groupedCounts;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching grouped events:', error);
  //     }
  //   });
  // }
  loadGroupedEvents(meeting: boolean, awaitFlag: boolean, status?: string): void {
    this.eventService.getEventsGroupedByStatuss(undefined, meeting, awaitFlag, status).subscribe({
      next: (data) => {
        console.log('Response Data:', data);
  
        // Status lists
        const allStatuses = this.statusService.getDirectorStatuses().all;
        const rejectedStatuses = this.statusService.getDirectorStatuses().rejected;
        const pendingStatuses = this.statusService.getDirectorStatuses().pending;
        const approvedStatuses = this.statusService.getDirectorStatuses().approved;
        const wait = this.statusService.getPriestInchargeStatuses().pending;
        const completedStatuses = this.statusService.getCompletedStatuses();
  
        // Grouped counts
        const groupedCounts = {
          all: this.countStatuses(data.events, allStatuses) + (data.await_event_count || 0), // Add await count
          rejected: this.countStatuses(data.events, rejectedStatuses),
          pending: this.countStatuses(data.events, pendingStatuses),
          approved: this.countStatuses(data.events, approvedStatuses),
          completed: this.countStatuses(data.events, completedStatuses),
          wait: data.await_event_count || 0,
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
    data: { status_id: number; event_count: number; status_detail: { status: string } }[],
    statuses: string[]
  ): number {
    const filtered = data.filter((item) => statuses.includes(item.status_detail.status));
    return filtered.reduce((total, item) => total + item.event_count, 0);
  }
  private countAllStatuses(
    data: { event_count: number; await_event_count: number }[],
    meetingEventCount: number
  ): number {
    // Ensure 'data' is an array before using 'reduce'
    if (!Array.isArray(data)) {
      console.error('Expected data to be an array in countAllStatuses, but got:', data);
      return 0;
    }
  
    // Calculate the sum of all event_count and meeting_event_count
    const eventCountSum = data.reduce(
      (total, item) => total + (item.event_count || 0) + (item.await_event_count || 0),
      0
    );
  
    // Add the global meeting_event_count to the total
    return eventCountSum + (meetingEventCount || 0);
  }
 

  
  fetchByStatus(status: string, start_date: string = '', end_date: string = ''): void {
    if (!status || !['all', 'rejected', 'pending', 'approved', 'Completed', 'await'].includes(status)) {
      this.currentStatus = 'all'; // Default value
    } else {
      this.currentStatus = status;
    }
  
    let statuses: string[] = [];
    switch (this.currentStatus) {
      case 'all':
        statuses = this.statusService.getDirectorStatuses().all;
        break;
      case 'rejected':
        statuses = this.statusService.getDirectorStatuses().rejected;
        break;
      case 'pending':
        statuses = this.statusService.getDirectorStatuses().pending;
        break;
      case 'approved':
        statuses = this.statusService.getDirectorStatuses().approved;
        break;
      case 'Completed':
        statuses = this.statusService.getCompletedStatuses();
        break;
      case 'await':
        statuses = this.statusService.getPriestInchargeStatuses().pending;
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
    const departmentId = this.departmentId; // Default department_id
    const awaitFlag = this.currentStatus === 'await'; // Set awaitFlag to true only for 'await'
  
    this.eventService
      .getEventsByDateRangeAndStatus(formattedStartDate, formattedEndDate, statusString, departmentId, awaitFlag)
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.events = Array.isArray(response.events) ? response.events : [];
          this.await = Array.isArray(response.await) ? response.await : [];
          console.log(this.await);
  
          if (this.currentStatus === 'await') {
            console.log('Filtering from await array');
            this.filteredEvents = [...this.await];
          } else {
            console.log('Filtering from events array');
            this.filteredEvents = [...this.events];
            this.events.sort((a: any, b: any) => {
              const dateA = new Date(a.datetime_from).getTime();
              const dateB = new Date(b.datetime_from).getTime();
              return dateA - dateB; // Ascending order
            });
          }
  
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
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  updatePaginatedEvents(): Event[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredEvents.slice(startIndex, endIndex);
  }
  onSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredEvents = this.events;  // Show all events if search is cleared
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
    this.filteredEvents = this.events;  // Reset to show all events
  }

  goback(): void {
    this.router.navigate(['/event-master']);
  }

  approveEvent(event: any): void {
    const approvalStatus = 'Director-Approved';
  
    this.eventService.updatestatus(event.id, approvalStatus).subscribe(
      () => {
        // Show the success message in a snackbar
        this.snackBar.open('Event approved successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['snackbar-success']
        });
  
        // Update the event status locally
        event.status.status = approvalStatus;
        this.filteredEvents = this.events; 

     
      },
      (error) => {
        this.errorMessage = error.error.message || 'Error approving event';
        this.snackBar.open('Error approving event', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    );
  }

  rejectEvent(event: any): void {
    const dialogRef = this.dialog.open(RejectionDialogComponent, {
      width: '250px',
      data: { reason: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const approvalStatus = 'Director-Rejected';
        const rejectionReason = result;
        const userId = 7541;

        // Create formData
        const formData = new FormData();
        formData.append('event_id', event.id.toString()); // Ensure event_id is string
        formData.append('user_id', userId.toString());
        formData.append('reason_for_rejection', rejectionReason);

        // First, update the event status to "Rejected"
        this.eventService.updatestatus(event.id, approvalStatus).subscribe(
          () => {
            this.snackBar.open('Event rejected successfully', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
              panelClass: ['snackbar-success']
            });
              // Update the event status locally
        event.status.status = approvalStatus;
  
        this.filteredEvents = this.events; 

            // After updating the status, submit the rejection reason
            this.eventService.submitRejectionDetails(formData).subscribe(
              (response) => {
                console.log('Rejection details saved successfully', response);
              },
              (error) => {
                this.errorMessage = error.error.message || 'Error saving rejection details';
                this.snackBar.open('Error saving rejection details', 'Close', {
                  duration: 3000,
                  panelClass: ['snackbar-error']
                });
              }
            );
          },
          (error) => {
            this.errorMessage = error.error.message || 'Error rejecting event';
            this.snackBar.open('Error rejecting event', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        );
      }
    });
  }

  
 showevent(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/showdetail', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }
  VenueEdit(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/venueedit', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }

  
  


}
