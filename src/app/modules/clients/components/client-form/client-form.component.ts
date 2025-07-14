import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  UserCreateDTO,
  UserResponseDTO,
  UserUpdateDTO,
  DocumentType,
  RolesUsers,
  StatusUsers
} from '../../../../core/models/user.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  clientForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  clientId: string | null = null;
  isFormInitialized = false;

  DocumentType = DocumentType;

  errors: any = {};

  passwordStrength = {
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
    isValidLength: false
  }; constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
  } ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.clientId;

    this.initializeForm();
    this.isFormInitialized = true;

    if (this.isEditMode && this.clientId) {
      this.loadClient(this.clientId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  /**
   * Inicializar formulario
   */
  private initializeForm(): void {
    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.nameValidator]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.nameValidator]],
      documentType: [DocumentType.DNI, Validators.required],
      documentNumber: ['', [Validators.required, this.documentNumberValidator.bind(this)]],

      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      phone: ['', [Validators.required, this.phoneValidator]],

      streetAddress: ['', [Validators.required, Validators.maxLength(200)]],
      streetId: ['', Validators.required],
      zoneId: ['', Validators.required],

      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    });

    if (this.isEditMode) {
      this.clientForm.removeControl('password');
      this.clientForm.removeControl('confirmPassword');
    } else {
      this.clientForm.addValidators(this.passwordMatchValidator.bind(this));

      this.clientForm.get('password')?.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(password => {
        this.updatePasswordStrength(password || '');
      });
    }

    this.clientForm.get('documentType')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const documentNumberControl = this.clientForm.get('documentNumber');
      if (documentNumberControl) {
        documentNumberControl.updateValueAndValidity();
      }
    });
  }
  /**
   * Validador para nombres y apellidos (solo letras y espacios)
   */
  private nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const namePattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
    if (!namePattern.test(value)) {
      return { invalidName: true };
    }
    return null;
  }
  /**
   * Validador para número de documento según tipo
   */
  private documentNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    if (!this.clientForm) return null;

    const documentType = this.clientForm.get('documentType')?.value;

    if (documentType === DocumentType.DNI) {
      const dniPattern = /^\d{8}$/;
      if (!dniPattern.test(value)) {
        return { invalidDni: true };
      }
    } else if (documentType === DocumentType.CARNET_EXTRANJERIA) {
      const carnetPattern = /^[a-zA-Z0-9]{1,20}$/;
      if (!carnetPattern.test(value)) {
        return { invalidCarnet: true };
      }
    }

    return null;
  }

  /**
   * Validador mejorado para email
   */
  private emailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      return { invalidEmailFormat: true };
    }

    return null;
  }

  /**
   * Validador para teléfono (debe empezar con 9)
   */
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const phonePattern = /^9\d{8}$/;
    if (!phonePattern.test(value)) {
      return { invalidPhone: true };
    }

    return null;
  }

  /**
   * Validador para contraseña con patrón específico
   */
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[\s\S]+$/;
    if (!passwordPattern.test(value)) {
      return { invalidPasswordPattern: true };
    }

    if (value.length < 8) {
      return { minLength: { requiredLength: 8, actualLength: value.length } };
    }

    return null;
  }

  /**
   * Actualizar indicadores de fortaleza de contraseña
   */
  private updatePasswordStrength(password: string): void {
    this.passwordStrength = {
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[\W_]/.test(password),
      isValidLength: password.length >= 8
    };
  }

  /**
   * Obtener el número de criterios cumplidos de la contraseña
   */
  get passwordCriteriaCount(): number {
    const { hasLowercase, hasUppercase, hasNumber, hasSpecial, isValidLength } = this.passwordStrength;
    return [hasLowercase, hasUppercase, hasNumber, hasSpecial, isValidLength].filter(Boolean).length;
  }

  /**
   * Obtener clase CSS para la barra de fortaleza
   */
  get passwordStrengthClass(): string {
    const count = this.passwordCriteriaCount;
    if (count <= 1) return 'bg-red-500';
    if (count <= 2) return 'bg-orange-500';
    if (count <= 3) return 'bg-yellow-500';
    if (count <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  }

  /**
   * Obtener texto de fortaleza de contraseña
   */
  get passwordStrengthText(): string {
    const count = this.passwordCriteriaCount;
    if (count <= 1) return 'Muy débil';
    if (count <= 2) return 'Débil';
    if (count <= 3) return 'Regular';
    if (count <= 4) return 'Fuerte';
    return 'Muy fuerte';
  }

  /**
   * Validador de coincidencia de passwords
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }  /**
   * Cargar datos del cliente
   */
  private loadClient(clientId: string): void {
    this.isLoading = true;

    this.userService.getUserById(clientId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (client) => {
        this.populateForm(client);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.isLoading = false;
        this.router.navigate(['/admin/users']);
      }
    });
  }

  /**
   * Poblar formulario con datos del cliente
   */
  private populateForm(client: UserResponseDTO): void {
    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      email: client.email,
      phone: client.phone,
      streetAddress: client.streetAddress,
      streetId: client.streetId,
      zoneId: client.zoneId,
      username: client.username
    });
  }

  /**
   * Obtener organizationId del usuario actual
   */
  private getCurrentOrganizationId(): string {
    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      throw new Error('No se encontró ID de organización');
    }
    return organizationId;
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    if (this.clientForm.valid) {
      this.isSaving = true;
      this.errors = {};

      if (this.isEditMode) {
        this.updateClient();
      } else {
        this.createClient();
      }
    } else {
      this.markFormGroupTouched(this.clientForm);
    }
  }

  /**
   * Crear nuevo cliente
   */
  private createClient(): void {
    const formValue = this.clientForm.value;

    const clientData: UserCreateDTO = {
      organizationId: this.getCurrentOrganizationId(),
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      streetAddress: formValue.streetAddress,
      streetId: formValue.streetId,
      zoneId: formValue.zoneId,
      username: formValue.username,
      password: formValue.password,
      roles: [RolesUsers.CLIENT]
    }; this.userService.createUser(clientData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.notificationService.success(
          'Cliente creado',
          `El cliente ${response.fullName} ha sido creado exitosamente`
        );
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.isSaving = false;
        this.notificationService.error(
          'Error al crear cliente',
          'No se pudo crear el cliente. Verifique los datos e inténtelo nuevamente.'
        );
        this.handleError(error);
      }
    });
  }
  /**
   * Actualizar cliente existente
   */
  private updateClient(): void {
    if (!this.clientId) return;

    const formValue = this.clientForm.value; const updateData: UserUpdateDTO = {
      organizationId: this.getCurrentOrganizationId(),
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      streetAddress: formValue.streetAddress,
      streetId: formValue.streetId,
      zoneId: formValue.zoneId,
      username: formValue.username,
      roles: [RolesUsers.CLIENT]
    }; this.userService.updateUser(this.clientId, updateData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.notificationService.success(
          'Cliente actualizado',
          `El cliente ${response.fullName} ha sido actualizado exitosamente`
        );
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.isSaving = false;
        this.notificationService.error(
          'Error al actualizar cliente',
          'No se pudo actualizar el cliente. Verifique los datos e inténtelo nuevamente.'
        );
        this.handleError(error);
      }
    });
  }

  /**
   * Manejar errores
   */
  private handleError(error: any): void {
    console.error('Error saving client:', error);

    if (error.error && error.error.errors) {
      this.errors = error.error.errors;
    } else if (error.error && error.error.message) {
      this.errors = { general: error.error.message };
    } else {
      this.errors = { general: 'Ocurrió un error inesperado' };
    }
  }

  /**
   * Marcar todos los campos como tocados
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.clientForm.get(fieldName);

    if (field && field.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'Ingrese un email válido';
      }
      if (field.errors['invalidEmailFormat']) {
        return 'El formato del email no es válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato inválido';
      }
      if (field.errors['invalidName']) {
        return 'Solo se permiten letras y espacios';
      }
      if (field.errors['invalidDni']) {
        return 'El DNI debe tener exactamente 8 dígitos';
      }
      if (field.errors['invalidCarnet']) {
        return 'El carnet debe tener entre 1 y 20 caracteres alfanuméricos';
      }
      if (field.errors['invalidPhone']) {
        return 'El teléfono debe empezar con 9 y tener 9 dígitos';
      }
      if (field.errors['invalidPasswordPattern']) {
        return 'La contraseña debe tener al menos una minúscula, una mayúscula, un número y un símbolo';
      }
    }

    if (this.clientForm.errors && this.clientForm.errors['passwordMismatch'] && fieldName === 'confirmPassword') {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }
  /**
   * Cancelar y volver
   */
  onCancel(): void {
    this.router.navigate(['/admin/clients']);
  }

  /**
   * Obtener título de la página
   */
  get pageTitle(): string {
    return this.isEditMode ? 'Editar Cliente' : 'Nuevo Cliente';
  }

  /**
   * Obtener texto del botón
   */
  get submitButtonText(): string {
    if (this.isSaving) {
      return this.isEditMode ? 'Actualizando...' : 'Creando...';
    }
    return this.isEditMode ? 'Actualizar Cliente' : 'Crear Cliente';
  }
}
