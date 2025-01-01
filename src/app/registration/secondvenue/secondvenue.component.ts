import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Add Validators to the import statement
import { EventService } from 'src/app/service/event.service';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-secondvenue',
  templateUrl: './secondvenue.component.html',
  styleUrls: ['./secondvenue.component.css'],
  providers: [DatePipe]
})
export class SecondvenueComponent implements OnInit {

  eventForm!: FormGroup;
  eventVenues: any[] = []; // Array to store event venues
  parentId!: number; // Parent ID from route
  minDate: Date = new Date(); // Set the minimum date for date-time pickers
  overlappingEvents: any[] = [];
  maxDate: Date = new Date(this.minDate.getFullYear() + 1, 11, 31); // Example max date (1 year ahead)
  timecheck: boolean =false;
  showPopup: boolean = false;
  secondVenueNeeded: boolean = false;
  is_available: boolean = false;
 

  constructor(
    private fb: FormBuilder,

    private _snackBar: MatSnackBar,  
     private datePipe: DatePipe,
     private router: Router, 
     private eventService: EventService,
     private route: ActivatedRoute, 

    )  {}

    ngOnInit(): void {
      const parentIdString = this.route.snapshot.paramMap.get('parentId');
      if (parentIdString) {
        this.parentId = +parentIdString; 
      }
  
      this.initializeForm();
      this.getEventDetails();
      this.getEventVenues();
  
      this.eventForm.get('event_venue_id')?.valueChanges.subscribe(() => {
        this.triggerVenueCheck();
      });
  
      this.eventForm.get('datetime_from')?.valueChanges.subscribe(() => {
        this.triggerVenueCheck();
        this.triggerTypeCheck();
      });
  
      this.eventForm.get('datetime_to')?.valueChanges.subscribe(() => {
        this.triggerVenueCheck();
        this.triggerTypeCheck();
      });
    }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      event_venue_id: [null, Validators.required],
      event_type_id:[''],
      datetime_from: [null, Validators.required],
      datetime_to: [null, Validators.required],
      event_type_name: [''],
      parent_id: [this.parentId],
      amala_project_id: [''],
      contact_email: [''],
      title: [''],
      contact_no: [''],
      project_name: ['']
    });
  }

  getEventDetails(): void {
    this.eventService.getEvent(this.parentId).subscribe(
      (data: any) => {
        console.log('Event Details:', data); // Debugging
  
        // Using patchValue to set form values dynamically from the response
        this.eventForm.patchValue({
          parent_id: data.id,
          event_type_id: data.event_type_id,
          event_type_name: data.event_type?.name || null, // Access event_type.name dynamically
          title: data.title,
          contact_no: data.contact_no,
          contact_email: data.contact_email,
          amala_project_id: data.amala_project_id,
          project_name: data.project?.name || null, // Access project name dynamically
        });
  
        // Additional patch or form updates can be done here if needed
        console.log('Form Values After Patching:', this.eventForm.value); // Check if values are patched correctly
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }
  
  getEventVenues(): void {
    this.eventService.getEventVenues().subscribe(
      (venues) => {
        this.eventVenues = venues;
        console.log('Event Venues:', this.eventVenues);
      },
      (error) => {
        console.error('Error fetching event venues:', error);
      }
    );
  }

  triggerVenueCheck() {
    const venueId = this.eventForm.get('event_venue_id')?.value;
    const datetimeFrom = this.eventForm.get('datetime_from')?.value;
    const datetimeTo = this.eventForm.get('datetime_to')?.value;
  
    if (venueId && datetimeFrom && datetimeTo) {
      if (this.isValidDateRange(datetimeFrom, datetimeTo)) {
        this.checkVenueAvailability(datetimeFrom, datetimeTo,venueId,);
      } else {
        this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 1000 });
      }
    } else {
      console.log('Required fields are missing.');
    }
  }
  checkVenueAvailability(datetimeFrom: any, datetimeTo: any,venueId: any,): void {
    const formattedDatetimeFrom = this.formatDateTime(datetimeFrom);
    const formattedDatetimeTo = this.formatDateTime(datetimeTo);
  
    if (!formattedDatetimeFrom || !formattedDatetimeTo) {
      console.error('Invalid date provided');
      this._snackBar.open('Invalid date provided', 'Close', { duration: 1000 });
      return;
    }
  
    if (!this.isValidDateRange(formattedDatetimeFrom, formattedDatetimeTo)) {
      this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 1000 });
      return;
    }
    const formData = {
      event_venue_id: venueId,
      datetime_from: formattedDatetimeFrom,
      datetime_to: formattedDatetimeTo
    };
    
    this.eventService.checkVenue(formData).subscribe(
      (response: any) => {
        if (response && response.is_available) {
          this.is_available = true;
          this.overlappingEvents = [];
          console.log(response);
            this._snackBar.open('Venue is available', 'Close', { duration: 1000 });
         
        } else {
          //this.is_available = false;
          this.overlappingEvents = response.overlapping_events || [];
          const message = response.message || 'Venue is not available';
          this._snackBar.open(message, 'Close', { duration: 1000 });
          this.eventForm.patchValue({
            datetime_from: null,
            datetime_to: null
          });
        }
      },
      error => {
        console.error('Error checking venue:', error);
        //this.is_available = false;
        this._snackBar.open('Error checking venue', 'Close', { duration: 1000 });
      }
    );
  }
  
  triggerTypeCheck() {
    const typeId = this.eventForm.get('event_type_id')?.value;
    //console.log(typeId);
    const datetimeFrom = this.eventForm.get('datetime_from')?.value;
    const datetimeTo = this.eventForm.get('datetime_to')?.value;
  
      if (typeId && datetimeFrom && datetimeTo) {
  
      if (this.isValidDateRange(datetimeFrom, datetimeTo)) {
  
        this.checktimeAvailability(datetimeFrom, datetimeTo);
      } else {
        this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 1000 });
      }
    } else {
      console.log('Required fields are missing.');
    }
  }
  
  checktimeAvailability(datetimeFrom: any, datetimeTo: any): void {
    const formattedDatetimeFrom = this.formatDateTime(datetimeFrom);
    const formattedDatetimeTo = this.formatDateTime(datetimeTo);
  
    if (!formattedDatetimeFrom || !formattedDatetimeTo) {
      console.error('Invalid date provided');
      this._snackBar.open('Invalid date provided', 'Close', { duration: 1000 });
      return;
    }
  
    if (!this.isValidDateRange(formattedDatetimeFrom, formattedDatetimeTo)) {
      this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 1000 });
      return;
    }
  
    // Retrieve event_type_id from the form
    const eventTypeId = this.eventForm.get('event_type_id')?.value;
  
    if (!eventTypeId) {
      console.error('Event Type ID is missing');
      this._snackBar.open('Event Type is required', 'Close', { duration: 1000 });
      return;
    }
  
    const formData = {
      event_type_id: eventTypeId,
      datetime_from: formattedDatetimeFrom,
      datetime_to: formattedDatetimeTo
    };
  
    this.eventService.checkTime(formData).subscribe(
      (response: any) => {
        if (response && response.timecheck === 'true') {
          this._snackBar.open(response.message, 'Close');
          this.timecheck = true;
          console.log(response);
        } else if (response && response.timecheck === 'false') {
          this._snackBar.open(response.message, 'Close');
        }
      },
      (error) => {
        console.error('Error checking time:', error);
        this._snackBar.open('An error occurred. Please try again later.', 'Close', { duration: 5000 });
      }
    );
  }
  isValidDateRange(datetime_from: any, datetime_to: any): boolean {
    return datetime_from && datetime_to && new Date(datetime_from) < new Date(datetime_to);
  }
  formatDateTime(dateTime: any): string {
    if (dateTime && !isNaN(Date.parse(dateTime))) {
      return this.datePipe.transform(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss') || '';
    }
    return '';
    }

    submitVenue() {
      // Check for form validity
      if (!this.eventForm.valid) {
        Object.keys(this.eventForm.controls).forEach(key => {
          const control = this.eventForm.get(key);
          if (control && control.invalid) {
            console.log(`${key}:`, control.errors);
          }
        });
        return; // Exit if the form is invalid
      }
    
      const formData = new FormData();
    
      // Append required form data to FormData object
      ['event_type_id', 'parent_id', 'title', 'contact_no', 'contact_email', 'event_venue_id', 'amala_project_id'].forEach(key => {
        const value = this.eventForm.get(key)?.value;
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        } else {
          console.warn(`${key} is missing in the form.`);
        }
      });
    
      // Format and append date fields to FormData
      const datetimeFrom = this.formatDateTime(this.eventForm.get('datetime_from')?.value);
      const datetimeTo = this.formatDateTime(this.eventForm.get('datetime_to')?.value);
      const parentId = this.eventForm.get('parent_id')?.value;
    
    
      if (datetimeFrom) formData.append('datetime_from', datetimeFrom);
      if (datetimeTo) formData.append('datetime_to', datetimeTo);
    
      // Debug FormData
      console.log('FormData before submission:');
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
    
      // Submit the FormData
      this.createSubEvent(parentId, formData);
    }
    
    private createSubEvent(parentId: number, formData: FormData) {
      if (parentId) {
        this.eventService.createSubEvent(formData).subscribe(
          response => {
            if (response.success) {
              this.openPopup();
              console.log('Sub-event created successfully:', response.message);
              // Reset specific fields after successful submission
             //this.eventForm.reset();
             this.eventForm.patchValue({
              event_venue_id: null,
              datetime_from: null,
              datetime_to: null,
            });
   // Reset the entire form or specific fields as needed
            } else {
              console.error('Error saving sub-event data:', response.errors || response.error);
            }
          },
          error => {
            console.error('Error saving sub-event data:', error);
          }
        );
      } else {
        console.log('Parent event data not found.');
      }
    }
    openPopup(): void {
      this.showPopup = true;
      }

      onPopupClose(result: boolean): void {
        this.showPopup = false;
        this.secondVenueNeeded = result;
        this.timecheck = false;
    
      
        if (result) {
          if (this.parentId) {
            sessionStorage.setItem('parent_id', this.parentId.toString());
            this.router.navigate(['/secondvenue',this.parentId]);
          } else {
            console.error('Parent ID is not found in sessionStorage.');
          }
        } else if (this.parentId) {
          // Navigate to the Createdetail component
          this.router.navigate(['/createdetail']);
        } else {
          console.log('Parent ID is not found in sessionStorage, and no second venue is needed.');
        }
      }
      
      goBack(): void {
        if (this.parentId) {
          sessionStorage.setItem('parent_id', this.parentId.toString());
          this.router.navigate(['/createdetail']);
        } else {
          // If parentId is not available, handle it accordingly
          console.log('Parent ID is not available');
          this.router.navigate(['/createdetail']);
        }
      }
    }      
