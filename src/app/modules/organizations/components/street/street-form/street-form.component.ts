import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { street, streetCreate, streetUpdate, zones } from '../../../../../core/models/organization.model';
import { OrganizationService } from '../../../../../core/services/organization.service';

@Component({
  selector: 'app-street-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './street-form.component.html',
  styleUrl: './street-form.component.css'
})
export class StreetFormComponent implements OnInit {
  streetForm: FormGroup;
  isEditMode: boolean = false;
  streetId: string = '';
  loading: boolean = false;
  zones: zones[] = [];
  private streetCode: string = '';

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.streetForm = this.fb.group({
      zoneId: ['', Validators.required],
      streetName: ['', [Validators.required, Validators.minLength(3)]],
      streetType: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadZones();
    this.checkEditMode();
  }

  loadZones() {
    this.organizationService.getAllZones().subscribe({
      next: (data) => {
        this.zones = data.filter(z => z.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar zonas', err);
        Swal.fire('Error', 'No se pudieron cargar las zonas', 'error');
      }
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.streetId = id;
      this.loadStreet(id);
    }
  }

  loadStreet(id: string) {
    this.loading = true;
    this.organizationService.getStreetById(id).subscribe({
      next: (street) => {
        this.streetCode = street.streetCode;
        this.streetForm.patchValue({
          zoneId: street.zoneId,
          streetName: street.streetName,
          streetType: street.streetType
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar calle', err);
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar la calle', 'error');
        this.router.navigate(['/super-admin/organizations/street']);
      }
    });
  }

  onSubmit() {
    if (this.streetForm.valid) {
      this.loading = true;
      const formData = this.streetForm.value;

      if (this.isEditMode) {
        const updateData: streetUpdate = {
          zoneId: formData.zoneId,
          streetCode: this.streetCode,
          streetName: formData.streetName,
          streetType: formData.streetType
        };
        this.organizationService.updateStreet(this.streetId, updateData).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire('Éxito', 'Calle actualizada correctamente', 'success').then(() => {
              this.router.navigate(['/super-admin/organizations/street']);
            });
          },
          error: (err) => {
            console.error('Error al actualizar calle', err);
            this.loading = false;
            Swal.fire('Error', 'No se pudo actualizar la calle', 'error');
          }
        });
      } else {
        const createData: streetCreate = {
          zoneId: formData.zoneId,
          streetName: formData.streetName,
          streetType: formData.streetType
        };
        this.organizationService.createStreet(createData).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire('Éxito', 'Calle creada correctamente', 'success').then(() => {
              this.router.navigate(['/super-admin/organizations/street']);
            });
          },
          error: (err) => {
            console.error('Error al crear calle', err);
            this.loading = false;
            Swal.fire('Error', 'No se pudo crear la calle', 'error');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.streetForm.controls).forEach(key => {
      const control = this.streetForm.get(key);
      control?.markAsTouched();
    });
  }

  cancel() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Los cambios no guardados se perderán',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/super-admin/organizations/street']);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.streetForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.streetForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
