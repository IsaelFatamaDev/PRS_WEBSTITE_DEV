import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';
import { organization, zonesUpdate, zonesCreate } from '../../../../../core/models/organization.model';
import { OrganizationService } from '../../../../../core/services/organization.service';

@Component({
  selector: 'app-zone-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './zone-form.component.html',
  styleUrl: './zone-form.component.css'
})
export class ZoneFormComponent implements OnInit {
  zoneForm: FormGroup;
  isEditMode: boolean = false;
  zoneId: string = '';
  loading: boolean = false;
  organizations: organization[] = [];

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.zoneForm = this.fb.group({
      organizationId: ['', Validators.required],
      zoneName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.checkEditMode();
  }

  loadOrganizations() {
    this.organizationService.getAllOrganization().subscribe({
      next: (data) => {
        this.organizations = data.filter(org => org.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar organizaciones', err);
        Swal.fire('Error', 'No se pudieron cargar las organizaciones', 'error');
      }
    });
  }

  getNameOrganization(organizationId:string): string{
    const organizacion = this.organizations.find(o =>o.organizationId === organizationId);
    return organizacion?organizacion.organizationName:organizationId;
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.zoneId = id;
      this.loadZone(id);
    }
  }

  loadZone(id: string) {
    this.loading = true;
    this.organizationService.getZoneById(id).subscribe({
      next: (zone) => {
        this.zoneForm.patchValue({
          organizationId: zone.organizationId,
          zoneCode: zone.zoneCode,
          zoneName: zone.zoneName,
          description: zone.description
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar zona', err);
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar la zona', 'error');
        this.router.navigate(['/super-admin/zones']);
      }
    });
  }

  onSubmit() {
    if (this.zoneForm.valid) {
      this.loading = true;
      const formData = this.zoneForm.value;

      if (this.isEditMode) {
        const updateData: zonesUpdate = {
          organizationId: formData.organizationId,
          zoneCode: formData.zoneCode,
          zoneName: formData.zoneName,
          description: formData.description
        };

        this.organizationService.updateZones(this.zoneId, updateData).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire('Éxito', 'Zona actualizada correctamente', 'success').then(() => {
              this.router.navigate(['/super-admin/organizations/zonas']);
            });
          },
          error: (err) => {
            console.error('Error al actualizar zona', err);
            this.loading = false;
            Swal.fire('Error', 'No se pudo actualizar la zona', 'error');
          }
        });
      } else {
        const createData: zonesCreate = {
          organizationId: formData.organizationId,
          zoneName: formData.zoneName,
          description: formData.description
        };

        this.organizationService.createZones(createData).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire('Éxito', 'Zona creada correctamente', 'success').then(() => {
              this.router.navigate(['/super-admin/organizations/zonas']);
            });
          },
          error: (err) => {
            console.error('Error al crear zona', err);
            this.loading = false;
            Swal.fire('Error', 'No se pudo crear la zona', 'error');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.zoneForm.controls).forEach(key => {
      const control = this.zoneForm.get(key);
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
        this.router.navigate(['/super-admin/organizations/zonas']);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.zoneForm.get(fieldName);
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
    const field = this.zoneForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
} 