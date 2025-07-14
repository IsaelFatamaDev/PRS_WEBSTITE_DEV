import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IncidentType } from '../../models/complaints-incidents.models';

interface IncidentTypeDetailsData {
  incidentType: IncidentType;
}

@Component({
  selector: 'app-incident-type-details-modal',
  templateUrl: './incident-type-details-modal.component.html',
  styleUrls: ['./incident-type-details-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule]
})
export class IncidentTypeDetailsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<IncidentTypeDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncidentTypeDetailsData
  ) { }

  close(): void {
    this.dialogRef.close();
  }
} 