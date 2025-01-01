import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { StatusService } from 'src/app/service/status.service'; // Import the StatusService
import { MatSnackBar } from '@angular/material/snack-bar';
import { RejectionDialogComponent } from 'src/app/reusecomponents/budgetshow/rejection-dialog/rejection-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-hod-approvedevent',
  templateUrl: './hod-approvedevent.component.html',
  styleUrls: ['./hod-approvedevent.component.css']
})
export class HodApprovedeventComponent implements OnInit {
  departmentId = 147;
  user_id: string = '2811';
  events: any[] = [];
  await: any[] =[];
  filteredEvents: any[] = [];
  statuses: string[] = [];
  searchTerm: string = '';
  paginatedEvents: Event[] = [];
  pageSize: number = 3;
  pageIndex: number = 0;
  errorMessage: string = '';
  groupedEvents: { [key: string]: number } | null = null;
  currentStatus: string | string[] | null = null;
  customStartDate?: Date;
  customEndDate?: Date;


  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    public statusService: StatusService
  ) {}


    ngOnInit(): void {
      const departmentId = this.departmentId; 
      const meeting = false; 
      const awaitFlag =false;
      this.loadGroupedEvents(departmentId, meeting, awaitFlag);
      const defaultStatus = 'all'; 
      this.fetchByStatus(defaultStatus);
    }

    loadGroupedEvents(departmentId: number, meeting: boolean, awaitFlag: boolean): void {
    this.eventService.getEventsGroupedByStatuss(departmentId, meeting, awaitFlag).subscribe({
      next: (data) => {
        console.log(data);
  
        // Check if the 'events' property is an array, and if not, log the structure
        if (!Array.isArray(data.events)) {
          console.error('Expected data.events to be an array, but got:', data.events);
          return;
        }

        const allStatuses = this.statusService.getHodStatuses().all;
        const rejectedStatuses = this.statusService.getHodStatuses().rejected;
        const pendingStatuses = this.statusService.getHodStatuses().pending;
        const approvedStatuses = this.statusService.getHodStatuses().approved;
        const completedStatuses = this.statusService.getCompletedStatuses();

        const groupedCounts = {
          all: this.countStatuses(data.events,allStatuses),
          rejected: this.countStatuses(data.events, rejectedStatuses),
          pending: this.countStatuses(data.events, pendingStatuses),
          approved: this.countStatuses(data.events, approvedStatuses),
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
      if (!status || !['all', 'rejected', 'pending', 'approved', 'Completed'].includes(status)) {
        this.currentStatus = 'all'; // Default value
      } else {
        this.currentStatus = status;
      }
    
      let statuses: string[] = [];
      switch (this.currentStatus) {
        case 'all':
          statuses = this.statusService.getHodStatuses().all;
          break;
        case 'rejected':
          statuses = this.statusService.getHodStatuses().rejected;
          break;
        case 'pending':
          statuses = this.statusService.getHodStatuses().pending;
          break;
        case 'approved':
          statuses = this.statusService.getHodStatuses().approved;
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
            this.await = Array.isArray(response.await) ? response.await : [];
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

    goback(): void {
    this.router.navigate(['/event-master']);
    }

    approveEvent(event: any): void {
    const approvalStatus = 'HOD-Approved';

    this.eventService.updatestatus(event.id, approvalStatus).subscribe(
      () => {
        this.snackBar.open('Event approved successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['snackbar-success']
        });
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
        const approvalStatus = 'HOD-Rejected';
        const rejectionReason = result;
        const formData = new FormData();
        formData.append('event_id', event.id.toString());
        formData.append('user_id', this.user_id);
        formData.append('reason_for_rejection', rejectionReason);
        this.eventService.updatestatus(event.id, approvalStatus).subscribe(
          () => {
            this.snackBar.open('Event rejected successfully', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
              panelClass: ['snackbar-success']
            });
            event.status.status = approvalStatus;
            this.filteredEvents = this.events;
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


  // fetchEvents(): void {
  //   const departmentId = this.departmentId;
  //   const ismeeting = false;
  //   const awaitFlag=false;
  //   const status='Scheduled';
  //   this.eventService.getEventsByDepartments(this.departmentId,status,ismeeting,awaitFlag).subscribe(
  //     (response: any) => {
  //       console.log(response);
  //       this.events = response.events || response;
  //     this.events.sort((a: any, b: any) => {
  //       const dateA = new Date(a.datetime_from).getTime();
  //       const dateB = new Date(b.datetime_from).getTime();
  //       return dateA - dateB; // Ascending order
  //     });
  //     console.log('Sorted Events:', this.events);
  //       this.filteredEvents = this.events;
  //       this.filterEventsByStatus(this.statuses);
  //     },
  //     (error) => {
  //       this.errorMessage = error.error.message || 'Error loading events';
  //     }
  //   );
  // }


  // filterEventsByStatus(statuses: string[]): void {
  //   if (!statuses || statuses.length === 0) {
  //     this.filteredEvents = this.events;
  //   } else {
  //     this.filteredEvents = this.events.filter(event =>
  //       statuses.includes(event.status?.status)
  //     );
  //   }

  //   this.router.navigate([], {
  //     relativeTo: this.route,
  //     queryParams: { status: statuses },
  //     queryParamsHandling: 'merge'
  //   });

  //   this.updateEventCounts();
  //   this.updatePaginatedEvents();
  // }
    // onTabChange(event: MatTabChangeEvent): void {
  //   const selectedIndex = event.index;

  //   switch (selectedIndex) {
  //     case 0:
  //       this.filterEventsByStatus(this.statusService.getHodStatuses().approved);
  //       break;
  //     case 1:
  //       this.filterEventsByStatus(this.statusService.getHodStatuses().rejected);
  //       break;
  //     case 2:
  //       this.filterEventsByStatus(this.statusService.getHodStatuses().pending);
  //       break;
  //     default:
  //       break;
  //   }
  // }
