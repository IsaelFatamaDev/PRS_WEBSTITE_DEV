import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RolesUsers } from '../../../core/models/user.model';
import { AuthUser } from '../../../core/models/auth.model';

@Component({
     selector: 'app-role-selector',
     standalone: true,
     imports: [CommonModule],
     templateUrl: './role-selector.component.html',
     styleUrls: ['./role-selector.component.css']
})
export class RoleSelectorComponent implements OnInit {
     user: AuthUser | null = null;
     availableRoles: RolesUsers[] = [];
     selectedRole: RolesUsers | null = null;

     constructor(
          private authService: AuthService,
          private router: Router
     ) { } ngOnInit() {
          this.user = this.authService.getCurrentUser();

          if (!this.user || this.user.roles.length <= 1) {
               // Si solo tiene un rol, establecerlo como activo
               if (this.user && this.user.roles.length === 1) {
                    this.authService.setActiveRole(this.user.roles[0]);
               }
               this.navigateToDashboard();
               return;
          }

          this.availableRoles = this.user.roles.filter(role =>
               role === RolesUsers.ADMIN || role === RolesUsers.CLIENT || role === RolesUsers.SUPER_ADMIN
          );

          if (this.availableRoles.length <= 1) {
               // Si solo hay un rol seleccionable, establecerlo como activo
               if (this.availableRoles.length === 1) {
                    this.authService.setActiveRole(this.availableRoles[0]);
               }
               this.navigateToDashboard();
          }
     } selectRole(role: RolesUsers) {
          console.log('selectRole called with:', role);
          this.selectedRole = role;
          console.log('Selected role set to:', this.selectedRole);
     } confirmRoleSelection() {
          console.log('confirmRoleSelection called');
          console.log('Selected role:', this.selectedRole);
          console.log('Current user:', this.user);

          if (!this.selectedRole || !this.user) {
               console.log('No selected role or user, returning');
               return;
          }

          console.log('Setting active role:', this.selectedRole);
          this.authService.setActiveRole(this.selectedRole);

          console.log('Navigating to role dashboard');
          this.navigateToRoleDashboard(this.selectedRole);
     } private navigateToRoleDashboard(role: RolesUsers) {
          console.log('navigateToRoleDashboard called with role:', role);

          switch (role) {
               case RolesUsers.ADMIN:
                    console.log('Navigating to /admin/dashboard');
                    this.router.navigate(['/admin/dashboard']);
                    break;
               case RolesUsers.CLIENT:
                    console.log('Navigating to /client/dashboard');
                    this.router.navigate(['/client/dashboard']);
                    break;
               case RolesUsers.SUPER_ADMIN:
                    console.log('Navigating to /super-admin/dashboard');
                    this.router.navigate(['/super-admin/dashboard']);
                    break;
               default:
                    console.log('No matching role, navigating to /');
                    this.router.navigate(['/']);
          }
     }

     private navigateToDashboard() {
          if (!this.user) {
               this.router.navigate(['/auth/login']);
               return;
          }

          const dashboardRoute = this.getDashboardRoute();
          this.router.navigate([dashboardRoute]);
     }

     private getDashboardRoute(): string {
          if (!this.user?.roles || this.user.roles.length === 0) return '/';

          if (this.user.roles.includes(RolesUsers.SUPER_ADMIN)) {
               return '/super-admin/dashboard';
          } else if (this.user.roles.includes(RolesUsers.ADMIN)) {
               return '/admin/dashboard';
          } else if (this.user.roles.includes(RolesUsers.CLIENT)) {
               return '/client/dashboard';
          }

          return '/';
     }

     getRoleDisplayName(role: RolesUsers): string {
          const roleNames = {
               [RolesUsers.ADMIN]: 'Administrador',
               [RolesUsers.CLIENT]: 'Cliente',
               [RolesUsers.SUPER_ADMIN]: 'Super Administrador'
          };
          return roleNames[role] || role;
     }

     getRoleDescription(role: RolesUsers): string {
          const descriptions = {
               [RolesUsers.ADMIN]: 'Gestiona la organización, usuarios, pagos y reportes',
               [RolesUsers.CLIENT]: 'Accede a sus pagos, reportes y servicios personales',
               [RolesUsers.SUPER_ADMIN]: 'Control total del sistema y organizaciones'
          };
          return descriptions[role] || '';
     }

     getRoleIcon(role: RolesUsers): string {
          const icons = {
               [RolesUsers.ADMIN]: 'fas fa-user-cog',
               [RolesUsers.CLIENT]: 'fas fa-user',
               [RolesUsers.SUPER_ADMIN]: 'fas fa-crown'
          };
          return icons[role] || 'fas fa-user';
     }

     logout() {
          this.authService.logout().subscribe({
               next: () => {
                    this.router.navigate(['/auth/login']);
               },
               error: (error) => {
                    console.error('Error during logout:', error);
                    this.router.navigate(['/auth/login']);
               }
          });
     }
}
