import { Component, OnInit, Input, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AnimationService } from '../../../../core/services/animation.service';
import { UserRole } from '../../../../core/models/auth.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarOpen: boolean = true;
  @Input() windowWidth: number = 0;
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  @Output() optionSelected = new EventEmitter<void>();

  userRole: UserRole | null = null;
  UserRole = UserRole;
  isOrganizationsDropdownOpen: boolean = false;
  constructor(
    public authService: AuthService,
    private animationService: AnimationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.windowWidth = window.innerWidth;
    this.cdr.detectChanges();
  }
  ngOnInit() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);

    const currentUser = this.authService.getCurrentUser();
    this.userRole = currentUser?.role || null;

    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      this.isSidebarOpen = JSON.parse(savedState);
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.toggleSidebarEvent.emit();
  }
  onOptionSelected() {
    this.isOrganizationsDropdownOpen = false;
    this.optionSelected.emit();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    localStorage.setItem('sidebarState', JSON.stringify(this.isSidebarOpen));
    this.toggleSidebarEvent.emit();
  }
  logout() {
    this.animationService.showGoodbyeAnimation();

    setTimeout(() => {
      localStorage.clear();
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }, 3000);
  }

  toggleOrganizationsDropdown() {
    this.isOrganizationsDropdownOpen = !this.isOrganizationsDropdownOpen;
  }

  hasRole(role: UserRole): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'Usuario';
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user?.name) {
      return user.name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'U';
  }

  getUserRoleDisplay(): string {
    const user = this.authService.getCurrentUser();
    const roleDisplayMap = {
      [UserRole.SUPERADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.CLIENT]: 'Cliente'
    };
    return roleDisplayMap[user?.role as UserRole] || 'Usuario';
  }

  getDashboardRoute(): string {
    const user = this.authService.getCurrentUser();
    switch (user?.role) {
      case UserRole.SUPERADMIN:
        return '/super-admin/dashboard';
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.CLIENT:
        return '/client/dashboard';
      default:
        return '/';
    }
  }
}
