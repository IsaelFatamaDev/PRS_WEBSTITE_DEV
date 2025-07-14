import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityIncident } from '../../../../core/models/water-quality.model';
import { WaterQualityService } from '../../../../core/services/water-quality.service';

@Component({
  selector: 'app-quality-records',
  templateUrl: './quality-records.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class QualityRecordsComponent implements OnInit {
  incidents: QualityIncident[] = [];
  loading = true;
  error: string | null = null;

  filters = {
    incidentType: '',
    severity: '',
    resolved: ''
  };

  constructor(
    private router: Router,
    private waterQualityService: WaterQualityService
  ) {}

  ngOnInit(): void {
    this.loadIncidents();
    
  }

  loadIncidents(): void {
    this.loading = true;
    this.waterQualityService.getAllIncident().subscribe({
      next: (incidents) => {
        this.incidents = this.filterIncidents(incidents);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los incidentes';
        this.loading = false;
        console.error('Error loading incidents:', error);
      }
    });
  }

  filterIncidents(incidents: QualityIncident[]): QualityIncident[] {
    return incidents.filter(incident => {
      if (this.filters.incidentType && incident.incidentType !== this.filters.incidentType) {
        return false;
      }
      if (this.filters.severity && incident.severity !== this.filters.severity) {
        return false;
      }
      if (this.filters.resolved !== '' && incident.resolved !== (this.filters.resolved === 'true')) {
        return false;
      }
      return true;
    });
  }


  viewDetails(id: string): void {
    this.router.navigate(['/admin/water-quality/incidentDetail', id]);
  }

  editIncident(id: string): void {
    this.router.navigate(['/admin/water-quality/incidentEdit', id]);
  }

  addIncident(): void {
    this.router.navigate(['/admin/water-quality/incidentNew']);
  }

  deleteIncident(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar este incidente?')) {
      // Implementar lógica de eliminación cuando esté disponible en el servicio
      console.log('Eliminar incidente:', id);
    }
  }
}