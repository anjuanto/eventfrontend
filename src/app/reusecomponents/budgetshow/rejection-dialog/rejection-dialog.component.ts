import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-rejection-dialog',
  templateUrl: './rejection-dialog.component.html',
  styleUrls: ['./rejection-dialog.component.css']
})
export class RejectionDialogComponent {
  rejectionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RejectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.rejectionForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(5), this.noWhitespaceValidator]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.rejectionForm.valid) {
      this.dialogRef.close(this.rejectionForm.value.reason);
    }
  }

  // Custom validator for whitespace
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const isWhitespace = value.trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }
}
