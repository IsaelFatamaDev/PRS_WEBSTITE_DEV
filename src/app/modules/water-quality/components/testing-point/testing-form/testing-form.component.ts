import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { testing_points, PointType, Status } from '../../../../../core/models/water-quality.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { organization, zones } from '../../../../../core/models/organization.model';

@Component({
  selector: 'app-testing-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './testing-form.component.html',
  styleUrl: './testing-form.component.css'
})
export class TestingFormComponent implements OnInit {
  pointForm!: FormGroup;
  isEditMode = false;
  pointId: string = '';
  loading = false;
  isSubmitting = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'info' = 'info';
  alertMessage = '';
  originalValues: any = {};
  zones: zones[] = [];
  organizations: organization[] = [];
  constructor(
    private fb: FormBuilder,
    private waterQualityService: WaterQualityService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.loadOrganizations();
    this.loadZones();
  }

  private initForm(): void {
    this.pointForm = this.fb.group({
      pointName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      pointType: ['', [Validators.required]],
      organizationId: ['', [Validators.required]],
      zoneId: ['', [Validators.required]],
      locationDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]]
    });
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.pointId = params['id'];
        this.loadPoint();
      }
    });
  }

  private loadPoint(): void {
    this.loading = true;
    this.waterQualityService.getPointstById(this.pointId).subscribe({
      next: (point) => {
        this.populateForm(point);
        this.originalValues = { ...point };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el punto de prueba:', error);
        this.showErrorAlert('Error al cargar el punto de prueba');
        this.loading = false;
      }
    });
  } 

  loadZones(): void {
    this.organizationService.getAllZones().subscribe({
      next: (zones) => {
        this.zones = zones;
      }
    });
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganization().subscribe({
      next: (organizations) => {
        this.organizations = organizations;
      }
    });
  }

  

  private populateForm(point: testing_points): void {
    this.pointForm.patchValue({
      pointName: point.pointName,
      pointType: point.pointType,
      organizationId: point.organizationId,
      zoneId: point.zoneId,
      locationDescription: point.locationDescription,
      latitude: point.coordinates.latitude,
      longitude: point.coordinates.longitude
    });
  }

  onSubmit(): void {
    if (this.pointForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.prepareFormData();
      
      if (this.isEditMode) {
        this.updatePoint(formData);
      } else {
        this.createPoint(formData);
      }
    } else {
      this.markFormGroupTouched();
      this.showErrorAlert('Por favor, complete todos los campos requeridos correctamente');
    }
  }

  private prepareFormData(): any {
    const formValue = this.pointForm.value;
    
    const baseData = {
      pointName: formValue.pointName,
      pointType: formValue.pointType,
      organizationId: formValue.organizationId,
      zoneId: formValue.zoneId,
      locationDescription: formValue.locationDescription,
      coordinates: {
        latitude: Number(formValue.latitude),
        longitude: Number(formValue.longitude)
      }
    };

    if (this.isEditMode && this.originalValues.pointCode) {
      return {
        ...baseData,
        pointCode: this.originalValues.pointCode
      };
    }

    return baseData;
  }

  private createPoint(pointData: any): void {
    this.waterQualityService.createTestingPoint(pointData).subscribe({
      next: () => {
        this.showSuccessAlert('Punto de prueba creado exitosamente');
        setTimeout(() => {
          this.router.navigate(['/admin/water-quality/testing']);
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error al crear el punto de prueba:', error);
        this.showErrorAlert('Error al crear el punto de prueba');
        this.isSubmitting = false;
      }
    });
  }

  private updatePoint(pointData: any): void {
    this.waterQualityService.updateTestingPoint(this.pointId, pointData).subscribe({
      next: () => {
        this.showSuccessAlert('Punto de prueba actualizado exitosamente');
        setTimeout(() => {
          this.router.navigate(['/admin/water-quality/testing']);
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error al actualizar el punto de prueba:', error);
        this.showErrorAlert('Error al actualizar el punto de prueba');
        this.isSubmitting = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pointForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.pointForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
    }
    return 'Campo inválido';
  }

  isFormValid(): boolean {
    return this.pointForm.valid;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.pointForm.controls).forEach(key => {
      const control = this.pointForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/water-quality/testing-points']);
  }

  showSuccessAlert(message: string): void {
    this.alertType = 'success';
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.dismissAlert(), 5000);
  }

  showErrorAlert(message: string): void {
    this.alertType = 'error';
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.dismissAlert(), 5000);
  }

  showInfoAlert(message: string): void {
    this.alertType = 'info';
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.dismissAlert(), 5000);
  }

  dismissAlert(): void {
    this.showAlert = false;
  }
}
