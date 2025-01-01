import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'], // optional for styling
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  // Close the dialog with a false result (cancel action)
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Close the dialog with a true result (confirm action)
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
