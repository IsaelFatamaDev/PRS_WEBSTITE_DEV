import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ComplaintResponse, Complaint } from '../../models/complaints-incidents.models';

@Component({
  selector: 'app-complaint-response-form-modal',
  templateUrl: './complaint-response-form-modal.component.html',
  styleUrls: ['./complaint-response-form-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule]
})
export class ComplaintResponseFormModalComponent implements OnInit {
  responseForm: FormGroup;
  complaints: Complaint[] = [];
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ComplaintResponseFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { response: ComplaintResponse | null, complaints: Complaint[] }
  ) {
    this.complaints = data.complaints;
    this.isEditing = !!data.response;
    this.responseForm = this.fb.group({
      complaintId: [data.response?.complaintId || '', Validators.required],
      responseDate: [data.response?.responseDate ? new Date(data.response.responseDate) : new Date(), Validators.required],
      message: [data.response?.message || '', Validators.required],
      respondedByUserId: [data.response?.respondedByUserId || '', Validators.required],
      isSolution: [data.response?.isSolution || false],
      satisfactionRating: [data.response?.satisfactionRating || null, [Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.responseForm.valid) {
      const formValue = this.responseForm.value;
      // Convertir fecha a timestamp si es necesario
      formValue.responseDate = new Date(formValue.responseDate).toISOString();
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 