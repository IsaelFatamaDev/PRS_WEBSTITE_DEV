import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IncidentTypesService } from '../../services/incident-types.service';
import { IncidentType } from '../../models/complaints-incidents.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-incident-type-form-modal',
  templateUrl: './incident-type-form-modal.component.html',
  styleUrls: ['./incident-type-form-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class IncidentTypeFormModalComponent implements OnInit {
  incidentTypeForm: FormGroup;
  isEditing = false;

  esPriorityLevels = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'CRITICAL', label: 'Crítica' }
  ];

  constructor(
    private fb: FormBuilder,
    private incidentTypeService: IncidentTypesService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<IncidentTypeFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { incidentType: IncidentType | null }
  ) {
    this.incidentTypeForm = this.fb.group({
      typeCode: [this.data.incidentType?.typeCode || '', Validators.required],
      typeName: [this.data.incidentType?.typeName || '', Validators.required],
      description: [this.data.incidentType?.description || '', Validators.required],
      priorityLevel: [this.data.incidentType?.priorityLevel || 'MEDIUM', Validators.required],
      estimatedResolutionTime: [this.data.incidentType?.estimatedResolutionTime || 24, [Validators.required, Validators.min(1)]],
      requiresExternalService: [this.data.incidentType?.requiresExternalService || false]
    });

    if (this.data && this.data.incidentType) {
      this.isEditing = true;
    }
  }

  ngOnInit(): void {
    if (!this.isEditing) {
      this.generateNextTypeCode();
    }

    this.incidentTypeForm.get('priorityLevel')?.valueChanges.subscribe(priority => {
      let estimatedTime = 0;
      switch (priority) {
        case 'LOW':
          estimatedTime = 78;
          break;
        case 'MEDIUM':
          estimatedTime = 48;
          break;
        case 'HIGH':
          estimatedTime = 24;
          break;
        case 'CRITICAL':
          estimatedTime = 6;
          break;
        default:
          estimatedTime = 24; // Default value if priority is not recognized
      }
      this.incidentTypeForm.get('estimatedResolutionTime')?.setValue(estimatedTime);
    });
  }

  private generateNextTypeCode(): void {
    this.incidentTypeService.getAll().subscribe({
      next: (types) => {
        const codes = types
          .map(t => t.typeCode)
          .filter(code => /^INC\d{3}$/i.test(code));
        let max = 0;
        codes.forEach(code => {
          const num = parseInt(code.replace(/INC/i, ''), 10);
          if (num > max) max = num;
        });
        const nextCode = 'INC' + (max + 1).toString().padStart(3, '0');
        this.incidentTypeForm.get('typeCode')?.setValue(nextCode);
        console.log('Código de tipo de incidencia generado:', nextCode);
      },
      error: (error: any) => {
        console.error('Error generando código de tipo de incidencia:', error);
        this.incidentTypeForm.get('typeCode')?.setValue('INC001'); // Fallback
      }
    });
  }

  onSubmit(): void {
    if (this.incidentTypeForm.invalid) {
      this.incidentTypeForm.markAllAsTouched();
      return;
    }

    let incidentTypeData: Partial<IncidentType> = this.incidentTypeForm.value;

    if (this.isEditing) {
      incidentTypeData.status = this.data.incidentType!.status;
      this.incidentTypeService.update(this.data.incidentType!.id!, incidentTypeData as IncidentType).subscribe({
        next: (updatedIncidentType) => {
          this.showMessage('Tipo de incidencia actualizado correctamente');
          this.dialogRef.close(updatedIncidentType);
        },
        error: (error: any) => {
          this.showMessage('Error al actualizar el tipo de incidencia');
          console.error('Error updating incident type:', error);
        }
      });
    } else {
      incidentTypeData.status = 'ACTIVE';
      this.incidentTypeService.create(incidentTypeData as IncidentType).subscribe({
        next: (newIncidentType) => {
          this.showMessage('Tipo de incidencia creado correctamente');
          this.dialogRef.close(newIncidentType);
        },
        error: (error: any) => {
          this.showMessage('Error al crear el tipo de incidencia');
          console.error('Error creating incident type:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}