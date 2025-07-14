import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QualityIncidentCreateRequest, QualityIncidentUpdateRequest, testing_points } from '../../../../../core/models/water-quality.model';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';

@Component({
  selector: 'app-quality-form',
  templateUrl: './quality-form.component.html',
  imports: [ReactiveFormsModule, CommonModule],
})
export class QualityFormComponent implements OnInit {
  incidentForm: FormGroup;
  isEditMode = false;
  incidentId: string | null = null;
  loading = false;
  error: string | null = null;
  testingPoints: testing_points[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private waterQualityService: WaterQualityService
  ) {
    this.incidentForm = this.fb.group({
      incidentCode: ['', [Validators.required]],
      incidentType: ['', [Validators.required]],
      severity: ['', [Validators.required]],
      detectionDate: ['', [Validators.required]],
      resolutionDate: [''],
      resolved: [false],
      description: ['', [Validators.required]],
      affectedZones: ['', [Validators.required]],
      immediateActions: ['', [Validators.required]],
      correctiveActions: ['', [Validators.required]],
      testingPointId: [''],
      reportedByUserId: [''],
      resolvedByUserId: ['']
    });
  }

  ngOnInit(): void {
    this.loadTestingPoints();
  }

  loadIncident(id: string): void {
    this.loading = true;
    this.waterQualityService.getIncidentById(id).subscribe({
      next: (incident) => {
        this.incidentForm.patchValue({
          ...incident,
          detectionDate: this.formatDateForInput(incident.detectionDate),
          resolutionDate: incident.resolutionDate ? this.formatDateForInput(incident.resolutionDate) : '',
          affectedZones: incident.affectedZones.join(', ')
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el incidente';
        this.loading = false;
        console.error('Error loading incident:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.incidentForm.valid) {
      const formValue = this.incidentForm.value;
      const incidentData = {
        ...formValue,
        affectedZones: formValue.affectedZones.split(',').map((zone: string) => zone.trim())
      };

      if (this.isEditMode && this.incidentId) {
        this.updateIncident(this.incidentId, incidentData);
      } else {
        this.createIncident(incidentData);
      }
    }
  }

  createIncident(incidentData: QualityIncidentCreateRequest): void {
    this.loading = true;
    this.waterQualityService.createIncident(incidentData).subscribe({
      next: () => {
        this.router.navigate(['/admin/water-quality/incident']);
      },
      error: (error) => {
        this.error = 'Error al crear el incidente';
        this.loading = false;
        console.error('Error creating incident:', error);
      }
    });
  }

  updateIncident(id: string, incidentData: QualityIncidentUpdateRequest): void {
    this.loading = true;
    this.waterQualityService.updateIncident(id, incidentData).subscribe({
      next: () => {
        this.router.navigate(['/admin/water-quality/incident']);
      },
      error: (error) => {
        this.error = 'Error al actualizar el incidente';
        this.loading = false;
        console.error('Error updating incident:', error);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.incidentForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.incidentForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      // Agregar más validaciones según sea necesario
    }
    return '';
  }

  formatDateForInput(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  goBack(): void {
    this.router.navigate(['/admin/water-quality/incident']);
  }

  loadTestingPoints(): void {
    this.waterQualityService.getAllTestingPoints().subscribe({
      next: (points) => {
        console.log('Puntos de prueba cargados:', points);
        this.testingPoints = points;
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
      }
    });
  }
}
