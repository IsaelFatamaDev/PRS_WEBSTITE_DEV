import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IncidentResolutionsService } from '../../services/incident-resolutions.service';
import { IncidentResolution } from '../../models/complaints-incidents.models';
import { IncidentResolutionFormModalComponent } from './incident-resolution-form-modal/incident-resolution-form-modal.component';

@Component({
  selector: 'app-incident-resolutions',
  templateUrl: './incident-resolutions.component.html',
  styleUrls: ['./incident-resolutions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ]
})
export class IncidentResolutionsComponent implements OnInit {
  resolutions: IncidentResolution[] = [];

  constructor(
    private resolutionService: IncidentResolutionsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadResolutions();
  }

  loadResolutions(): void {
    this.resolutionService.getAll().subscribe({
      next: (data) => {
        // Asegurarse de que todas las fechas sean válidas
        this.resolutions = data.map(resolution => {
          // Si la fecha es 0, null, undefined o no es un número válido, establecer a 0
          if (!resolution.resolutionDate || isNaN(resolution.resolutionDate)) {
            return { ...resolution, resolutionDate: 0 };
          }
          return resolution;
        });
      },
      error: (error: any) => {
        console.error('Error loading resolutions:', error);
      }
    });
  }

  openResolutionForm(resolution?: IncidentResolution): void {
    const dialogRef = this.dialog.open(IncidentResolutionFormModalComponent, {
      width: '700px',
      data: { resolution: resolution }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadResolutions();
      }
    });
  }

  deleteResolution(id: string): void {
    if (confirm('Are you sure you want to delete this resolution?')) {
      this.resolutionService.delete(id).subscribe({
        next: () => {
          this.loadResolutions();
        },
        error: (error: any) => {
          console.error('Error deleting resolution:', error);
        }
      });
    }
  }
}