import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ComplaintsService } from '../../services/complaints.service';
import { ComplaintCategoriesService } from '../../services/complaint-categories.service';
import { Complaint, ComplaintCategory } from '../../models/complaints-incidents.models';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ComplaintFormModalComponent } from './complaint-form-modal.component';
@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ]
})
export class ComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  categories: ComplaintCategory[] = [];
  complaintForm: FormGroup;
  isEditing = false;
  selectedComplaintId: string | null = null;

  statusOptions = ['RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  constructor(
    private fb: FormBuilder,
    private complaintsService: ComplaintsService,
    private categoriesService: ComplaintCategoriesService,
    private dialog: MatDialog
  ) {
    this.complaintForm = this.fb.group({
      userId: ['', Validators.required],
      categoryId: ['', Validators.required],
      complaintDate: [new Date(), Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required],
      status: ['RECEIVED', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadComplaints();
    this.loadCategories();
  }

  loadComplaints(): void {
    this.complaintsService.getAll().subscribe({
      next: (complaints) => {
        this.complaints = complaints;
      },
      error: (error) => {
        this.showMessage('Error loading complaints');
        console.error('Error loading complaints:', error);
      }
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.showMessage('Error loading categories');
        console.error('Error loading categories:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.complaintForm.valid) {
      const complaintData = this.complaintForm.value;
      
      if (this.isEditing && this.selectedComplaintId) {
        this.complaintsService.update(this.selectedComplaintId, complaintData).subscribe({
          next: () => {
            this.showMessage('Complaint updated successfully');
            this.resetForm();
            this.loadComplaints();
          },
          error: (error) => {
            this.showMessage('Error updating complaint');
            console.error('Error updating complaint:', error);
          }
        });
      } else {
        this.complaintsService.create(complaintData).subscribe({
          next: () => {
            this.showMessage('Complaint created successfully');
            this.resetForm();
            this.loadComplaints();
          },
          error: (error) => {
            this.showMessage('Error creating complaint');
            console.error('Error creating complaint:', error);
          }
        });
      }
    }
  }

  editComplaint(complaint: Complaint): void {
    this.isEditing = true;
    this.selectedComplaintId = complaint.id || null;
    this.complaintForm.patchValue(complaint);
  }

  deleteComplaint(id: string): void {
    if (confirm('Are you sure you want to delete this complaint?')) {
      this.complaintsService.delete(id).subscribe({
        next: () => {
          this.showMessage('Complaint deleted successfully');
          this.loadComplaints();
        },
        error: (error) => {
          this.showMessage('Error deleting complaint');
          console.error('Error deleting complaint:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.selectedComplaintId = null;
    this.complaintForm.reset({
      complaintDate: new Date(),
      status: 'RECEIVED'
    });
  }

  private showMessage(message: string): void {
    // Simple alert for now - can be replaced with a custom toast notification
    alert(message);
  }

  openComplaintModal(): void {
    const dialogRef = this.dialog.open(ComplaintFormModalComponent, {
      width: '600px',
      data: { complaint: null }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadComplaints();
      }
    });
  }
} 