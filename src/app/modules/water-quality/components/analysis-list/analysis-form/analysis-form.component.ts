import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { QualityTest, testing_points } from '../../../../../core/models/water-quality.model';
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private waterQualityService: WaterQualityService
  ) {
    this.analysisForm = this.fb.group({
      organizationId: ['', [Validators.required]],
      testDate: ['', [Validators.required]],
      testType: ['', [Validators.required]],
      testingPointId: ['', [Validators.required]],
      waterTemperature: ['', [Validators.required, Validators.min(-50), Validators.max(100), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      weatherConditions: ['', [Validators.maxLength(100)]],
      results: this.fb.array([]),
      generalObservations: ['', [Validators.maxLength(500)]],
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
    
    // Cargar puntos de prueba
    this.loadTestingPoints();
    
    if (this.analysisId) {
      this.isEditMode = true;
      console.log('Modo edición activado');
      this.loadAnalysis();
    } else {
      console.log('Modo creación activado');
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
          this.analysisForm.patchValue({
            organizationId:analysis.organizationId,
            testDate: this.formatDateForInput(analysis.testDate),
            testType: analysis.testType,
            testingPointId: analysis.testingPointId,
            waterTemperature: analysis.waterTemperature,
            weatherConditions: analysis.weatherConditions,
            generalObservations: analysis.generalObservations,
            status:analysis.status  
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
      parameterCode: [result?.parameterCode || '', Validators.required],
      measuredValue: [result?.measuredValue || '', [Validators.required, Validators.min(0)]],
      unit: [result?.unit || '', Validators.required],
      status: [result?.status || 'ACCEPTABLE', Validators.required],
      observations: [result?.observations || '']
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
      organizationId: formValue.organizationId,
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
    else errorMessage = 'Campo inválido';

    console.log(`Error en campo ${fieldName}:`, { error: field.errors, mensaje: errorMessage });
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
    this.waterQualityService.getAllTestingPoints().subscribe({
      next: (points) => {
        console.log('Puntos de prueba cargados:', points);
        this.testingPoints = points;
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
      }
    });
  }
}
