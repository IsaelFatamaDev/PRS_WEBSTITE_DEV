import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { dayliRecors, createDaily_records, UpdateDaily_records, testing_points } from '../../../../../core/models/water-quality.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { organization } from '../../../../../core/models/organization.model';
import { User, UserResponseDTO } from '../../../../../core/models/user.model';
import { UserService } from '../../../../../core/services/user.service';
@Component({
  selector: 'app-chlorine-form',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './chlorine-form.component.html',
  styleUrl: './chlorine-form.component.css'
})
export class ChlorineFormComponent implements OnInit {
  chlorineForm: FormGroup;
  isEditMode = false;
  chlorineId: string | null = null;
  loading = false;
  submitting = false;
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  originalFormValue: any = null;
  testingPoints: testing_points[] = [];
  organizations: organization[] = [];
  users: UserResponseDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private qualityService: WaterQualityService,
    private organizationService: OrganizationService,
    private usersService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.chlorineForm = this.createForm();
  }

  ngOnInit(): void {
    this.chlorineId = this.route.snapshot.paramMap.get('id');
    this.loadTestingPoints();
    this.loadOrganizations();
    this.loadUsers();
    if (this.chlorineId) {
      this.isEditMode = true;
      this.loadChlorine();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      organizationId: ['', Validators.required],
      recordType: ['', Validators.required],
      testingPointIds: [[], [Validators.required]],
      recordDate: ['', [Validators.required]],
      level: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      acceptable: [false, Validators.required],
      actionRequired: [false, Validators.required],
      recordedByUserId: ['', [Validators.required]],
      observations: ['', [Validators.required, Validators.minLength(10)]],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.chlorineForm.get(fieldName);
    if (!field) return false;

    // En modo edición, solo validar si el campo ha sido modificado
    if (this.isEditMode) {
      const currentValue = field.value;
      const originalValue = this.originalFormValue?.[fieldName];
      const isModified = JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      
      return isModified && field.invalid && (field.dirty || field.touched);
  }

    return field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.chlorineForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['pattern']) return 'Formato inválido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
    if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}`;

    return 'Campo inválido';
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.chlorineForm.controls).forEach(key => {
      const control = this.chlorineForm.get(key);
      control?.markAsTouched();
    });
  }

  loadOrganizations() {
    this.organizationService.getAllOrganization().subscribe({
      next: (organizations) => {
        console.log('Organizaciones cargados:', organizations);
        this.organizations = organizations;
      },
    });
  }

loadUsers() {
  this.usersService.getAllUsers().subscribe({
    next: (response) => {
      this.users = response;
      console.log('Usuarios cargados:', this.users);
    },
  });
}



  private loadChlorine(): void {
    this.loading = true;
    if (this.chlorineId) {
      this.qualityService.getChlorineById(this.chlorineId).subscribe({
        next: (chlorine) => {
          console.log('Datos cargados del registro:', chlorine);
          this.populateForm(chlorine);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showErrorAlert = true;
          this.errorMessage = 'Error al cargar el registro';
        }
      });
    }
  }

  private populateForm(chlorine: dayliRecors): void {
    const formValue = {
      organizationId: chlorine.organizationId,
      recordType: chlorine.recordType,
      testingPointIds: chlorine.testingPointIds,
      recordDate: chlorine.recordDate,
      level: chlorine.level,
      acceptable: chlorine.acceptable,
      actionRequired: chlorine.actionRequired,
      recordedByUserId: chlorine.recordedByUserId,
      observations: chlorine.observations,
      amount: chlorine.amount
    };

    // Guardar el valor original para comparaciones
    this.originalFormValue = { ...formValue, recordCode: chlorine.recordCode };
    console.log('Valores originales guardados:', this.originalFormValue);
    
    this.chlorineForm.patchValue(formValue);
    console.log('Formulario poblado con valores:', this.chlorineForm.value);
  }

  onSubmit(): void {
    console.log('Formulario actual:', this.chlorineForm.value);
    
    if (this.isEditMode) {
      // En modo edición, validar todos los campos
      if (this.chlorineForm.invalid) {
        this.showErrorAlert = true;
        this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente';
        this.markAllFieldsAsTouched();
        return;
      }

      this.submitting = true;
      this.showErrorAlert = false;

      // Enviar todos los campos del formulario
      const formValues = this.chlorineForm.value;
      console.log('Valores del formulario:', formValues);
      console.log('recordType del formulario:', formValues.recordType);
      
      const chlorineUpdate: UpdateDaily_records = {
        ...formValues,
        recordCode: this.originalFormValue?.recordCode
      };
      console.log('Datos a enviar en la actualización:', chlorineUpdate);
      console.log('recordType en chlorineUpdate:', chlorineUpdate.recordType);

      this.qualityService.updateChlorine(this.chlorineId!, chlorineUpdate).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (error) => {
          console.error('Error en la actualización:', error);
          this.handleError('Error al actualizar el registro');
        }
      });
    } else {
      // En modo creación, validar todos los campos
      if (this.chlorineForm.invalid) {
        this.showErrorAlert = true;
        this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente';
        this.markAllFieldsAsTouched();
        return;
      }

      this.submitting = true;
      this.showErrorAlert = false;

      const chlorineCreate: createDaily_records = { ...this.chlorineForm.value };
      // No incluir recordCode
      console.log('Datos a enviar en la creación:', chlorineCreate);

      this.qualityService.createChlorine(chlorineCreate).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (error) => {
          console.error('Error en la creación:', error);
          this.handleError('Error al crear el registro');
        }
      });
    }
  }

  private validateModifiedFields(modifiedFields: any): boolean {
    let hasErrors = false;
    Object.keys(modifiedFields).forEach(key => {
      const control = this.chlorineForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
        hasErrors = true;
      }
    });
    return hasErrors;
  }

  private getModifiedFields(): any {
    const currentValue = this.chlorineForm.value;
    const modifiedFields: any = {};

    Object.keys(currentValue).forEach(key => {
      const currentFieldValue = currentValue[key];
      const originalFieldValue = this.originalFormValue[key];

      // Solo incluir el campo si su valor ha cambiado y no es null
      if (JSON.stringify(currentFieldValue) !== JSON.stringify(originalFieldValue) && currentFieldValue !== null) {
        modifiedFields[key] = currentFieldValue;
      }
    });

    console.log('Comparación de valores:');
    console.log('Valores actuales:', currentValue);
    console.log('Valores originales:', this.originalFormValue);
    console.log('recordType actual:', currentValue.recordType);
    console.log('recordType original:', this.originalFormValue?.recordType);
    console.log('¿recordType modificado?:', JSON.stringify(currentValue.recordType) !== JSON.stringify(this.originalFormValue?.recordType));
    console.log('Campos modificados finales:', modifiedFields);

    return modifiedFields;
  }

  private handleSuccess(): void {
    this.submitting = false;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.router.navigate(['/admin/water-quality']);
    }, 2000);
  }

  private handleError(message: string): void {
    this.submitting = false;
    this.showErrorAlert = true;
    this.errorMessage = message;
  }

  cancel(): void {
    this.router.navigate(['/admin/water-quality']);
  }

  loadTestingPoints(): void {
    this.qualityService.getAllTestingPoints().subscribe({
      next: (points) => {
        console.log('Puntos de prueba cargados:', points);
        this.testingPoints = points;
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
      }
    });
  }

  isPointSelected(pointId: string): boolean {
    const selectedPoints = this.chlorineForm.get('testingPointIds')?.value || [];
    return selectedPoints.includes(pointId);
  }

  addTestingPoint(pointId: string): void {
    if (!pointId || this.isPointSelected(pointId)) return;
    
    const currentPoints = this.chlorineForm.get('testingPointIds')?.value || [];
    const updatedPoints = [...currentPoints, pointId];
    this.chlorineForm.get('testingPointIds')?.setValue(updatedPoints);
  }

  removeTestingPoint(index: number): void {
    const currentPoints = this.chlorineForm.get('testingPointIds')?.value || [];
    const updatedPoints = currentPoints.filter((_: any, i: number) => i !== index);
    this.chlorineForm.get('testingPointIds')?.setValue(updatedPoints);
  }

  getTestingPointName(pointId: string): string {
    const point = this.testingPoints.find(p => p.id === pointId);
    return point ? point.pointName : pointId;
  }

  getUserNameById(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? (user.fullName ) : userId;
  }
}
