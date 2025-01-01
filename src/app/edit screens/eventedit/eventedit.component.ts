import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/service/event.service';
import { Event } from 'src/app/models/event';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RejectionDialogComponent } from 'src/app/reusecomponents/budgetshow/rejection-dialog/rejection-dialog.component';
import { StatusService } from 'src/app/service/status.service'; // Import the StatusService
import { PageEvent } from '@angular/material/paginator'; // Import for pagination


@Component({
  selector: 'app-eventedit',
  templateUrl: './eventedit.component.html',
  styleUrls: ['./eventedit.component.css'],
  providers: [DatePipe]

})
export class EventeditComponent implements OnInit {
  events: Event[] = [];
  error: string | null = null;
  errorMessage: string = '';
  searchTerm: string = '';  
  dataSource = new MatTableDataSource<Event>();
  currentStatus: string | string[] | null = null;
  filteredEvents: any[] = [];
  isCancelled = false;
  paginatedEvents: Event[] = []; 
  pageSize: number = 3; 
  pageIndex: number = 0; 
  groupedEvents: { [key: string]: number } | null = null;
  customStartDate?: Date;
  customEndDate?: Date;
  departmentId = undefined;

  constructor(
    private eventService: EventService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private statusService: StatusService,
    private router: Router,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private route: ActivatedRoute,

  ) { }
ngOnInit(): void {
  const meeting = false; 
  this.loadGroupedEvents(meeting);
  const defaultStatus = 'all';
   
  this.fetchByStatus(defaultStatus);
}

loadGroupedEvents(meeting: boolean): void {
  const departmentId = undefined;
    this.eventService.getEventsGroupedByStatuss(departmentId, meeting).subscribe({
    next: (data) => {
      console.log(data);
        // Check if the 'events' property is an array, and if not, log the structure
        if (!Array.isArray(data.events)) {
          console.error('Expected data.events to be an array, but got:', data.events);
          return;
        }
      // Initialize counts
      const allStatuses = this.statusService.getAllStatuses();
      const rejectedStatuses = this.statusService.getRejectedStatuses();
      const processingStatuses = this.statusService.getProcessingStatuses();
      const approvedStatuses = this.statusService.getApprovedStatuses();
      const scheduledStatuses = this.statusService.getScheduledStatuses();
      const completedStatuses = this.statusService.getCompletedStatuses();

      const groupedCounts = {
        all: this.countStatuses(data.events, allStatuses),
        rejected: this.countStatuses(data.events, rejectedStatuses),
        processing: this.countStatuses(data.events, processingStatuses),
        approved: this.countStatuses(data.events, approvedStatuses),
        scheduled: this.countStatuses(data.events, scheduledStatuses),
        completed: this.countStatuses(data.events, completedStatuses),
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

  console.log('Start Date:', start_date);
  console.log('End Date:', end_date);
  this.fetchByStatus(status, start_date, end_date);
}

fetchByStatus(status: string, start_date: string = '', end_date: string = ''): void {
  if (!status || !['all', 'rejected', 'processing', 'approved', 'Scheduled', 'Completed'].includes(status)) {
    this.currentStatus = 'all'; // Default value
  } else {
    this.currentStatus = status;
  }

  let statuses: string[] = [];
  switch (this.currentStatus) {
    case 'all':
      statuses = this.statusService.getAllStatuses();
      break;
    case 'rejected':
      statuses = this.statusService.getRejectedStatuses();
      break;
    case 'processing':
      statuses = this.statusService.getProcessingStatuses();
      break;
    case 'approved':
      statuses = this.statusService.getApprovedStatuses();
      break;
    case 'Scheduled':
      statuses = this.statusService.getScheduledStatuses();
      break;
    case 'Completed':
      statuses = this.statusService.getCompletedStatuses();
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
  const meeting = false;

  this.eventService.getEventsByDateRangeAndStatus(
    formattedStartDate,
    formattedEndDate,
    statusString,
    departmentId,
    undefined, 
    meeting 
  )
  .subscribe(
    (response: any) => {
      console.log('Response:', response);
      this.events = Array.isArray(response.events) ? response.events : [];
      console.log('Events:', this.events);

      this.events.sort((a: any, b: any) => {
        const dateA = new Date(a.datetime_from).getTime();
        const dateB = new Date(b.datetime_from).getTime();
        return dateA - dateB; // Ascending order
      });

      this.filteredEvents = [...this.events];
      this.updatePaginatedEvents();
    },
    (error) => {
      console.error('Error loading events:', error);
      this.snackBar.open('Error loading events', 'Close', { duration: 3000 });
    }
  );
}


onPageChange(event: PageEvent): void {
  this.pageSize = event.pageSize;
  this.pageIndex = event.pageIndex;
  this.updatePaginatedEvents();
}

updatePaginatedEvents(): void {
  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedEvents = this.events.slice(startIndex, endIndex);
}
approveEvent(event: any, newStatus: string): void {
    this.eventService.updatestatus(event.id, newStatus).subscribe(
      () => {
        event.isApproved = true;
        event.status.status = newStatus;
        this.snackBar.open('Event approved successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['snackbar-success']
        });
       // this.updateEventInLocalStorage(event);
        if (this.currentStatus) {
          //this.filterByStatus(this.currentStatus);
        }
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
  onCancel(eventId: number): void {
    const dialogRef = this.dialog.open(RejectionDialogComponent, {
      width: '400px',
      data: { eventId },
    });
    dialogRef.afterClosed().subscribe((reason: string) => {
      if (reason) {
        this.cancelEvent(eventId, reason);
      }
    });
  }
  cancelEvent(eventId: number, cancelReason: string): void {
    this.eventService.cancelEvent(eventId, cancelReason).subscribe(
      (response) => {
        this.snackBar.open('Event cancelled successfully!', 'Close', {
          duration: 3000,
        });
        const updatedEvent = this.getEventById(eventId);
        if (updatedEvent) {
          updatedEvent.status.status = 'Cancelled';
          updatedEvent.cancelreason = cancelReason;
         // this.updateEventInLocalStorage(updatedEvent);
          this.filteredEvents = this.events.filter(event => 
            this.currentStatus === 'All' || this.currentStatus === null 
              ? true 
              : event.status.status === this.currentStatus
          );
          this.dataSource.data = this.filteredEvents;
        }
      },
      (error) => {
        this.snackBar.open('Failed to cancel the event!', 'Close', {
          duration: 3000,
        });
      }
    );
  }
  getEventById(eventId: number): Event | undefined {
    return this.events.find(event => event.id === eventId);
  }
  goback(){
  // localStorage.removeItem('events');
  // localStorage.removeItem('startDate');
  // localStorage.removeItem('endDate');
    this.router.navigate(['/event-master']);
  }
  showDetails(id: number): void {
       const currentUrl = this.router.url;
       this.router.navigate(['/showdetail', id], {
         queryParams: { returnUrl: currentUrl }
       });
  }

  showdata(id: number): void {
  const currentUrl = this.router.url;
  this.router.navigate(['/softcopy', id], {
    queryParams: { returnUrl: currentUrl }
  });
  }
  onSearch(): void {
      if (this.searchTerm.trim() === '') {
        this.events = this.events;  
      } else {
        this.events = this.events.filter(event =>
          event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) 
        );
      }
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.events = this.events;
  }
}

//  storeEncryptedData(key: string, data: string): void {
//     const encryptedData = CryptoJS.AES.encrypt(data, this.secretKey).toString();
//     localStorage.setItem(key, encryptedData);
//   }

//   decryptData(encryptedData: string): string {
//     const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   }

 // updateEventInLocalStorage(updatedEvent: Event): void {
  //   const encryptedEvents = localStorage.getItem('events');
  //   if (encryptedEvents) {
  //    // const decryptedEvents = this.decryptData(encryptedEvents);
  //     let events = JSON.parse(decryptedEvents) as Event[];
  //     const eventIndex = events.findIndex(event => event.id === updatedEvent.id);
  //     if (eventIndex !== -1) {
  //       events[eventIndex].status.status = updatedEvent.status.status;
  //      // this.storeEncryptedData('events', JSON.stringify(events));
  //     }
  //   }
  // }