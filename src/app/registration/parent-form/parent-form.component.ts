import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EventService } from '../../service/event.service';
import { MatStepper } from '@angular/material/stepper';
import { ServiceFormComponent } from '../service-form/service-form.component';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { Event } from '../../models/event';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SharedDataService } from '../../service/shared-data.service';

@Component({
  selector: 'app-parent-form',
  templateUrl: './parent-form.component.html',
  styleUrls: ['./parent-form.component.css'],
  providers: [DatePipe]
})
export class ParentFormComponent implements OnInit {

  @ViewChild('stepper', { static: false }) stepper!: MatStepper;
  @ViewChild(ServiceFormComponent) serviceFormComponent!: ServiceFormComponent;
  @ViewChild(BudgetFormComponent) budgetFormComponent!: BudgetFormComponent;

  eventForm!: FormGroup;
  eventTypes: any[] = [];
  eventVenues: any[] = [];
  events: Event[] = [];
  showPopup: boolean = false;
  secondVenueNeeded: boolean = false;
  details: boolean = false;
  parentId?: number;
  isTypeSelected = false;
  isReadonly = false;
  selectedType: 'meeting' | 'event' | null = null; 
  venues: Event[] = [];
  minDate: Date;
  maxDate: Date; 
  amalaProjects: any[] = [];
  overlappingEvents: any[] = [];
  step: number = 1;
  timecheck: boolean =false;
  isFormValid: boolean = false;
  isAnyCountInvalid: boolean = false;


