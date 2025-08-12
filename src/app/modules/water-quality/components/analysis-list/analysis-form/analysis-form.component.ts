import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { QualityTest, testing_points } from '../../../../../core/models/water-quality.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { OrganizationResolverService } from '../../../../../core/services/organization-resolver.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analysis-form',
  standalone:true,
  imports:[CommonModule,ReactiveFormsModule],
  templateUrl: './analysis-form.component.html',
})
export class AnalysisFormComponent implements OnInit {
  analysisForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  analysisId: string | null = null;
  testingPoints: testing_points[] = [];
  currentUserOrganizationId: string | null = null;
  currentUserOrganizationName: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private waterQualityService: WaterQualityService,
    private authService: AuthService,
    private organizationResolver: OrganizationResolverService
  ) {
    this.analysisForm = this.fb.group({
      organizationId: ['', [Validators.required]],
      testDate: ['', [Validators.required]],
      testType: ['', [Validators.required]],
      testingPointId: ['', [Validators.required]],
      waterTemperature: ['', [
        Validators.required, 
        Validators.min(-50), 
        Validators.max(100), 
        Validators.pattern(/^-?\d+(\.\d{1,2})?$/)
      ]],
      weatherConditions: ['', [
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
      ]],
      results: this.fb.array([]),
      generalObservations: ['', [
        Validators.maxLength(500),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.\,\;\:\!\?\(\)]+$/)
      ]],
      status: ['PENDING', [Validators.required]]
    });

    // Suscribirse a los cambios del formulario
    this.analysisForm.valueChanges.subscribe(value => {
      console.log('Formulario actualizado:', {
        valores: value,
        valido: this.analysisForm.valid,
        errores: this.analysisForm.errors,
        estadoCampos: {
          organizationId: this.analysisForm.get('organizationId')?.valid,
          testDate: this.analysisForm.get('testDate')?.valid,
          testType: this.analysisForm.get('testType')?.valid,
          testingPointId: this.analysisForm.get('testingPointId')?.valid,
          weatherConditions: this.analysisForm.get('weatherConditions')?.valid,
          waterTemperature: this.analysisForm.get('waterTemperature')?.valid,
          status: this.analysisForm.get('status')?.valid
        }
      });
    });
  }

  ngOnInit(): void {
    this.analysisId = this.route.snapshot.paramMap.get('id');
    console.log('ID del análisis:', this.analysisId);
    
    // Obtener la organización del usuario logueado
    this.setCurrentUserOrganization();
    
    // Cargar puntos de prueba filtrados por organización
    this.loadTestingPoints();
    
    if (this.analysisId) {
      this.isEditMode = true;
      console.log('Modo edición activado');
      this.loadAnalysis();
    } else {
      console.log('Modo creación activado');
    }
  }

  private setCurrentUserOrganization(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.organizationId) {
      this.currentUserOrganizationId = currentUser.organizationId;
      
      // Obtener el nombre real de la organización
      this.organizationResolver.getOrganizationName(this.currentUserOrganizationId).subscribe({
        next: (organizationName) => {
          this.currentUserOrganizationName = organizationName;
          console.log('Nombre de organización cargado:', this.currentUserOrganizationName);
        },
        error: (error) => {
          console.error('Error al cargar nombre de organización:', error);
          this.currentUserOrganizationName = `Organización ${this.currentUserOrganizationId}`;
        }
      });
      
      // Establecer la organización en el formulario (no editable)
      this.analysisForm.patchValue({
        organizationId: this.currentUserOrganizationId
      });
      
      // Deshabilitar el campo de organización
      this.analysisForm.get('organizationId')?.disable();
      
      console.log('Organización del usuario:', this.currentUserOrganizationId);
    } else {
      console.error('Usuario no tiene organización asignada');
      // Redirigir o mostrar error
      this.router.navigate(['/unauthorized']);
    }
  }

  get resultsArray() {
    return this.analysisForm.get('results') as FormArray;
  }

  loadAnalysis(): void {
    if (!this.analysisId) return;

    console.log('Cargando análisis con ID:', this.analysisId);
    this.waterQualityService.getTestById(this.analysisId).subscribe({
      next: (analysis) => {
        if (analysis) {
          // Verificar que el análisis pertenece a la organización del usuario
          if (analysis.organizationId !== this.currentUserOrganizationId) {
            console.error('El análisis no pertenece a la organización del usuario');
            this.router.navigate(['/unauthorized']);
            return;
          }

          this.analysisForm.patchValue({
            organizationId: analysis.organizationId,
            testDate: this.formatDateForInput(analysis.testDate),
            testType: analysis.testType,
            testingPointId: analysis.testingPointId,
            waterTemperature: analysis.waterTemperature,
            weatherConditions: analysis.weatherConditions,
            generalObservations: analysis.generalObservations,
            status: analysis.status
          });
          
          // Guardar testCode para update
          this.analysisForm.addControl('testCode', this.fb.control(analysis.testCode));
          
          // Cargar resultados
          if (analysis.results && analysis.results.length > 0) {
            analysis.results.forEach(result => {
              this.addResult(result);
            });
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar el análisis:', error);
      }
    });
  }

  addResult(result?: any): void {
    console.log('Agregando resultado:', result);
    const resultForm = this.fb.group({
      parameterCode: [result?.parameterCode || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Z0-9\-_]+$/)
      ]],
      measuredValue: [result?.measuredValue || '', [
        Validators.required, 
        Validators.min(0),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      unit: [result?.unit || '', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(10),
        Validators.pattern(/^[a-zA-Z\/%°]+$/)
      ]],
      status: [result?.status || 'ACCEPTABLE', [Validators.required]],
      observations: [result?.observations || '', [
        Validators.maxLength(200),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.\,\;\:\!\?\(\)]+$/)
      ]]
    });

    this.resultsArray.push(resultForm);
  }

  removeResult(index: number): void {
    console.log('Eliminando resultado en índice:', index);
    this.resultsArray.removeAt(index);
  }

  onSubmit(): void {
    console.log('Iniciando envío del formulario');
    console.log('Estado del formulario:', {
      válido: this.analysisForm.valid,
      valores: this.analysisForm.value,
      errores: this.analysisForm.errors
    });

    if (this.analysisForm.invalid) {
      console.log('Formulario inválido, marcando campos como tocados');
      this.markFormGroupTouched(this.analysisForm);
      return;
    }

    this.isSubmitting = true;
    const formData = this.prepareFormData();

    // Validar que los datos no estén vacíos
    if (!formData.organizationId || !formData.testDate || !formData.testType || !formData.testingPointId) {
      this.isSubmitting = false;
      return;
    }

    // En edición, asegurar que testCode se envía
    if (this.isEditMode && this.analysisForm.get('testCode')) {
      formData.testCode = this.analysisForm.get('testCode')?.value;
    }

    const request = this.isEditMode
      ? this.waterQualityService.updateTest(this.analysisId!, formData)
      : this.waterQualityService.createTest(formData);

    request.subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        this.router.navigate(['/admin/water-quality/test']);
      },
      error: (error) => {
        console.error('Error al guardar el análisis:', {
          error,
          datosEnviados: formData,
          status: error.status,
          message: error.message,
          errorResponse: error.error
        });
        this.isSubmitting = false;
      }
    });
  }

  private prepareFormData(): QualityTest {
    const formValue = this.analysisForm.value;
    console.log('Valores del formulario antes de preparar:', formValue);
    
    // Asegurarse de que todos los campos numéricos sean números
    const preparedData: QualityTest = {
      id: formValue.id || '',
      organizationId: this.currentUserOrganizationId!, // Usar la organización del usuario
      testCode: this.isEditMode && formValue.testCode ? formValue.testCode : '',
      testDate: new Date(formValue.testDate).toISOString(),
      testType: formValue.testType,
      testingPointId: formValue.testingPointId,
      waterTemperature: Number(formValue.waterTemperature),
      weatherConditions: formValue.weatherConditions || '',
      generalObservations: formValue.generalObservations || '',
      status: formValue.status || 'PENDING',
      testedByUserId: formValue.testedByUserId || '',
      results: formValue.results.map((result: any) => ({
        parameterCode: result.parameterCode,
        measuredValue: Number(result.measuredValue),
        unit: result.unit,
        status: result.status,
        observations: result.observations || ''
      }))
    };

    // Validar que no haya valores undefined o null
    Object.keys(preparedData).forEach(key => {
      const typedKey = key as keyof QualityTest;
      const value = preparedData[typedKey];
      
      if (value === undefined || value === null) {
        if (typeof value === 'number') {
          (preparedData[typedKey] as number) = 0;
        } else if (Array.isArray(value)) {
          (preparedData[typedKey] as any[]) = [];
        } else {
          (preparedData[typedKey] as string) = '';
        }
      }
    });

    console.log('Datos preparados y validados:', preparedData);
    return preparedData;
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toISOString().slice(0, 16);
    return formattedDate;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    console.log('Marcando campos como tocados');
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.analysisForm.get(fieldName);
    const isInvalid = field ? field.invalid && (field.dirty || field.touched) : false;
    if (isInvalid) {
      console.log(`Campo ${fieldName} inválido:`, {
        errors: field?.errors,
        value: field?.value,
        touched: field?.touched,
        dirty: field?.dirty
      });
    }
    return isInvalid;
  }

  getFieldError(fieldName: string): string {
    const field = this.analysisForm.get(fieldName);
    if (!field || !field.errors) return '';

    let errorMessage = '';
    if (field.errors['required']) errorMessage = 'Este campo es requerido';
    else if (field.errors['min']) errorMessage = `El valor mínimo es ${field.errors['min'].min}`;
    else if (field.errors['max']) errorMessage = `El valor máximo es ${field.errors['max'].max}`;
    else if (field.errors['minlength']) errorMessage = `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    else if (field.errors['maxlength']) errorMessage = `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    else if (field.errors['pattern']) errorMessage = 'Formato inválido';
    else errorMessage = 'Campo inválido';

    console.log(`Error en campo ${fieldName}:`, { error: field.errors, mensaje: errorMessage });
    return errorMessage;
  }

  // Validaciones específicas para resultados
  isResultFieldInvalid(resultIndex: number, fieldName: string): boolean {
    const resultGroup = this.resultsArray.at(resultIndex) as FormGroup;
    const field = resultGroup.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getResultFieldError(resultIndex: number, fieldName: string): string {
    const resultGroup = this.resultsArray.at(resultIndex) as FormGroup;
    const field = resultGroup.get(fieldName);
    if (!field || !field.errors) return '';

    let errorMessage = '';
    if (field.errors['required']) errorMessage = 'Este campo es requerido';
    else if (field.errors['min']) errorMessage = `El valor mínimo es ${field.errors['min'].min}`;
    else if (field.errors['minlength']) errorMessage = `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    else if (field.errors['maxlength']) errorMessage = `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    else if (field.errors['pattern']) errorMessage = 'Formato inválido';
    else errorMessage = 'Campo inválido';

    return errorMessage;
  }

  isFormValid(): boolean {
    return this.analysisForm.valid;
  }

  goBack(): void {
    console.log('Navegando hacia atrás');
    this.router.navigate(['/admin/water-quality/test']);
  }

  loadTestingPoints(): void {
    // Filtrar puntos de prueba por la organización del usuario actual
    this.waterQualityService.getAllTestingPoints().subscribe({
      next: (points) => {
        console.log('Todos los puntos de prueba:', points);
        // Filtrar solo los puntos de la organización del usuario
        this.testingPoints = points.filter(point => 
          point.organizationId === this.currentUserOrganizationId
        );
        console.log('Puntos de prueba filtrados por organización:', this.testingPoints);
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
      }
    });
  }
}
