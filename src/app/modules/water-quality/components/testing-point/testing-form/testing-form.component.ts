import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { testing_points, PointType, Status } from '../../../../../core/models/water-quality.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { OrganizationResolverService } from '../../../../../core/services/organization-resolver.service';
import { AuthService } from '../../../../../core/services/auth.service';
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
  organizationName: string = '';
  currentUserOrganizationId: string | null = null;
  constructor(
    private fb: FormBuilder,
    private waterQualityService: WaterQualityService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private organizationResolver: OrganizationResolverService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setCurrentUserOrganization();
    this.initForm();
    this.checkEditMode();
    this.loadOrganizations();
    this.loadZones();
  }

  private setCurrentUserOrganization(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.organizationId) {
      this.currentUserOrganizationId = currentUser.organizationId;
      
      // Obtener el nombre real de la organización
      this.organizationResolver.getOrganizationName(this.currentUserOrganizationId).subscribe({
        next: (organizationName) => {
          this.organizationName = organizationName;
          console.log('Nombre de organización cargado:', this.organizationName);
        },
        error: (error) => {
          console.error('Error al cargar nombre de organización:', error);
          this.organizationName = `Organización ${this.currentUserOrganizationId}`;
        }
      });
      
      console.log('Organización del usuario:', this.currentUserOrganizationId);
    } else {
      console.error('Usuario no tiene organización asignada');
      this.router.navigate(['/unauthorized']);
    }
  }

  private initForm(): void {
    this.pointForm = this.fb.group({
      pointName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      pointType: ['', [Validators.required]],
      organizationId: [this.currentUserOrganizationId || '', [Validators.required]],
      zoneId: ['', [Validators.required]],
      locationDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]]
    });

    // Deshabilitar el campo de organización ya que no es editable
    if (this.currentUserOrganizationId) {
      this.pointForm.get('organizationId')?.disable();
    }
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
    if (this.currentUserOrganizationId) {
      this.organizationService.getAllZones().subscribe({
        next: (zones) => {
          // Filtrar solo las zonas de la organización del usuario
          this.zones = zones.filter(zone => zone.organizationId === this.currentUserOrganizationId);
        }
      });
    }
  }

  loadOrganizations(): void {
    // No es necesario cargar todas las organizaciones ya que solo se muestra la del usuario
    // Se mantiene el método por compatibilidad pero no hace nada
  }

  

  private populateForm(point: testing_points): void {
    this.pointForm.patchValue({
      pointName: point.pointName,
      pointType: point.pointType,
      organizationId: this.currentUserOrganizationId, // Usar la organización del usuario logueado
      zoneId: point.zoneId,
      locationDescription: point.locationDescription,
      latitude: point.coordinates.latitude,
      longitude: point.coordinates.longitude
    });

    // Asegurar que la organización esté deshabilitada
    this.pointForm.get('organizationId')?.disable();
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
      organizationId: this.currentUserOrganizationId, // Usar la organización del usuario logueado
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
