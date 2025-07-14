import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Inject } from '@angular/core';
import Swal from 'sweetalert2';
import { of, Observable, throwError } from 'rxjs';
import { concatMap, catchError } from 'rxjs/operators';

import { Incident, IncidentType, IncidentResolution } from '../../models/complaints-incidents.models';
import { IncidentsService } from '../../services/incidents.service';
import { IncidentTypesService } from '../../services/incident-types.service';
import { IncidentResolutionsService } from '../../services/incident-resolutions.service';

@Component({
  selector: 'app-incident-form-modal',
  templateUrl: './incident-form-modal.component.html',
  styleUrls: ['./incident-form-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ]
})
export class IncidentFormModalComponent implements OnInit {
  incidentForm: FormGroup;
  resolutionForm: FormGroup;
  incidentTypes: IncidentType[] = [];
  isEditing = false;
  isLoadingTypes = true;
  showResolutionDetails = false;

  severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  incidentCategories = ['GENERAL', 'CALIDAD', 'DISTRIBUCION'];

  esSeverity = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'CRITICAL', label: 'Crítica' }
  ];

  constructor(
    private fb: FormBuilder,
    private incidentsService: IncidentsService,
    private incidentTypesService: IncidentTypesService,
    private resolutionService: IncidentResolutionsService,
    public dialogRef: MatDialogRef<IncidentFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { incident: Incident | null }
  ) {
    this.isEditing = !!data.incident;

    this.incidentForm = this.fb.group({
      incidentCode: ['', Validators.required],
      incidentCategory: ['', Validators.required],
      incidentDate: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      severity: ['', Validators.required],
      status: ['REPORTED', Validators.required],
      organizationId: ['', Validators.required],
      incidentTypeId: ['', Validators.required],
      zoneId: [''],
      affectedBoxesCount: [0],
      reportedByUserId: [''],
      assignedToUserId: [''],
      resolved: [false]
    });

    this.resolutionForm = this.fb.group({
      incidentId: [''],
      resolutionDate: [formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), Validators.required],
      resolutionType: ['', Validators.required],
      actionsTaken: ['', Validators.required],
      materialsUsed: this.fb.array([]),
      laborHours: [0, [Validators.required, Validators.min(0)]],
      totalCost: [0, [Validators.required, Validators.min(0)]],
      resolvedByUserId: ['', Validators.required],
      qualityCheck: [false],
      followUpRequired: [false],
      resolutionNotes: ['']
    });

    if (this.isEditing && this.data.incident) {
      const incident = this.data.incident;
      // Procesar la fecha del incidente para asegurar que sea válida
      let incidentDateFormatted;
      try {
        if (incident.incidentDate) {
          const dateObj = new Date(incident.incidentDate);
          if (!isNaN(dateObj.getTime())) {
            incidentDateFormatted = this.formatDateInput(dateObj);
          } else {
            console.warn('Fecha de incidente inválida al cargar para edición:', incident.incidentDate);
            incidentDateFormatted = this.formatDateInput(new Date());
          }
        } else {
          console.warn('Fecha de incidente no proporcionada al cargar para edición');
          incidentDateFormatted = this.formatDateInput(new Date());
        }
      } catch (error) {
        console.error('Error al procesar fecha de incidente para edición:', error);
        incidentDateFormatted = this.formatDateInput(new Date());
      }

      this.incidentForm.patchValue({
        incidentCategory: incident.incidentCategory,
        incidentDate: incidentDateFormatted,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        organizationId: incident.organizationId,
        incidentCode: incident.incidentCode,
        incidentTypeId: incident.incidentTypeId,
        zoneId: incident.zoneId || '',
        affectedBoxesCount: incident.affectedBoxesCount || 0,
        reportedByUserId: incident.reportedByUserId || '',
        assignedToUserId: incident.assignedToUserId || '',
        resolved: incident.resolved || false
      });

      // Load resolution details if the incident is marked as resolved
      if (incident.id && incident.resolved) {
        this.resolutionService.getAll().subscribe({
          next: (allResolutions: IncidentResolution[]) => {
            const foundResolution = allResolutions.find((res: IncidentResolution) => res.incidentId === incident.id);
            if (foundResolution) {
              this.showResolutionDetails = true;
              // Procesar la fecha de resolución para asegurar que sea válida
              let resolutionDateFormatted;
              try {
                if (foundResolution.resolutionDate) {
                  const dateObj = new Date(foundResolution.resolutionDate);
                  if (!isNaN(dateObj.getTime())) {
                    resolutionDateFormatted = this.formatDateInput(dateObj);
                  } else {
                    console.warn('Fecha de resolución inválida al cargar para edición:', foundResolution.resolutionDate);
                    resolutionDateFormatted = this.formatDateInput(new Date());
                  }
                } else {
                  console.warn('Fecha de resolución no proporcionada al cargar para edición');
                  resolutionDateFormatted = this.formatDateInput(new Date());
                }
              } catch (error: any) {
                console.error('Error al procesar fecha de resolución para edición:', error);
                resolutionDateFormatted = this.formatDateInput(new Date());
              }

              this.resolutionForm.patchValue({
                incidentId: foundResolution.incidentId,
                resolutionDate: resolutionDateFormatted,
                resolutionType: foundResolution.resolutionType,
                actionsTaken: foundResolution.actionsTaken,
                laborHours: foundResolution.laborHours,
                totalCost: foundResolution.totalCost,
                resolvedByUserId: foundResolution.resolvedByUserId,
                qualityCheck: foundResolution.qualityCheck,
                followUpRequired: foundResolution.followUpRequired,
                resolutionNotes: foundResolution.resolutionNotes
              });

              // Clear existing materials and add loaded ones
              this.materialsUsed.clear();
              foundResolution.materialsUsed?.forEach((material: { productId: string, quantity: number, unit: string }) => {
                this.materialsUsed.push(this.fb.group({
                  productId: [material.productId, Validators.required],
                  quantity: [material.quantity, [Validators.required, Validators.min(1)]],
                  unit: [material.unit, Validators.required]
                }));
              });
            } else {
              console.warn('No resolution found for incident:', incident.id);
            }
          },
          error: (error: any) => {
            console.error('Error loading all resolutions:', error);
          }
        });
      }

    } else {
      this.incidentForm.patchValue({
        organizationId: '',
        reportedByUserId: '',
        zoneId: '',
        incidentCode: 'INC001',
        incidentCategory: 'DISTRIBUCION',
        severity: 'HIGH',
        status: 'REPORTED',
        incidentDate: this.formatDateInput(new Date())
      });
      this.generateNextIncidentCode();
    }
  }

  ngOnInit(): void {
    this.loadIncidentTypes();

    this.incidentForm.get('severity')?.valueChanges.subscribe(sev => {
      let hours = 72;
      if (sev === 'MEDIUM') hours = 48;
      if (sev === 'HIGH') hours = 24;
      if (sev === 'CRITICAL') hours = 12;
    });

    this.incidentForm.get('incidentTypeId')?.valueChanges.subscribe(typeId => {
      if (typeId) {
        const selectedType = this.incidentTypes.find(type => type.id === typeId);
        if (selectedType) {
          this.incidentForm.get('severity')?.setValue(selectedType.priorityLevel);
          console.log('Tipo de incidencia seleccionado:', selectedType);
        } else {
          console.warn('Tipo de incidencia no encontrado en la colección incident_type:', typeId);
        }
      }
    });
  }

  toggleResolutionDetails(): void {
    this.showResolutionDetails = !this.showResolutionDetails;
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

  private generateNextIncidentCode(): void {
    this.incidentsService.getAll().subscribe({
      next: (incidents) => {
        const codes = incidents
          .map(i => i.incidentCode)
          .filter(code => /^INC\d{3}$/i.test(code));
        let max = 0;
        codes.forEach(code => {
          const num = parseInt(code.replace(/INC/i, ''), 10);
          if (num > max) max = num;
        });
        const nextCode = 'INC' + (max + 1).toString().padStart(3, '0');
        this.incidentForm.get('incidentCode')?.setValue(nextCode);
        console.log('Código de incidencia generado:', nextCode);
      },
      error: (error) => {
        console.error('Error generando código de incidencia:', error);
        this.incidentForm.get('incidentCode')?.setValue('INC001');
      }
    });
  }

  loadIncidentTypes(): void {
    this.isLoadingTypes = true;
    console.log('Cargando todos los tipos de incidencias (sin filtrar por estado)...');
    this.incidentTypesService.getAll().subscribe({
      next: (types) => {
        console.log('Tipos de incidencias cargados:', types);
        this.incidentTypes = types;
        this.isLoadingTypes = false;
      },
      error: (error) => {
        console.error('Error cargando tipos de incidencias:', error);
        this.showErrorAlert('Error cargando tipos de incidencias');
        this.isLoadingTypes = false;
      }
    });
  }

  private toISOStringLocal(dateStr: string): string | undefined {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toISOString();
  }

  onButtonClick(): void {
    console.log('=== Botón clickeado ===');
    console.log('Formulario de incidencia válido:', this.incidentForm.valid);
    console.log('Errores del formulario de incidencia:', this.incidentForm.errors);
    console.log('Valores del formulario de incidencia:', this.incidentForm.value);

    if (this.showResolutionDetails) {
        console.log('Resolución mostrada. Formulario de resolución válido:', this.resolutionForm.valid);
        console.log('Errores del formulario de resolución:', this.resolutionForm.errors);
        console.log('Valores del formulario de resolución:', this.resolutionForm.value);
    }
    
    // Check main incident form validity
    if (this.incidentForm.invalid) {
      this.incidentForm.markAllAsTouched();
      this.showErrorAlert('Por favor, complete todos los campos requeridos de la incidencia.');
      return;
    }

    // Check resolution form validity if visible
    if (this.showResolutionDetails && this.resolutionForm.invalid) {
      this.resolutionForm.markAllAsTouched();
      this.showErrorAlert('Por favor, complete todos los campos requeridos de la resolución.');
      
      // Detailed logging for resolution form errors
      console.error('=== Errores detallados del formulario de resolución ===');
      console.error('Resolution Form overall errors:', this.resolutionForm.errors);
      Object.keys(this.resolutionForm.controls).forEach(key => {
        const control = this.resolutionForm.get(key);
        console.error(`${key}:`, {
          valid: control?.valid,
          errors: control?.errors,
          value: control?.value
        });
      });
      console.trace('Error triggered from resolution form validation');
      return;
    }

    this.onSubmit(); // If all forms are valid, proceed to submit
  }

  onSubmit(): void {
    console.log('=== onSubmit iniciado ===');
    console.log('Formulario de incidencia válido:', this.incidentForm.valid);
    console.log('Errores del formulario de incidencia:', this.incidentForm.errors);
    console.log('Valores del formulario de incidencia:', this.incidentForm.value);

    // This check is already done in onButtonClick, but as a safeguard:
    if (this.incidentForm.invalid) {
      this.incidentForm.markAllAsTouched();
      this.showErrorAlert('Por favor, complete todos los campos requeridos de la incidencia.');
      return;
    }

    // This check is already done in onButtonClick, but as a safeguard:
    if (this.showResolutionDetails && this.resolutionForm.invalid) {
      this.resolutionForm.markAllAsTouched();
      this.showErrorAlert('Por favor, complete todos los campos requeridos de la resolución.');
      return;
    }

    const incidentFormValue = this.incidentForm.value;

    // Asegurarse de que la fecha del incidente sea un timestamp válido
    let incidentDateTimestamp;
    if (this.isEditing && this.data.incident?.incidentDate) {
      // If editing, try to use the existing incidentDate first
      incidentDateTimestamp = this.data.incident.incidentDate;
      // If the form's incidentDate is provided and valid, prioritize it
      if (incidentFormValue.incidentDate) {
        const dateObj = new Date(incidentFormValue.incidentDate);
        if (!isNaN(dateObj.getTime())) {
          incidentDateTimestamp = dateObj.getTime();
        } else {
          console.warn('Fecha de incidente inválida en formulario de edición, manteniendo fecha original.');
        }
      }
    } else if (incidentFormValue.incidentDate) {
      // For new incidents or if not editing, use the form's incidentDate
      const dateObj = new Date(incidentFormValue.incidentDate);
      if (!isNaN(dateObj.getTime())) {
        incidentDateTimestamp = dateObj.getTime();
      } else {
        incidentDateTimestamp = Date.now();
        console.warn('Fecha de incidente inválida, usando fecha actual');
      }
    } else {
      // Fallback for new incidents or if no date is provided
      incidentDateTimestamp = Date.now();
      console.warn('No se proporcionó fecha de incidente, usando fecha actual');
    }

    const incidentData: any = {
      incidentCategory: incidentFormValue.incidentCategory,
      incidentDate: incidentDateTimestamp,
      title: incidentFormValue.title,
      description: incidentFormValue.description,
      severity: incidentFormValue.severity,
      status: this.showResolutionDetails && this.resolutionForm.valid ? 'RESOLVED' : incidentFormValue.status,
      organizationId: incidentFormValue.organizationId,
      incidentCode: incidentFormValue.incidentCode,
      incidentTypeId: incidentFormValue.incidentTypeId,
      zoneId: incidentFormValue.zoneId || '',
      affectedBoxesCount: incidentFormValue.affectedBoxesCount || 0,
      reportedByUserId: incidentFormValue.reportedByUserId || '',
      assignedToUserId: incidentFormValue.assignedToUserId || '',
      resolved: this.showResolutionDetails && this.resolutionForm.valid ? true : incidentFormValue.resolved,
      ...(this.isEditing && this.data.incident?.recordStatus && { recordStatus: this.data.incident.recordStatus }),
      ...(this.isEditing && this.data.incident?.createdAt && { createdAt: this.data.incident.createdAt }),
      ...(!this.isEditing && { createdAt: Date.now() })
    };

    console.log('showResolutionDetails:', this.showResolutionDetails);
    console.log('resolutionForm.valid:', this.resolutionForm.valid);
    console.log('incidentData before submission:', incidentData);

    const incidentObservable = this.isEditing && this.data.incident?.id
      ? this.incidentsService.update(this.data.incident.id, incidentData as Incident)
      : this.incidentsService.create(incidentData as Incident);

    let finalObservable: Observable<any>;

    if (this.showResolutionDetails && this.resolutionForm.valid) {
      finalObservable = incidentObservable.pipe(
        concatMap(incidentResponse => {
          // Procesar la fecha de resolución
          let resolutionDateTimestamp;
          if (this.resolutionForm.value.resolutionDate) {
            const dateObj = new Date(this.resolutionForm.value.resolutionDate);
            if (!isNaN(dateObj.getTime())) {
              resolutionDateTimestamp = dateObj.getTime();
            } else {
              resolutionDateTimestamp = Date.now();
              console.warn('Fecha de resolución inválida, usando fecha actual');
            }
          } else {
            resolutionDateTimestamp = Date.now();
          }

          const resolutionData: IncidentResolution = {
            ...this.resolutionForm.value,
            incidentId: incidentResponse.id!, 
            resolutionDate: resolutionDateTimestamp
          };
          return this.createResolution(resolutionData).pipe(
            concatMap(resolutionResponse => {
              console.log('Resolución creada correctamente:', resolutionResponse);
              return of(incidentResponse);
            })
          );
        })
      );
    } else {
      finalObservable = incidentObservable;
    }

    finalObservable.subscribe({
      next: (response) => {
        let successMessage = 'Incidencia guardada correctamente';
        if (this.showResolutionDetails && this.resolutionForm.valid) {
          successMessage = 'Incidencia y resolución guardadas correctamente';
        }
        this.showSuccessAlert(successMessage);
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al guardar la incidencia o la resolución:', error);
        this.showErrorAlert('Error al guardar la incidencia o la resolución.');
      }
    });
  }

  // New method to be used internally for chaining
  private createResolution(resolutionData: IncidentResolution): Observable<IncidentResolution> {
    return this.resolutionService.create(resolutionData).pipe(
      catchError(error => {
        console.error('Error creating resolution in createResolution method:', error);
        this.showErrorAlert('Error al crear la resolución.');
        return throwError(() => new Error('Error al crear la resolución')); // Propagate error
      })
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDateInput(date: Date): string {
    // Verificar que la fecha sea válida
    if (!date || isNaN(date.getTime())) {
      console.warn('Fecha inválida proporcionada a formatDateInput:', date);
      // Devolver la fecha actual formateada
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDateInputString(date: any): string | null {
    if (!date) return null;
    
    try {
      if (date instanceof Date) {
        // Verificar que la fecha sea válida
        if (isNaN(date.getTime())) {
          console.warn('Fecha inválida (objeto Date) proporcionada a toDateInputString:', date);
          return this.formatDateInput(new Date());
        }
        return this.formatDateInput(date);
      } else if (typeof date === 'number') {
        // Verificar que el timestamp sea válido (mayor que 0 y no NaN)
        if (isNaN(date) || date <= 0) {
          console.warn('Timestamp inválido proporcionado a toDateInputString:', date);
          return this.formatDateInput(new Date());
        }
        return this.formatDateInput(new Date(date));
      } else if (typeof date === 'string') {
        // Intentar convertir la cadena a fecha
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          console.warn('Cadena de fecha inválida proporcionada a toDateInputString:', date);
          return this.formatDateInput(new Date());
        }
        return this.formatDateInput(dateObj);
      }
    } catch (error) {
      console.error('Error al procesar fecha en toDateInputString:', error);
      return this.formatDateInput(new Date());
    }
    
    return null;
  }

  private adaptIncidentForForm(incident: Incident | null): any {
    if (!incident) return null;
    return {
      ...incident,
      incidentDate: this.toDateInputString(incident.incidentDate)
    };
  }

  getSelectedIncidentType(): IncidentType | undefined {
    return this.incidentTypes.find(type => type.id === this.incidentForm.get('incidentTypeId')?.value);
  }

  getPriorityLabel(priority: string | undefined): string {
    switch (priority) {
      case 'LOW': return 'Baja';
      case 'MEDIUM': return 'Media';
      case 'HIGH': return 'Alta';
      case 'CRITICAL': return 'Crítica';
      default: return priority || '';
    }
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: message,
      confirmButtonColor: '#4CAF50',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container',
        actions: 'swal2-actions',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
        icon: 'swal2-icon'
      }
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#F44336',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container',
        actions: 'swal2-actions',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    });
  }
}