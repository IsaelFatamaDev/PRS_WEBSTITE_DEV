import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

import { IncidentResolution } from '../../../models/complaints-incidents.models';
import { IncidentResolutionsService } from '../../../services/incident-resolutions.service';

@Component({
  selector: 'app-incident-resolution-form-modal',
  templateUrl: './incident-resolution-form-modal.component.html',
  styleUrls: ['./incident-resolution-form-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule
  ]
})
export class IncidentResolutionFormModalComponent implements OnInit {
  resolutionForm: FormGroup;
  isEditing = false;
  
  constructor(
    private fb: FormBuilder,
    private resolutionService: IncidentResolutionsService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<IncidentResolutionFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { resolution: IncidentResolution | null }
  ) {
    this.isEditing = !!this.data.resolution;
    
    // Procesar la fecha de resolución para asegurar que sea válida
    let resolutionDateFormatted = '';
    if (this.data.resolution && this.data.resolution.resolutionDate) {
      try {
        if (typeof this.data.resolution.resolutionDate === 'number' && this.data.resolution.resolutionDate > 0) {
          resolutionDateFormatted = formatDate(this.data.resolution.resolutionDate, 'yyyy-MM-dd', 'en-US');
        } else {
          console.warn('Fecha de resolución inválida:', this.data.resolution.resolutionDate);
          resolutionDateFormatted = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
        }
      } catch (error: any) {
        console.error('Error al formatear la fecha de resolución:', error);
        resolutionDateFormatted = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
      }
    }
    
    this.resolutionForm = this.fb.group({
      incidentId: [this.data.resolution?.incidentId || '', Validators.required],
      resolutionDate: [resolutionDateFormatted, Validators.required],
      resolutionType: [this.data.resolution?.resolutionType || '', Validators.required],
      actionsTaken: [this.data.resolution?.actionsTaken || '', Validators.required],
      materialsUsed: this.fb.array([]),
      laborHours: [this.data.resolution?.laborHours || 0, [Validators.required, Validators.min(0)]],
      totalCost: [this.data.resolution?.totalCost || 0, [Validators.required, Validators.min(0)]],
      resolvedByUserId: [this.data.resolution?.resolvedByUserId || '', Validators.required],
      qualityCheck: [this.data.resolution?.qualityCheck || false],
      followUpRequired: [this.data.resolution?.followUpRequired || false],
      resolutionNotes: [this.data.resolution?.resolutionNotes || '']
    });
  }

  ngOnInit(): void {
    if (this.isEditing && this.data.resolution) {
      this.data.resolution.materialsUsed.forEach((material: { productId: string, quantity: number, unit: string }) => {
        this.materialsUsed.push(this.fb.group(material));
      });
    }
  }

  get materialsUsed(): FormArray {
    return this.resolutionForm.get('materialsUsed') as FormArray;
  }

  newMaterial(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required]
    });
  }

  addMaterial(): void {
    this.materialsUsed.push(this.newMaterial());
  }

  removeMaterial(index: number): void {
    this.materialsUsed.removeAt(index);
  }

  onSubmit(): void {
    if (this.resolutionForm.invalid) {
      this.resolutionForm.markAllAsTouched();
      this.showMessage('Por favor, complete todos los campos requeridos.');
      return;
    }

    const formValue = this.resolutionForm.value;
    
    // Convertir la fecha de resolución a timestamp
    let resolutionTimestamp: number;
    try {
      const dateObj = new Date(formValue.resolutionDate);
      if (!isNaN(dateObj.getTime())) {
        resolutionTimestamp = dateObj.getTime();
      } else {
        console.warn('Fecha de resolución inválida al enviar el formulario:', formValue.resolutionDate);
        resolutionTimestamp = new Date().getTime();
      }
    } catch (error: any) {
      console.error('Error al convertir la fecha de resolución a timestamp:', error);
      resolutionTimestamp = new Date().getTime();
    }
    
    const resolutionData: IncidentResolution = {
      ...formValue,
      resolutionDate: resolutionTimestamp
    };
    
    if (this.isEditing) {
      this.resolutionService.update(this.data.resolution!.id!, resolutionData).subscribe({
        next: (response) => {
          this.showMessage('Resolución actualizada correctamente');
          this.dialogRef.close(response);
        },
        error: (error: any) => this.showMessage('Error al actualizar la resolución: ' + error.message)
      });
    } else {
      this.resolutionService.create(resolutionData).subscribe({
        next: (response) => {
          this.showMessage('Resolución creada correctamente');
          this.dialogRef.close(response);
        },
        error: (error: any) => this.showMessage('Error al crear la resolución: ' + error.message)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}