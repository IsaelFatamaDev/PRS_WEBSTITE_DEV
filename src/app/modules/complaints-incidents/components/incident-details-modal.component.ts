import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Incident, IncidentResolution } from '../models/complaints-incidents.models';
import { IncidentResolutionsService } from '../services/incident-resolutions.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface IncidentDetailsData {
  id?: string;
  organizationId: string;
  incidentCode: string;
  incidentTypeId: string;
  incidentCategory: 'GENERAL' | 'CALIDAD' | 'DISTRIBUCION';
  zoneId: string;
  incidentDate: number; // timestamp (milisegundos)
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  affectedBoxesCount: number;
  reportedByUserId: string;
  assignedToUserId?: string;
  resolvedByUserId?: string;
  resolved: boolean;
  resolutionNotes?: string;
  recordStatus: 'ACTIVE' | 'INACTIVE';
  incidentType: string;
  estimatedResolutionTime: string;
  priorityLevel: string;
}

@Component({
  selector: 'app-incident-details-modal',
  templateUrl: './incident-details-modal.component.html',
  styleUrls: ['./incident-details-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  providers: [IncidentResolutionsService]
})
export class IncidentDetailsModalComponent {
  resolutionDetails: IncidentResolution | null = null;
  isResolutionLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<IncidentDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncidentDetailsData,
    private resolutionService: IncidentResolutionsService // Inject the service
  ) {
    console.log('IncidentDetailsModalComponent opened with data:', this.data);
    console.log('Incident resolved status:', this.data.resolved);
    if (this.data.resolved) {
      this.loadResolutionDetails();
    }
  }

  getResolutionDate(): Date | null {
    if (this.resolutionDetails && typeof this.resolutionDetails.resolutionDate === 'number' && this.resolutionDetails.resolutionDate > 0) {
      return new Date(this.resolutionDetails.resolutionDate);
    }
    return null;
  }

  loadResolutionDetails(): void {
    if (!this.data.id) {
      console.warn('No incident ID available to load resolution details.');
      return;
    }

    this.isResolutionLoading = true;
    this.resolutionService.getAll().subscribe({
      next: (resolutions: IncidentResolution[]) => {
        this.resolutionDetails = resolutions.find((res: IncidentResolution) => res.incidentId === this.data.id) || null;
        this.isResolutionLoading = false;
        console.log('Resolution details loaded:', this.resolutionDetails);
      },
      error: (error: any) => {
        console.error('Error loading resolution details:', error);
        this.isResolutionLoading = false;
        // Optionally, show an error message to the user
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}