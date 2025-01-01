import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/service/event.service';
import { Event } from 'src/app/models/event';

@Component({
  selector: 'app-venue-edit',
  templateUrl: './venue-edit.component.html',
  styleUrls: ['./venue-edit.component.css'],
  providers: [DatePipe]
})
export class VenueEditComponent implements OnInit {
  eventId!: number;
  event!: Event;
  eventForm!: FormGroup;
  error: string | null = null;
  amalaProjects: any[] = [];
  eventVenues: any[] = [];
  eventTypes: any[] = [];
  minDate: Date;
  maxDate: Date;
  is_available: boolean = false;
  overlappingEvents: any[] = [];
  private snackBarShown: boolean = false;
  private formInitialized: boolean = false;
  eventStatus: string | number = '';
  returnUrl: string = ''; 
  isMeetingType:boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/default-return-route';
    });

    this.route.params.subscribe(params => {
      this.eventId = +params['id'];
      this.loadEventDetails(this.eventId);
    });

    this.loadDropdownData();
      // Trigger venue check on any relevant form value change
      this.eventForm.get('event_venue_id')?.valueChanges.subscribe((value) => {
        this.triggerVenueCheck();
      });
    
      this.eventForm.get('datetime_from')?.valueChanges.subscribe((value) => {
        this.triggerVenueCheck();
        this.triggerTypeCheck();
      });
    
      this.eventForm.get('datetime_to')?.valueChanges.subscribe((value) => {
        this.triggerVenueCheck();
        this.triggerTypeCheck();
      });
      this.eventForm.get('event_type_id')?.valueChanges.subscribe(value => {
        //console.log('Event Type ID changed:', value);
        this.triggerTypeCheck();
      });
    
  }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      event_venue_id: ['', Validators.required],
      amala_project_id: [''],
      datetime_from: [ Validators.required],
      datetime_to: [ Validators.required],
      event_type_id: ['', Validators.required],
      title: ['', Validators.required],
      contact_no: ['', [
        Validators.required,  // Make contact_no required
        Validators.pattern(/^\d{10}$/)  // Ensure the contact_no is a valid 10-digit number
      ]],
      contact_email: ['', [
        Validators.required,  // Make contact_email required
        Validators.email  // Validate that the email is in the correct format
      ]],
    });

    // Initialize form change listeners
    this.eventForm.get('event_venue_id')?.valueChanges.subscribe(() => this.onVenueOrDateChange());
    this.eventForm.get('datetime_from')?.valueChanges.subscribe(() => this.onVenueOrDateChange());
    this.eventForm.get('datetime_to')?.valueChanges.subscribe(() => this.onVenueOrDateChange());
  }

  
  
  

  onVenueOrDateChange(): void {
    if (this.formInitialized) {
      this.triggerVenueCheck();
    }
  }

  loadEventDetails(eventId: number): void {
    this.eventService.getEvent(eventId).subscribe({
      next: (data: any) => {  // Using 'any' instead of 'Event'
        this.event = data;
        //console.log(this.event);
        this.populateForm(data);
        this.eventStatus = data?.status?.status || 'Unknown';
        this.formInitialized = true;
        const typeName = data.event_type?.name; 
        if (typeName === 'Meeting') {
          this.isMeetingType = true;
        } else {
          this.isMeetingType = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load event';
        console.error(err);
      }
    });
  }
  
  
  populateForm(event: Event): void {
    this.eventForm.patchValue({
      event_venue_id: event.event_venue_id,
      amala_project_id: event.project?.id || null, // Use the ID or set null if not available
      datetime_from: new Date(event.datetime_from),
      datetime_to: new Date(event.datetime_to),
      event_type_id: event.event_type_id,
      title: event.title,
      contact_no: event.contact_no,
      contact_email: event.contact_email
    });
    console.log('Form populated with data:', this.eventForm.value);
  }
  
  loadDropdownData(): void {

    this.eventService.getAmalaProjects().subscribe(
        data =>this.amalaProjects = data,
        error => console.error('Failed to fetch amala project ', error)
      );
    

    this.eventService.getEventVenues().subscribe(
      data => this.eventVenues = data,
      error => console.error('Failed to fetch event venues', error)
    );

    this.eventService.getEventTypes().subscribe(
      data => this.eventTypes = data,
      error => console.error('Failed to fetch event types', error)
    );
  }


  triggerVenueCheck(): void {
    const venueId = this.eventForm.get('event_venue_id')?.value;
    const datetimeFrom = this.eventForm.get('datetime_from')?.value;
    const datetimeTo = this.eventForm.get('datetime_to')?.value;
    const eventId = this.eventId;

    if (venueId && datetimeFrom && datetimeTo && this.isValidDateRange(datetimeFrom, datetimeTo)) {
      this.checkVenueAvailability(datetimeFrom, datetimeTo, venueId,eventId);
    } else {
      console.log('Required fields are missing or date range is invalid.');
      this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 1000 }); 
      
    }
    
  }

  checkVenueAvailability(datetimeFrom: any, datetimeTo: any, venueId: any, eventId: any): void {
    const formattedDatetimeFrom = this.formatDateTime(datetimeFrom);
    const formattedDatetimeTo = this.formatDateTime(datetimeTo);
  
    if (!formattedDatetimeFrom || !formattedDatetimeTo) {
      this._snackBar.open('Invalid date provided', 'Close', { duration: 1000 });
      return;
    }
  
    const formData = {
      eventId: this.eventId,
      event_venue_id: venueId,
      datetime_from: formattedDatetimeFrom,
      datetime_to: formattedDatetimeTo
    };
  
    this.eventService.checkVenue(formData).subscribe(
      (response: any) => {
        if (response && response.is_available) {
          this.is_available = true;
          this.overlappingEvents = [];
          if (!this.snackBarShown) {
            this._snackBar.open('Venue is available', 'Close', { duration: 1000 });
            this.snackBarShown = true;
          }
        } else {
          this.is_available = false;
          this.overlappingEvents = response.overlapping_events || [];
          this._snackBar.open(response.message || 'Venue is not available', 'Close', { duration: 1000 });
          this.eventForm.patchValue({ datetime_from: null, datetime_to: null });
          
        }
      },
      (error) => {
        console.error('Error checking venue:', error);
  
        // Extract error message
        const errorMessage = error?.error?.errors?.[0] || error?.message || 'An unknown error occurred';
        // Show Snackbar
        this._snackBar.open(errorMessage, 'Close', { duration: 3000 });
        // Patch form values
        if (this.eventForm) {
          this.eventForm.patchValue({ datetime_from: null, datetime_to: null });
        } else {
          console.error('eventForm is not initialized.');
        }
      }
    );
  }

  
  triggerTypeCheck() {
    const typeId = this.eventForm.get('event_type_id')?.value;
    const datetimeFrom = this.eventForm.get('datetime_from')?.value;
    const datetimeTo = this.eventForm.get('datetime_to')?.value;

      if (typeId && datetimeFrom && datetimeTo) {

      if (this.isValidDateRange(datetimeFrom, datetimeTo)) {

        this.checktimeAvailability(datetimeFrom, datetimeTo,typeId,);
      } else {
        this._snackBar.open('DateTime To must be after DateTime From', 'Close');
        
      }
    } else {
      console.log('Required fields are missing.');
    }
  }

  checktimeAvailability(datetimeFrom: any, datetimeTo: any,typeId: any,): void {
    const formattedDatetimeFrom = this.formatDateTime(datetimeFrom);
    const formattedDatetimeTo = this.formatDateTime(datetimeTo);

    if (!formattedDatetimeFrom || !formattedDatetimeTo) {
      console.error('Invalid date provided');
      this._snackBar.open('Invalid date provided', 'Close', { duration: 1000 });
      return;
    }

    if (!this.isValidDateRange(formattedDatetimeFrom, formattedDatetimeTo)) {
      this._snackBar.open('DateTime To must be after DateTime From', 'Close');
      return;
    }
    const formData = {
      event_type_id: typeId,
      datetime_from: formattedDatetimeFrom,
      datetime_to: formattedDatetimeTo
    };
    
    this.eventService.checkTime(formData).subscribe(
      (response: any) => {
        if (response && response.timecheck === 'true') {
          this._snackBar.open(response.message, 'Close', { duration: 1000 });
     
         // console.log(response);
        } else if (response && response.timecheck === 'false') {
        
          this.eventForm.patchValue({ datetime_from: null, datetime_to: null });
          this._snackBar.open(response.message, 'Close');
        }
      },
      (error) => {
        // Handle any errors from the API
        console.error('Error checking time:', error);
        this._snackBar.open('An error occurred. Please try again later.', 'Close', {duration: 5000});
      }
    );
    
  }


  isValidDateRange(datetime_from: any, datetime_to: any): boolean {
    return datetime_from && datetime_to && new Date(datetime_from) < new Date(datetime_to);
  }

  formatDateTime(dateTime: any): string {
    return dateTime && !isNaN(Date.parse(dateTime))
      ? this.datePipe.transform(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss') || ''
      : '';
  }


  onNextClick(): void {
    if (this.eventForm.valid) {
      const formData = new FormData();
  
      // Append form fields to FormData
      ['event_type_id', 'title', 'contact_no', 'contact_email', 'event_venue_id', 'amala_project_id'].forEach(key => {
        const value = this.eventForm.get(key)?.value;
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
  
      // Format datetime fields and append to FormData
      const datetimeFrom = this.formatDateTime(this.eventForm.get('datetime_from')?.value);
      const datetimeTo = this.formatDateTime(this.eventForm.get('datetime_to')?.value);
  
      if (datetimeFrom) formData.append('datetime_from', datetimeFrom);
      if (datetimeTo) formData.append('datetime_to', datetimeTo);
  

    const eventTypeId = this.eventForm.get('event_type_id')?.value;
    console.log('Event Type ID:', eventTypeId);  
    const isMeetingType = eventTypeId === 10;  
    console.log('Is Meeting Type:', isMeetingType);

      // Call service to update the event
      this.eventService.updateEvent(formData, this.eventId).subscribe(
        response => {
          // If it's not a meeting, navigate to the service edit page
          if (!isMeetingType) {
            this.router.navigate(['/serviceedit', this.eventId], { queryParams: { returnUrl: this.returnUrl } });
          }
          this._snackBar.open('Event updated successfully', 'Close', { duration: 1000 });
        },
        error => {
          console.error('Failed to update event', error);
          this._snackBar.open('Failed to update event', 'Close', { duration: 1000 });
        }
      );
    } else {
      console.log('Form is invalid.');
    }
  }
  
  // // Utility method to format dates for backend
  // private formatToBackend(date: Date | string): string {
  //   if (!date) return '';
  //   return new Date(date).toISOString(); // ISO 8601 format
  // }
  
  
  goback(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
  formatBufferTime(bufferTime: string | null): string {
    if (!bufferTime) return 'No buffer time';

    const [hours, minutes, seconds] = bufferTime.split(':').map(Number);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    let result = '';
    if (days > 0) {
      result += `${days} day${days > 1 ? 's' : ''}`;
    }
    if (remainingHours > 0) {
      result += `${result ? ' and ' : ''}${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      result += `${result ? ' and ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    return result || 'No buffer time';
  }
}



 
