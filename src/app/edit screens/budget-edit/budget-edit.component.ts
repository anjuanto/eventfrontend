import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { EventService } from 'src/app/service/event.service';
import { FormBuilder, FormGroup,FormControl, Validators, FormArray } from '@angular/forms';
import { BudgetCategory,BudgetDetail } from 'src/app/models/event';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatPaginator } from '@angular/material/paginator'; // Import paginator


@Component({
  selector: 'app-budget-edit',
  templateUrl: './budget-edit.component.html',
  styleUrls: ['./budget-edit.component.css']
})
export class BudgetEditComponent implements OnInit {
  eventForm!: FormGroup;
  eventMasterId!: number;
  budgetCategories: BudgetCategory[] = [];
  Budgetdetail: BudgetDetail[] = []; // Initialize as an empty array
  event_budget_category_id: number | null = null;
  selectedCategoryName: string = '';
  amount: number | null = null;
  nos: number | null = null;
  editingIndex: number | null = null;
  totalAmount: number = 0;
  total: number =0;
  expenses: { event_budget_category_id: number; amount: number; nos: number }[] = [];
  combinedData: any[] = []; 
  selectedExpense: BudgetDetail | null = null;
  eventStatus: string | number = '';// Default value, can be updated later
  returnUrl: string = ''; 



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private eventService: EventService,
    private fb: FormBuilder) {}

     ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.returnUrl = params['returnUrl'] || '/default-return-route';
      });

      // Initialize the form with form controls
      this.eventForm = this.fb.group({
        event_budget_category_id: [''], // Control for category
        amount: [''], // Control for amount
        nos: [''] // Control for number of items
      });
           // Subscribe to route parameters to get the eventMasterId
     this.route.params.subscribe(params => {
      this.eventMasterId = +params['id']; // Convert to number
      console.log('Event Master ID:', this.eventMasterId);});
    
     
     // Fetch budget details based on eventMasterId
      this.loadBudgetdetails();
    
      // Load budget categories (this could be a separate method to fetch data)
      this.loadBudgetCategories();
    
      // Initialize any additional form controls or custom logic
      this.initializeFormControls();

    }
  
    initializeFormControls(): void {
    if (!this.eventForm.contains('event_budget_category_id')) {
      this.eventForm.addControl('event_budget_category_id', new FormControl(null));
    }
    if (!this.eventForm.contains('amount')) {
      this.eventForm.addControl('amount', new FormControl(null));
    }
    if (!this.eventForm.contains('nos')) {
      this.eventForm.addControl('nos',new FormControl(null));
     }
     }

    loadBudgetCategories(): void {
    this.eventService.getBudgetCategories().subscribe(
      (categories) => {
        this.budgetCategories = categories;
        if (this.event_budget_category_id !== null) {
          this.updateAmountForCategory();
        }
      },
      (error) => {
        console.error('Error fetching budget categories', error);
      }
      );
     }
     
    updateAmountForCategory(): void {
      if (this.event_budget_category_id === null) return;
    
      const selectedCategory = this.budgetCategories.find(
        (category) => category.id === this.event_budget_category_id
      );
    
      if (selectedCategory && selectedCategory.price != null) {
        this.eventForm.get('amount')?.setValue(selectedCategory.price);
      } else {
        this.eventForm.get('amount')?.setValue(null);
      }
     }
  
      onCategorySelectionChange(categoryId: number): void {
      this.event_budget_category_id = categoryId;
      this.selectedCategoryName = this.getCategoryName(categoryId);
      this.updateAmountForCategory();
      }
  
    getCategoryName(categoryId: number): string {
      const category = this.budgetCategories.find((cat) => cat.id === categoryId);
      return category ? category.name : 'Unknown';
    }
  
    loadBudgetdetails(): void {
       this.eventService.getbudgetdetail(this.eventMasterId).subscribe(
      (data: BudgetDetail[]) => {
        if (data && Array.isArray(data)) {
          console.log('Fetched budget details:', data);
          this.Budgetdetail = data;
  
          // Calculate the total amount by multiplying `nos` and `amount` for each entry
          this.total = this.Budgetdetail.reduce((sum, item) => sum + (item.nos * item.amount), 0);
          console.log('Total Amount:', this.totalAmount);

         // Find the budget detail with the matching event_master_id
         const matchingEvent = this.Budgetdetail.find(item => item.event_master_id === this.eventMasterId);
         this.eventStatus = matchingEvent?.eventmaster?.status.status || 0; // Adjusted to get the correct status
         console.log('Event Status:', this.eventStatus);
  
        } else {
          console.warn('Unexpected data format:', data);
        }
      },
      (error: any) => {
        console.error('Error fetching budget details', error);
      }
      );
      }

      addExpense(): void {
        const event_budget_category_id = this.eventForm.get('event_budget_category_id')?.value;
        const amount = this.eventForm.get('amount')?.value;
        const nos = this.eventForm.get('nos')?.value;
      
        // Ensure valid inputs
        if (event_budget_category_id === null || amount === null || nos === null || nos < 1) {
          console.error('Invalid input values');
          return;
        }
      
        const newExpense = {
          event_budget_category_id: event_budget_category_id,
          amount: amount,
          nos: nos,
          event_master_id: this.eventMasterId // Include the eventId here
        };
      
        // Save the new expense to the backend
        this.eventService.createBudget(newExpense).subscribe({
          next: (savedExpense) => {
            console.log('Expense saved successfully:', savedExpense);
            
            // Push the saved expense (with ID) into Budgetdetail
            this.Budgetdetail.push(savedExpense);
                // Trigger change detection by reassigning the array
             this.Budgetdetail = [...this.Budgetdetail];
            
            // Update total amount
            this.calculateTotalAmount();
            
            // Reset form controls
            this.eventForm.get('amount')?.reset();
            this.eventForm.get('nos')?.reset();
            this.eventForm.get('event_budget_category_id')?.reset();
          },
          error: (error) => {
            console.error('Error saving expense', error);
          }
        });
      }

      handleEmptySave(): void {
        if (this.Budgetdetail.length === 0) {
          this.router.navigateByUrl(this.returnUrl);
        }
      }
      
      
      saveExpenses(): void {
        // Check if there are budget details to update
        if (this.Budgetdetail.length === 0) {
          console.error('Nothing to update');
          return;
        }
        
        // Create an array to hold updated data
        const updatedBudgetDetails = this.Budgetdetail.map((detail) => ({
          event_budget_category_id: detail.event_budget_category_id,
          amount: detail.amount,
          nos: detail.nos,
          event_master_id: this.eventMasterId, // Include the eventMasterId here
          id: detail.id,
        }));
        
        console.log(updatedBudgetDetails);
        
        // Send the array in a single API call
        this.eventService.budgetdetailupdate(this.eventMasterId, updatedBudgetDetails).subscribe(
          (response) => {
            console.log('API response:', response);
            console.log('Event Status:', this.eventStatus);

       
        this.router.navigateByUrl(this.returnUrl);
      },
      (error) => {
        console.error('Error updating budget details:', error);
      }
        );
      }
      
  
  saveEditedExpense(): void {
    // Ensure an item is being edited
    if (this.editingIndex !== null) {
  
      // Check if the form is valid before proceeding
      if (this.eventForm.valid) {
  
        // Get the updated values from the form
        const updatedExpense = this.eventForm.value;
  
        // Update the specific item in the Budgetdetail array
        this.Budgetdetail[this.editingIndex] = {
          ...this.Budgetdetail[this.editingIndex],
          event_budget_category_id: updatedExpense.event_budget_category_id,
          amount: updatedExpense.amount,
          nos: updatedExpense.nos
        };
  
        // Trigger change detection by reassigning the array
        this.Budgetdetail = [...this.Budgetdetail];

         console.log(this.Budgetdetail);

        // Recalculate the total amount after the update
        this.calculateTotalAmount();
  
        // Clear the editing index and reset the form
        this.editingIndex = null;
        this.eventForm.reset();
      } else {
        console.warn('Form is not valid. Please fill out the required fields correctly.');
      }
    } else {
      console.warn('No item is being edited.');
    }
  }


  editExpense(expense: { event_budget_category_id: number; amount: number; nos: number }, index: number): void {
    // Set form values based on selected expense for editing
    this.eventForm.patchValue({
      event_budget_category_id: expense.event_budget_category_id,
      amount: expense.amount,
      nos: expense.nos
    });
  
    // Set the editing index to the current index
    this.editingIndex = index;
   // console.log(this.editingIndex);
  }
  
  
  calculateTotalAmount(): void {
    this.total = this.Budgetdetail.reduce((sum, item) => sum + (item.nos * item.amount), 0);
  }
  
  // Method to delete an expense by index
  deleteExpense(index: number): void {
    const id = this.Budgetdetail[index].id; // Assuming each expense has a unique ID

    // Call service to delete from backend
    this.eventService.deletebudgetdetail(id).subscribe({
      next: () => {
        // Remove the item from the Budgetdetail array
        this.Budgetdetail.splice(index, 1);

        // Reassign the array to trigger change detection
        this.Budgetdetail = [...this.Budgetdetail];

        // Recalculate the total
        this.calculateTotalAmount();

        // Show success message
        this.snackBar.open('Expense deleted successfully', 'Close', {
          duration: 3000,
        });
      },
      error: () => {
        // Show error message
        this.snackBar.open('Error deleting expense', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  
  updateTotalAmount(): void {
    const expenses = this.eventForm.get('expenses') as FormArray;
    this.totalAmount = expenses.controls.reduce((sum, control) => sum + control.get('amount')?.value, 0);
  }
  goback(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
  onBack(): void {
    // Logic for Back button, e.g., navigating to the previous page
    this.router.navigate(['/serviceedit', this.eventMasterId], { queryParams: { returnUrl: this.returnUrl } });
  }

}
