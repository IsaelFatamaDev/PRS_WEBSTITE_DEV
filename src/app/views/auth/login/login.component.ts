import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AnimationService } from '../../../core/services/animation.service';
import { RolesUsers } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private animationService: AnimationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';

      const { username, password } = this.loginForm.value; this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.error = '';
          this.animationService.showWelcomeAnimation();
          console.log('Login successful:', response);
          console.log('User roles:', response.user.roles);
          console.log('User roles length:', response.user.roles.length);
          console.log('Needs role selection?', this.authService.needsRoleSelection());
          console.log('Has multiple roles?', this.authService.hasMultipleRoles());
          console.log('Selectable roles:', this.authService.getSelectableRoles());

          setTimeout(() => {
            console.log('Checking role selection logic...');
            const needsSelection = this.authService.needsRoleSelection();
            console.log('Final needs role selection?', needsSelection);

            if (needsSelection) {
              console.log('Navigating to role selector');
              this.router.navigate(['/role-selector']);
            } else {
              console.log('Single role detected, setting active role and navigating');
              // Si solo tiene un rol, establecerlo como activo antes de navegar
              if (response.user.roles.length === 1) {
                console.log('Setting active role:', response.user.roles[0]);
                this.authService.setActiveRole(response.user.roles[0]);
              }
              this.navigateBasedOnRole(response.user.roles);
            }
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Login error:', err);
          this.error = err.message || 'Error de autenticación. Verifique sus credenciales.';

          setTimeout(() => {
            this.error = '';
          }, 5000);
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }
  /**
   * Navegar basado en los roles del usuario
   */
  private navigateBasedOnRole(roles: RolesUsers[]): void {
    console.log('Attempting to navigate with roles:', roles);

    // Priorizar SUPER_ADMIN primero
    if (roles.includes(RolesUsers.SUPER_ADMIN)) {
      console.log('Navigating to super-admin dashboard');
      this.router.navigate(['/super-admin/dashboard']);
    } else if (roles.includes(RolesUsers.ADMIN)) {
      console.log('Navigating to admin dashboard');
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes(RolesUsers.CLIENT)) {
      console.log('Navigating to client dashboard');
      this.router.navigate(['/client/dashboard']);
    } else {
      console.log('No valid role found, navigating to home');
      this.router.navigate(['/']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  forgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
