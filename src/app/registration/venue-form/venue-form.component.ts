import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from 'src/app/service/event.service'; 
import { MatStepper } from '@angular/material/stepper';
import { EventType, EventVenue } from 'src/app/models/event';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 



@Component({
  selector: 'app-venue-form',
  templateUrl: './venue-form.component.html',
  styleUrls: ['./venue-form.component.css'],
  providers: [DatePipe]
})
export class VenueFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() stepper!: MatStepper;
  @Input() eventVenues!: EventVenue[];
  @Input() eventTypes!: EventType[];
  @Output() formValidityChange = new EventEmitter<boolean>();

  is_available: boolean = false;
  set:boolean = true;
  overlappingEvents: any[] = [];
  private snackBarShown: boolean = false;
  selectedType: 'meeting' | 'event' | null = null; 
  minDate: Date;
  maxDate: Date; 
  amalaProjects: any[] = [];
  isMeeting: boolean = false;
  timecheck: boolean =false;
  // dateTimeFilter: (date: Date | null) => boolean = () => true;



  constructor(
    private _snackBar: MatSnackBar,
    private eventService: EventService,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
  }

  ngOnInit(): void {
    if (!this.formGroup) {
      this.formGroup = this.fb.group({
        event_venue_id: ['', Validators.required],
        datetime_from: [ Validators.required],
        datetime_to: [Validators.required],
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
        parent_id: [''],
        amala_project_id: ['']
      });
      
    }
    

  
      // Fetch the Amala projects
      this.eventService.getAmalaProjects().subscribe(
        (data) => {
          this.amalaProjects = data;
        },
        (error) => {
          console.error('Failed to fetch Amala projects', error);
        }
      );

      // Trigger venue check on any relevant form value change
       this.formGroup.get('event_venue_id')?.valueChanges.subscribe((value) => {
        this.checkFormValidity();
       this.triggerVenueCheck();
       });
  
       this.formGroup.get('datetime_from')?.valueChanges.subscribe((value) => {
        console.log('datetime_from changed:', value);
        this.checkFormValidity();
        this.triggerVenueCheck();
        this.triggerTypeCheck();
      });
      
      this.formGroup.get('datetime_to')?.valueChanges.subscribe((value) => {
        console.log('datetime_to changed:', value);
        this.checkFormValidity();
        this.triggerVenueCheck();
        this.triggerTypeCheck();
      });
       this.formGroup.get('event_type_id')?.valueChanges.subscribe((value) => {
        this.checkFormValidity();
        this.triggerTypeCheck();
        });
 
       this.formGroup.get('title')?.valueChanges.subscribe(() => {
      this.checkFormValidity();
        });
  
        this.formGroup.get('contact_no')?.valueChanges.subscribe(() => {
         this.checkFormValidity();
        });
  
        this.formGroup.get('contact_email')?.valueChanges.subscribe(() => {
        this.checkFormValidity();
        });
  
    // Initial validity check for these fields
    this.checkFormValidity();
  
    
  }


  checkFormValidity(): void {
    const isValid = this.formGroup.get('event_venue_id')?.valid &&
      this.formGroup.get('datetime_from')?.valid &&
      this.formGroup.get('datetime_to')?.valid &&
      this.formGroup.get('event_type_id')?.valid &&
      this.formGroup.get('title')?.valid &&
      this.formGroup.get('contact_no')?.valid &&
      this.formGroup.get('contact_email')?.valid;
  
    this.formValidityChange.emit(isValid);
  }

  isValidDateRange(datetime_from: any, datetime_to: any): boolean {
    return datetime_from && datetime_to && new Date(datetime_from) < new Date(datetime_to);
  }

  formatDateTime(dateTime: any): string {
    const transformedDate = this.datePipe.transform(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss');
    if (!transformedDate) {
      console.error('DatePipe returned null for:', dateTime);
    }
    return transformedDate || '';
  }
  

  triggerTypeCheck() {
    const typeId = this.formGroup.get('event_type_id')?.value;
    const datetimeFrom = this.formGroup.get('datetime_from')?.value;
    const datetimeTo = this.formGroup.get('datetime_to')?.value;

      if (typeId && datetimeFrom && datetimeTo) {

      if (this.isValidDateRange(datetimeFrom, datetimeTo)) {

        this.checktimeAvailability(datetimeFrom, datetimeTo,typeId,);
      } else {
        this._snackBar.open('DateTime To must be after DateTime From', 'Close',{ duration: 1000,});
        this.timecheck = false;
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
      this._snackBar.open('Invalid date provided', 'Close', { duration: 1000,});
      return;
    }

    if (!this.isValidDateRange(formattedDatetimeFrom, formattedDatetimeTo)) {
      this._snackBar.open('DateTime To must be after DateTime From', 'Close',{ duration: 1000,});
      this.timecheck = false;
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
          this._snackBar.open(response.message, 'Close', { duration: 2000,});
          this.timecheck = true;
          console.log(response);
        } else if (response && response.timecheck === 'false') {
          this.timecheck = false;
          this._snackBar.open(response.message, 'Close');
        }
      },
      (error) => {
        // Handle any errors from the API
        console.error('Error checking time:', error);
        this._snackBar.open('An error occurred. Please try again later.', 'Close' );
      }
    );
    
  }

  triggerVenueCheck() {
    const venueId = this.formGroup.get('event_venue_id')?.value;
    const datetimeFrom = this.formGroup.get('datetime_from')?.value;
    const datetimeTo = this.formGroup.get('datetime_to')?.value;
  
    if (venueId && datetimeFrom && datetimeTo) {
      if (this.isValidDateRange(datetimeFrom, datetimeTo)) {
        this.checkVenueAvailability(datetimeFrom, datetimeTo,venueId,);
      } else {
        this._snackBar.open('DateTime To must be after DateTime From', 'Close',{ duration: 3000,});
        this.timecheck = false;
      }
    } else {
      console.log('Required fields are missing.');
    }
  }

  // checkVenueAvailability(datetimeFrom: any, datetimeTo: any,venueId: any,): void {
  //   const formattedDatetimeFrom = this.formatDateTime(datetimeFrom);
  //   const formattedDatetimeTo = this.formatDateTime(datetimeTo);

  //   if (!formattedDatetimeFrom || !formattedDatetimeTo) {
  //     console.error('Invalid date provided');
  //     this._snackBar.open('Invalid date provided', 'Close',{ duration: 3000,});
  //     return;
  //   }

  //   if (!this.isValidDateRange(formattedDatetimeFrom, formattedDatetimeTo)) {
  //     this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 3000,});
  //     this.timecheck = false;
  //     return;
  //   }
  //   const formData = {
  //     event_venue_id: venueId,
  //     datetime_from: formattedDatetimeFrom,
  //     datetime_to: formattedDatetimeTo
  //   };
    
  //   this.eventService.checkVenue(formData).subscribe(
  //     (response: any) => {
  //       if (response && response.is_available) {
  //         this.is_available = true;
  //         this.overlappingEvents = [];

  //         if (!this.snackBarShown) {
  //           this._snackBar.open('Venue is available', 'Close', { duration: 3000,});
            
  //           this.snackBarShown = true;
  //         }
  //       } else {
  //         this.is_available = false;
  //         this.overlappingEvents = response.overlapping_events || [];
  //         console.log(this.overlappingEvents);
  //         const message = response.message || 'Venue is not available';
  //         this._snackBar.open(message, 'Close', { duration: 3000,});
  //         this.formGroup.patchValue({
  //           datetime_from: null,
  //           datetime_to: null
  //         });
      
  //       }
  //     },
  //     error => {
  //       console.error('Error checking venue:', error);
  //       this.is_available = false;
  //       this._snackBar.open('Error checking venue', 'Close');
  //     }
  //   );
  // }
  checkVenueAvailability(datetimeFrom: any, datetimeTo: any, venueId: any): void {
    const formattedDatetimeFrom = this.formatDateTime(datetimeFrom);
    const formattedDatetimeTo = this.formatDateTime(datetimeTo);
  
    if (!formattedDatetimeFrom || !formattedDatetimeTo) {
      console.error('Invalid date provided');
      this._snackBar.open('Invalid date provided', 'Close', { duration: 3000 });
      return;
    }
  
    if (!this.isValidDateRange(formattedDatetimeFrom, formattedDatetimeTo)) {
      this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 3000 });
      this.timecheck = false;
      return;
    }
  
    const formData = {
      event_venue_id: venueId,
      datetime_from: formattedDatetimeFrom,
      datetime_to: formattedDatetimeTo,
    };
  
    this.eventService.checkVenue(formData).subscribe(
      (response: any) => {
        if (response && response.is_available) {
          this.is_available = true;
          this.overlappingEvents = [];
  
          if (!this.snackBarShown) {
            this._snackBar.open('Venue is available', 'Close', { duration: 3000 });
            this.snackBarShown = true;
          }
        } else {
          this.is_available = false;
          this.overlappingEvents = response.overlapping_events || [];
          console.log(this.overlappingEvents);
  
          // Display backend errors in the SnackBar
          if (response.errors && response.errors.length > 0) {
            response.errors.forEach((error: string) => {
              this._snackBar.open(error, 'Close', { duration: 3000 });
            });
          } else {
            const message = response.message || 'Venue is not available';
            this._snackBar.open(message, 'Close', { duration: 3000 });
          }
  
          this.formGroup.patchValue({
            datetime_from: null,
            datetime_to: null,
          });
        }
      },
      (error) => {
        console.error('Error checking venue:', error);
        this.is_available = false;
        this._snackBar.open('Error checking venue', 'Close');
      }
    );
  }
  

  allowOnlyDigits(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57 ) {
      event.preventDefault(); 
    }
  }
  preventNonNumericPaste(event: ClipboardEvent): void {
      const clipboardData = event.clipboardData?.getData('text') || '';
      if (!/^\d+$/.test(clipboardData)) {
        event.preventDefault(); 
      }
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
