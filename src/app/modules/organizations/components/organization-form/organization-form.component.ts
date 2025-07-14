import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization.service';
import { CommonModule } from '@angular/common';
import { organization, Status } from '../../../../core/models/organization.model';

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.css'
})
export class OrganizationFormComponent implements OnInit {
  organizationForm: FormGroup;
  isEditMode: boolean = false;
  organizationId: string | null = null;
  loading: boolean = false;
  submitting = false;
  showSuccessAlert = false;
  showErrorAlert = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  showAlert = false;

  // Opciones para selects
  statuses = Object.values(Status);

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.organizationForm = this.fb.group({
      organizationCode:['',Validators.required],
      organizationName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      legalRepresentative: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    });
  }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.organizationId;

    if (this.isEditMode && this.organizationId) {
      this.loadOrganization(this.organizationId);
    }
  }

  loadOrganization(id: string): void {
    this.loading = true;
    this.organizationService.getOrganizationById(id).subscribe({
      next: (organization) => {
        if (organization) {
          this.populateForm(organization);
        } else {
          this.showAlertMessage('Organización no encontrada', 'error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar la organización:', error);
        this.showAlertMessage('Error al cargar la organización', 'error');
        this.loading = false;
      }
    });
  }

  populateForm(organization: organization): void {
    if (!organization) {
      console.error('No se recibió una organización válida');
      return;
    }

    this.organizationForm.patchValue({
      organizationCode:organization.organizationCode ||'',
      organizationName: organization.organizationName || '',
      legalRepresentative: organization.legalRepresentative || '',
      address: organization.address || '',
      phone: organization.phone || '',
    });
  }

  onSubmit(): void {
    if (this.organizationForm.valid) {
      const formData = this.organizationForm.value;
      const { status, ...organizationData } = formData;

      console.log('Datos del formulario:', formData);
      console.log('Datos a enviar:', organizationData);

      if (this.isEditMode && this.organizationId) {
        this.organizationService.updateOrganization(this.organizationId, organizationData).subscribe({
          next: (response) => {
            console.log('Respuesta de actualización:', response);
            this.showAlertMessage('Organización actualizada correctamente', 'success');
            setTimeout(() => {
              this.router.navigate(['/super-admin/organizations']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error al actualizar la organización:', error);
            this.showAlertMessage('Error al actualizar la organización', 'error');
      }
        });
      } else {
        this.organizationService.createOrganization(organizationData).subscribe({
          next: (response) => {
            console.log('Respuesta de creación:', response);
            this.showAlertMessage('Organización creada correctamente', 'success');
            setTimeout(() => {
              this.router.navigate(['/super-admin/organizations']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error al crear la organización:', error);
            this.showAlertMessage('Error al crear la organización', 'error');
  }
        });
      }
    } else {
      this.markFormGroupTouched(this.organizationForm);
      console.log('Formulario inválido:', this.organizationForm.errors);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    // Solo redirigir si es un error y no estamos en modo edición
    if (type === 'error' && !this.isEditMode) {
      setTimeout(() => {
        this.router.navigate(['/admin/organizations']);
      }, 2000);
    }
  }

  dismissAlert(): void {
    this.showSuccessAlert = false;
    this.showErrorAlert = false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.organizationForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control.hasError('pattern')) {
      switch (controlName) {
        case 'organizationName':
        case 'legalRepresentative':
          return 'Solo se permiten letras y espacios';
        case 'phone':
          return 'El teléfono debe tener 9 dígitos y comenzar con 9';
        default:
          return 'Formato inválido';
    }
    }

    return '';
  }

  onNameInput(event: any, fieldName: string): void {
    const value = event.target.value;
    // Eliminar números y símbolos, permitir letras, espacios y caracteres especiales del español
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    this.organizationForm.get(fieldName)?.setValue(cleanValue);
  }

  onPhoneInput(event: any): void {
    const value = event.target.value;
    // Solo números y limitar a 9 caracteres
    const numericValue = value.replace(/[^0-9]/g, '');
    event.target.value = numericValue.slice(0, 9);
  }

  // Métodos para validación y errores
  isFieldInvalid(field: string): boolean {
    const control = this.organizationForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cancel(): void {
    this.router.navigate(['/super-admin/organizations']);
  }


}

