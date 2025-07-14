import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ComplaintResponsesService } from '../../services/complaint-responses.service';
import { ComplaintsService } from '../../services/complaints.service';
import { ComplaintResponse, Complaint } from '../../models/complaints-incidents.models';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ComplaintResponseFormModalComponent } from './complaint-response-form-modal.component';

@Component({
  selector: 'app-complaint-responses',
  templateUrl: './complaint-responses.component.html',
  styleUrls: ['./complaint-responses.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ]
})
export class ComplaintResponsesComponent implements OnInit {
  responses: ComplaintResponse[] = [];
  complaints: Complaint[] = [];
  responseForm: FormGroup;
  isEditing = false;
  currentResponseId?: string;

  constructor(
    private fb: FormBuilder,
    private responsesService: ComplaintResponsesService,
    private complaintsService: ComplaintsService,
    private dialog: MatDialog
  ) {
    this.responseForm = this.fb.group({
      complaintId: ['', Validators.required],
      responseDate: [new Date(), Validators.required],
      message: ['', Validators.required],
      respondedByUserId: ['', Validators.required],
      isSolution: [false],
      satisfactionRating: [null, [Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.loadResponses();
    this.loadComplaints();
  }

  loadResponses(): void {
    this.responsesService.getAll().subscribe({
      next: (data) => {
        this.responses = data;
      },
      error: (err) => this.showError('Error loading responses')
    });
  }

  loadComplaints(): void {
    this.complaintsService.getAll().subscribe({
      next: (data) => {
        this.complaints = data;
      },
      error: (err) => this.showError('Error loading complaints')
    });
  }

  onSubmit(): void {
    if (this.responseForm.valid) {
      const responseData = this.responseForm.value;
      
      if (this.isEditing && this.currentResponseId) {
        this.responsesService.update(this.currentResponseId, responseData).subscribe({
          next: () => {
            this.showMessage('Response updated successfully');
            this.resetForm();
            this.loadResponses();
          },
          error: (error) => {
            this.showMessage('Error updating response');
            console.error('Error updating response:', error);
          }
        });
      } else {
        this.responsesService.create(responseData).subscribe({
          next: () => {
            this.showMessage('Response created successfully');
            this.resetForm();
            this.loadResponses();
          },
          error: (error) => {
            this.showMessage('Error creating response');
            console.error('Error creating response:', error);
          }
        });
      }
    }
  }

  editResponse(response: ComplaintResponse): void {
    this.isEditing = true;
    this.currentResponseId = response.id;
    this.responseForm.setValue({
      complaintId: response.complaintId,
      responseDate: response.responseDate,
      message: response.message,
      respondedByUserId: response.respondedByUserId,
      isSolution: response.isSolution,
      satisfactionRating: response.satisfactionRating
    });
  }

  deleteResponse(id: string): void {
    if (confirm('Are you sure you want to delete this response?')) {
      this.responsesService.delete(id).subscribe({
        next: () => {
          this.showMessage('Response deleted successfully');
          this.loadResponses();
        },
        error: (error) => {
          this.showMessage('Error deleting response');
          console.error('Error deleting response:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentResponseId = undefined;
    this.responseForm.reset({
      responseDate: new Date()
    });
  }

  private showMessage(message: string): void {
    // Simple alert for now - can be replaced with a custom toast notification
    alert(message);
  }

  private showError(message: string): void {
    // Simple alert for now - can be replaced with a custom toast notification
    alert('Error: ' + message);
  }

  getComplaintSubject(complaintId: string): string {
    const complaint = this.complaints.find(c => c.id === complaintId);
    return complaint ? complaint.subject : 'N/A';
  }

  openResponseModal(): void {
    const dialogRef = this.dialog.open(ComplaintResponseFormModalComponent, {
      width: '600px',
      data: { response: null, complaints: this.complaints }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadResponses();
      }
    });
  }
} 