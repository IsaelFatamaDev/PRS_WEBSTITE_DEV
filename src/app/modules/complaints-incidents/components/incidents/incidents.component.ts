import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IncidentsService } from '../../services/incidents.service';
import { Incident, IncidentType } from '../../models/complaints-incidents.models';
import { IncidentFormModalComponent } from '../incident-form-modal/incident-form-modal.component';
import { IncidentTypesService } from '../../services/incident-types.service';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class IncidentsComponent implements OnInit {
  incidents: Incident[] = [];
  incidentTypes: IncidentType[] = [];
  showInactive = false;

  constructor(
    private incidentsService: IncidentsService,
    private incidentTypesService: IncidentTypesService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadIncidents();
    this.incidentTypesService.getAll().subscribe({
      next: (types) => { this.incidentTypes = types; },
      error: (err: any) => { console.error('Error loading incident types:', err); }
    });
  }

  loadIncidents(): void {
    this.incidentsService.getAll().subscribe({
      next: (incidents) => {
        // Asegurarse de que todas las fechas sean válidas
        this.incidents = incidents.map(incident => {
          console.log('Incident loaded:', incident);
          // Si la fecha es 0, null, undefined o no es un número válido, establecer a 0
          // Usamos 0 en lugar de null para cumplir con el tipo number requerido
          if (!incident.incidentDate || isNaN(incident.incidentDate)) {
            return { ...incident, incidentDate: 0 };
          }
          return incident;
        });
      },
      error: (error: any) => {
        console.error('Error loading incidents:', error);
      }
    });
  }

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
  }

  getIncidentsList(): Incident[] {
    return this.showInactive
      ? this.incidents.filter(i => i.recordStatus === 'INACTIVE')
      : this.incidents.filter(i => i.recordStatus === 'ACTIVE' || !i.recordStatus);
  }

  openIncidentForm(incident?: Incident): void {
    const dialogRef = this.dialog.open(IncidentFormModalComponent, {
      width: '600px',
      data: { incident: incident }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadIncidents();
        this.showSuccessAlert('Operación completada con éxito');
      }
    });
  }

  deleteIncident(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.incidentsService.getById(id).subscribe({
          next: (incident) => {
            const updatedIncident = { ...incident, recordStatus: 'INACTIVE' as const };
            this.incidentsService.update(id, updatedIncident).subscribe({
              next: () => {
                this.loadIncidents();
                this.showSuccessAlert('Incidencia eliminada con éxito.');
              },
              error: (error: any) => {
                console.error('Error eliminando incidencia:', error);
                this.showErrorAlert('Error eliminando incidencia.');
              }
            });
          },
          error: (error: any) => {
            console.error('Error obteniendo incidencia para eliminar:', error);
            this.showErrorAlert('Error obteniendo incidencia para eliminar.');
          }
        });
      }
    });
  }

  restoreIncident(id: string): void {
    Swal.fire({
      title: '¿Estás seguro de restaurar?',
      text: 'La incidencia volverá a estar activa.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, restaurar!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.incidentsService.getById(id).subscribe({
          next: (incident) => {
            const updatedIncident = { ...incident, recordStatus: 'ACTIVE' as const };
            this.incidentsService.update(id, updatedIncident).subscribe({
              next: () => {
                this.loadIncidents();
                this.showSuccessAlert('Incidencia restaurada con éxito.');
              },
              error: (error: any) => {
                console.error('Error restaurando incidencia:', error);
                this.showErrorAlert('Error restaurando incidencia.');
              }
            });
          },
          error: (error: any) => {
            console.error('Error obteniendo incidencia para restaurar:', error);
            this.showErrorAlert('Error obteniendo incidencia para restaurar.');
          }
        });
      }
    });
  }

  getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'LOW': return 'Baja';
      case 'MEDIUM': return 'Media';
      case 'HIGH': return 'Alta';
      case 'CRITICAL': return 'Crítica';
      default: return severity;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'REPORTED': return 'Reportado';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'RESOLVED': return 'Resuelto';
      case 'CLOSED': return 'Cerrado';
      default: return status;
    }
  }

  isNumber(value: any): value is number {
    return typeof value === 'number';
  }

  getIncidentTypeName(typeId: string): string {
    return this.incidentTypes.find(type => type.id === typeId)?.typeName || '-';
  }

  async viewIncidentDetails(incident: Incident): Promise<void> {
    console.log('Viewing details for incident:', incident);
    console.log('Incident Type ID to look up:', incident.incidentTypeId);
    const type = this.incidentTypes.find(t => t.id === incident.incidentTypeId);
    console.log('Found Incident Type object:', type);

    const { IncidentDetailsModalComponent } = await import('../incident-details-modal.component');
    this.dialog.open(
      IncidentDetailsModalComponent,
      {
        width: 'auto',
        maxHeight: '90vh',
        data: {
          ...incident,
          incidentType: type?.typeName || '-',
          estimatedResolutionTime: type?.estimatedResolutionTime || '-',
          priorityLevel: type?.priorityLevel || '-',
        }
      }
    );
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: message,
      confirmButtonColor: '#4CAF50',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container',
        actions: 'swal2-actions',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
        icon: 'swal2-icon'
      }
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#F44336',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container',
        actions: 'swal2-actions',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    });
  }
}