  constructor(
    private fb: FormBuilder,
    private router: Router, 
    private _snackBar: MatSnackBar,  
     private datePipe: DatePipe,
     private eventService: EventService,
     private route: ActivatedRoute, 
     private sharedDataService: SharedDataService 
    ) 
    {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.step = +params['step'] || 1;
    });
  
    this.eventForm = this.fb.group({
      event_venue_id: ['', Validators.required],
      datetime_from: ['', Validators.required],
      datetime_to: ['', Validators.required],      
      contact_no: ['', [
        Validators.required,
        Validators.pattern(/^\d{10}$/)
      ]],
      contact_email: ['', [
        Validators.required, 
        Validators.email 
      ]],
      event_type_id: ['', Validators.required],
      title: ['', Validators.required],
      parent_id:[''],
      amala_project_id: [''],
      servicecategory: this.fb.array([]),
      expenses: this.fb.array([]), 
      
    });
  
   this.loadAmalaProject();
   this.loadEventTypes();
   this.loadEventVenues();

  }


  selectType(type: 'meeting' | 'event') {
    this.selectedType = type;
    this.isTypeSelected = true;
  
    if (this.selectedType === 'meeting') {
      const selectedEventType = this.eventTypes.find(eventType => eventType.name === 'Meeting');
      if (selectedEventType) {
        this.eventForm.patchValue({
          event_type_id: selectedEventType.id,
        });
        this.eventForm.get('event_type_id')?.disable();  // Set the field to readonly
      }
    } else {
      this.eventForm.reset();
      this.eventForm.patchValue({ event_type_id: null, readonly_event_type_id: null });
    }
  }
 
  goBack() {
    this.router.navigate(['/event-master']);
  }

  get expensesArray(): FormArray {
    return this.eventForm.get('expenses') as FormArray;
  }
  get serviceCategoryArray(): FormArray {
    return this.eventForm.get('servicecategory') as FormArray;
  }

  onFormValidityChange(isValid: boolean): void {
    this.isFormValid = isValid; // Update form validity flag
  }
  

  previous(): void {
    this.stepper.previous();
  }

  loadAmalaProject(): void{
    this.eventService.getAmalaProjects().subscribe(
      (data) => {
        this.amalaProjects = data;
      },
      (error) => {
        console.error('Failed to fetch Amala projects', error);
      }
    );

  }

  loadEventTypes(): void {
    this.eventService.getEventTypes().subscribe(data => {
      this.eventTypes = data;
    });
  }

  loadEventVenues(): void {
    this.eventService.getEventVenues().subscribe(data => {
      this.eventVenues = data;
    });
  }
  

  onBudgetDataReceived(expenses: { event_budget_category_id: number; amount: number; nos: number }[]) {
    this.expensesArray.clear();
    expenses.forEach(expense => {
      this.expensesArray.push(this.fb.group(expense));
    });
  }

  onServiceCategoryDataReceived(serviceCategory: any[]): void {
    this.serviceCategoryArray.clear();
    let isAnyCountInvalid = false;
    serviceCategory.forEach(category => {
      const countValue = category.count === null || category.count === ''
      ? null
      : parseFloat(category.count);

    // Validation: null or positive whole numbers are valid
    const isValidCount = countValue === null || (Number.isInteger(countValue) && countValue > 0);

    //console.log('Is Valid Count:', isValidCount);

    if (!isValidCount) {

       isAnyCountInvalid = true;
     }
    const formattedCategory = {
    category_product_id: category.category_product_id,
    response_id: category.response_id !== '' ? category.response_id : null,  
    count: category.count !== '' ? category.count : null,
    remarks: category.remarks !== '' ? category.remarks : null
    };
      this.serviceCategoryArray.push(this.fb.group(formattedCategory));
    });
    this.isAnyCountInvalid = isAnyCountInvalid;
   // console.log('Service Categories in Parent Component:', JSON.stringify(this.serviceCategoryArray.value));
  }
  nexton(): void{
    this.stepper.next();
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
        // Store the parent ID in sessionStorage
        sessionStorage.setItem('parent_id', this.parentId.toString());

        // Navigate to the SecondVenueComponent
        this.router.navigate(['/secondvenue', this.parentId]);
     // this.fetchSecondVenueData(this.parentId);
    } else {
      console.error('Parent ID is not defined.');
    }
  } else if (this.parentId) {

    // Store only the parent ID in sessionStorage
    sessionStorage.setItem('parent_id', this.parentId.toString());

    // Navigate to the child component
    this.router.navigate(['/createdetail']);
  } else {
    console.log('Parent ID is not defined, and no second venue is needed.');
  }
  } 

   formatDateTime(dateTime: any): string 
{
     if (dateTime && !isNaN(Date.parse(dateTime))) {
       return this.datePipe.transform(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss') || '';
     }
       return '';
   }

  submitForm(isMeeting: boolean): void {
  console.log('Form Values:', this.eventForm);
  this.eventForm.get('count')?.clearValidators();
  this.eventForm.get('remarks')?.clearValidators();

  if (this.eventForm.valid) {
    const formData = new FormData();
    
    // Append common form controls
    ['event_type_id', 'title', 'contact_no', 'contact_email', 'event_venue_id','amala_project_id'].forEach(key => {
      const value = this.eventForm.get(key)?.value;
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Format and append date fields
    const datetimeFrom = this.formatDateTime(this.eventForm.get('datetime_from')?.value);
    const datetimeTo = this.formatDateTime(this.eventForm.get('datetime_to')?.value);
    if (datetimeFrom) formData.append('datetime_from', datetimeFrom);
    if (datetimeTo) formData.append('datetime_to', datetimeTo);

    // Conditionally append expense data
    if (!isMeeting && this.eventForm.get('expenses')) {
      const expenses = this.eventForm.get('expenses')?.value || [];
      if (expenses.length > 0) {
        expenses.forEach((expense: any, index: number) => {
          formData.append(`expenses[${index}][event_budget_category_id]`, expense.event_budget_category_id);
          formData.append(`expenses[${index}][amount]`, expense.amount);
          formData.append(`expenses[${index}][nos]`, expense.nos);
        });
      }
    }

    // Conditionally append service category data
    if (!isMeeting && this.eventForm.get('servicecategory')) {
      const serviceCategoryArray = this.eventForm.get('servicecategory')?.value || [];
      if (serviceCategoryArray.length > 0) {
        serviceCategoryArray.forEach((category: any, index: number) => {
          formData.append(`servicecategory[${index}][category_product_id]`, category.category_product_id);
          formData.append(`servicecategory[${index}][response_id]`, category.response_id !== null ? category.response_id : '');
          formData.append(`servicecategory[${index}][count]`, category.count !== null ? category.count : '');
          formData.append(`servicecategory[${index}][remarks]`, category.remarks !== null ? category.remarks : '');
        });
      }
    }

    // **Log FormData content** before sending
    console.log('formData');
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Send FormData using the eventService
    this.eventService.createEvent(formData).subscribe(
      response => {
        console.log(response);
        if (response.success) {
          this.parentId = response.id;
          this.eventForm.reset();
          this.openPopup();
          this._snackBar.open('Meeting venue booked successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top' // You can use 'top' or 'bottom' based on your preference
          });
        } else if (response.errors || response.error) {
          console.error('Error saving data:', response.errors || response.error);
        }
      },
      error => {
        console.error('Error saving data:', error);
      }
    );
  } 
  else {
    console.log('Please fill in all required fields.');
  }
   }
  

  next(): void {
    if (this.isFormValid) {
  const venueId = this.eventForm.get('event_venue_id')?.value;
  const datetimeFrom = this.eventForm.get('datetime_from')?.value;
  const datetimeTo = this.eventForm.get('datetime_to')?.value;

  if (venueId && datetimeFrom && datetimeTo) {
    if (this.isValidDateRange(datetimeFrom, datetimeTo)) {
      this.eventService.checkVenue({
        event_venue_id: venueId,
        datetime_from: this.formatDateTime(datetimeFrom),
        datetime_to: this.formatDateTime(datetimeTo)
      }).subscribe(
        (response: any) => {
         // console.log(response);
          if (response.is_available) {
            this._snackBar.open('Venue is available', 'Close', { duration: 1000 });
            this.stepper.next();
          } else {
            this._snackBar.open('Venue is not available', 'Close', { duration: 1000 });
            this.eventForm.reset();  // Reset the form if venue is not available
          }
        },
        error => {
          console.error('Error checking venue:', error);
          this._snackBar.open('Error checking venue availability', 'Close', { duration: 1000 });
        }
      );
    } else {
      this._snackBar.open('DateTime To must be after DateTime From', 'Close', { duration: 1000 });
    }
  } else {
    this._snackBar.open('Please fill out all required fields', 'Close', { duration: 1000 });
  }
}
   }
   


isValidDateRange(datetime_from: any, datetime_to: any): boolean {
  return datetime_from && datetime_to && new Date(datetime_from) < new Date(datetime_to);
}
}
