import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Complaint, ComplaintCategory } from '../../models/complaints-incidents.models';
import { ComplaintCategoriesService } from '../../services/complaint-categories.service';
import { ComplaintsService } from '../../services/complaints.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-complaint-form-modal',
  templateUrl: './complaint-form-modal.component.html',
  styleUrls: ['./complaint-form-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatToolbarModule, MatIconModule]
})
export class ComplaintFormModalComponent implements OnInit {
  complaintForm: FormGroup;
  categories: ComplaintCategory[] = [];
  isEditing = false;

  statusOptions = ['RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ComplaintFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { complaint: Complaint | null },
    private categoriesService: ComplaintCategoriesService,
    private complaintsService: ComplaintsService
  ) {
    this.isEditing = !!data.complaint;
    this.complaintForm = this.fb.group({
      user_id: [data.complaint?.user_id || '', Validators.required],
      category_id: [data.complaint?.category_id || '', Validators.required],
      complaint_date: [data.complaint?.complaint_date ? new Date(data.complaint.complaint_date * 1000) : new Date(), Validators.required],
      subject: [data.complaint?.subject || '', Validators.required],
      description: [data.complaint?.description || '', Validators.required],
      status: [data.complaint?.status || 'RECEIVED', Validators.required],
      priority: [data.complaint?.priority || 'MEDIUM', Validators.required],
      complaint_code: [data.complaint?.complaint_code || '', Validators.required],
      water_box_id: [data.complaint?.water_box_id || '', Validators.required],
      organization_id: [data.complaint?.organization_id || '', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error: any) => {
        // Manejo simple de error
        console.error('Error loading categories:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.complaintForm.valid) {
      const formValue = this.complaintForm.value;
      // Convertir fecha a timestamp en segundos
      formValue.complaint_date = Math.floor(new Date(formValue.complaint_date).getTime() / 1000);

      const complaintObservable = this.isEditing
        ? this.complaintsService.update(this.data.complaint!.id!, formValue as Complaint)
        : this.complaintsService.create(formValue as Complaint);

      complaintObservable.subscribe({
        next: (complaintResponse) => {
          console.log('Complaint submitted successfully:', complaintResponse);
          this.dialogRef.close(complaintResponse);
        },
        error: (error: any) => {
          console.error('Error submitting complaint:', error);
          // Handle error, maybe show a snackbar message
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 