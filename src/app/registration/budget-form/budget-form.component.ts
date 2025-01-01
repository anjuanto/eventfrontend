import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup,FormControl, Validators, FormArray } from '@angular/forms';
import { EventService } from '../../service/event.service';
import { BudgetCategory } from '../../models/event';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css'],
})
export class BudgetFormComponent implements OnInit {
  @Input() stepper!: MatStepper;
  @Input() formGroup!: FormGroup;
  @Output() budgetData = new EventEmitter<{ event_budget_category_id: number; amount: number; nos: number }[]>();


  budgetCategories: BudgetCategory[] = [];
  event_budget_category_id: number | null = null;
  selectedCategoryName: string = '';
  amount: number | null = null;
  nos: number | null = null;
  editingIndex: number | null = null;
  totalAmount: number = 0;
  expenses: { event_budget_category_id: number; amount: number; nos: number }[] = [];
  isAmountReadonly: boolean = false; 
  disabledCategories: number[] = [];

  

  constructor(private eventService: EventService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadBudgetCategories();
    this.initializeFormControls();
  }

  initializeFormControls(): void {
    if (!this.formGroup.contains('event_budget_category_id')) {
      this.formGroup.addControl('event_budget_category_id', new FormControl(null));
    }
    if (!this.formGroup.contains('amount')) {
      this.formGroup.addControl('amount', new FormControl(null));
    }
    if (!this.formGroup.contains('nos')) {
      this.formGroup.addControl('nos',new FormControl(null));
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
      this.formGroup.get('amount')?.setValue(selectedCategory.price);
      this.isAmountReadonly = true; // Set readonly if price is present
    } else {
      this.formGroup.get('amount')?.setValue(null);
      this.isAmountReadonly = false; // Allow editing if no price
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

  // addExpense(): void {
  //   const event_budget_category_id = this.formGroup.get('event_budget_category_id')?.value;
  //   const amount = this.formGroup.get('amount')?.value;
  //   const nos = this.formGroup.get('nos')?.value;
    
  //    // Ensure nos is at least 1
     
  //   if (event_budget_category_id === null || amount === null || nos === null || nos < 1 ) {
  //     console.error('Invalid input values');
  //     return;
  //   }

  //   const total = amount * nos;
  //   const newExpense = {
  //     event_budget_category_id: event_budget_category_id,
  //     amount: amount,
  //     nos: nos
  //   };

  //   if (this.editingIndex !== null) {
  //     // If editing an existing expense, update it
  //     this.expenses[this.editingIndex] = newExpense;
  //     this.expenses = [...this.expenses]; // Trigger change detection by updating reference
  //     this.editingIndex = null; // Reset the editing index
  //   } else {
  //     // Append new expense
  //     this.expenses = [...this.expenses, newExpense];
  //   }

  //   // Update total amount
  //   this.totalAmount = this.expenses.reduce((sum, exp) => sum + exp.amount * exp.nos, 0);

  //   // Reset the form controls for amount, nos, and event_budget_category_id
  //    this.formGroup.get('amount')?.reset();
  //    this.formGroup.get('nos')?.reset();
  //    this.formGroup.get('event_budget_category_id')?.reset();


  //   // Emit updated expenses
  //   this.budgetData.emit(this.expenses);

  
  // }

  editExpense(expense: { event_budget_category_id: number; amount: number; nos: number }, index: number): void {
    // Set form values based on selected expense
    this.formGroup.patchValue({
      event_budget_category_id: expense.event_budget_category_id,
      amount: expense.amount,
      nos: expense.nos
    });

    // Set the editing index to the current index
    this.editingIndex = index;
  }

  // deleteExpense(index: number): void {
  //   // Remove the expense from the array
  //   this.expenses.splice(index, 1);
  //   this.expenses = [...this.expenses]; // Trigger change detection by updating reference

  //   // Update total amount after deletion
  //   this.totalAmount = this.expenses.reduce((sum, exp) => sum + exp.amount * exp.nos, 0);

  //   // Emit updated expenses
  //   this.budgetData.emit(this.expenses);
  // }

  updateTotalAmount(): void {
    const expenses = this.formGroup.get('expenses') as FormArray;
    this.totalAmount = expenses.controls.reduce((sum, control) => sum + control.get('amount')?.value, 0);
  }

  addExpense(): void {
    const event_budget_category_id = this.formGroup.get('event_budget_category_id')?.value;
    const amount = this.formGroup.get('amount')?.value;
    const nos = this.formGroup.get('nos')?.value;
  
    if (event_budget_category_id === null || amount === null || nos === null || nos < 1) {
      console.error('Invalid input values');
      return;
    }
  
    const newExpense = {
      event_budget_category_id,
      amount,
      nos
    };
  
    if (this.editingIndex !== null) {
      // Update the expense and disabledCategories
      const prevCategory = this.expenses[this.editingIndex].event_budget_category_id;
      if (prevCategory !== event_budget_category_id) {
        const index = this.disabledCategories.indexOf(prevCategory);
        if (index > -1) this.disabledCategories.splice(index, 1);
        this.disabledCategories.push(event_budget_category_id);
      }
      this.expenses[this.editingIndex] = newExpense;
      this.editingIndex = null;
    } else {
      // Add new expense and disable category
      this.expenses = [...this.expenses, newExpense];
      this.disabledCategories.push(event_budget_category_id);
    }
  
    this.totalAmount = this.expenses.reduce((sum, exp) => sum + exp.amount * exp.nos, 0);
  
    this.formGroup.reset();
    this.budgetData.emit(this.expenses);
  }
  
  deleteExpense(index: number): void {
    const removedExpense = this.expenses[index];
    this.expenses.splice(index, 1);
    this.expenses = [...this.expenses];
  
    const removedCategoryId = removedExpense.event_budget_category_id;
    const categoryIndex = this.disabledCategories.indexOf(removedCategoryId);
    if (categoryIndex > -1) this.disabledCategories.splice(categoryIndex, 1);
  
    this.totalAmount = this.expenses.reduce((sum, exp) => sum + exp.amount * exp.nos, 0);
    this.budgetData.emit(this.expenses);
  }
  
}
