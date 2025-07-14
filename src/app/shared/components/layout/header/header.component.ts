import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AnimationService } from '../../../../core/services/animation.service';
import { RolesUsers } from '../../../../core/models/user.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [DatePipe]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  @Input() isSidebarOpen: boolean = true;
  @Input() showMobileMenuButton: boolean = false;
  isUserMenuOpen: boolean = false;
  isDarkMode: boolean = false;
  private timeSubscription: Subscription | null = null;
  currentTime: Date = new Date();
  windowWidth: number = window.innerWidth;

  constructor(
    private authService: AuthService,
    private animationService: AnimationService,
    private router: Router,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');

    if (!savedTheme) {
      this.isDarkMode = false;
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      this.isDarkMode = savedTheme === 'dark';

      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.windowWidth = window.innerWidth;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenuButton = document.querySelector('[data-user-menu-button]');
    const userMenuDropdown = document.querySelector('[data-user-menu-dropdown]');

    if (this.isUserMenuOpen &&
      !userMenuButton?.contains(target) &&
      !userMenuDropdown?.contains(target)) {
      this.isUserMenuOpen = false;
    }
  }

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.startClock();

    setTimeout(() => {
      this.windowWidth = window.innerWidth;
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  startClock(): void {
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
      this.cdr.markForCheck();
    });
  }
  getFormattedDate(): string {
    const date = this.currentTime;
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${dayName}, ${monthName} ${day}, ${year}`;
  }

  getFormattedTime(): string | null {
    return this.datePipe.transform(this.currentTime, 'h:mm:ss a');
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  } toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    const htmlElement = document.documentElement;

    if (this.isDarkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    this.cdr.detectChanges();

    console.log('🌙 Theme toggled:', this.isDarkMode ? 'DARK MODE' : 'LIGHT MODE');
    console.log('🔧 HTML classes:', htmlElement.className);
    console.log('💾 LocalStorage theme:', localStorage.getItem('theme'));
    console.log('🎨 Dark class present:', htmlElement.classList.contains('dark'));
  } logout(): void {
    this.closeUserMenu();
    this.animationService.showGoodbyeAnimation();

    this.authService.logout().subscribe({
      next: () => {
        setTimeout(() => {
          this.router.navigate(['/auth/login'], { replaceUrl: true });
        }, 1000);
      },
      error: () => {
        setTimeout(() => {
          this.router.navigate(['/auth/login'], { replaceUrl: true });
        }, 1000);
      }
    });
  }
  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName || 'Usuario';
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user?.fullName) {
      return user.fullName.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'U';
  }
  getUserRoleDisplay(): string {
    const user = this.authService.getCurrentUser();

    if (!user?.roles || user.roles.length === 0) {
      return 'Usuario';
    }

    const activeRole = this.authService.getActiveRole();
    if (activeRole) {
      const roleDisplayMap = {
        [RolesUsers.SUPER_ADMIN]: 'Super Admin',
        [RolesUsers.ADMIN]: 'Administrador',
        [RolesUsers.CLIENT]: 'Cliente'
      };
      return roleDisplayMap[activeRole] || activeRole;
    }

    const roleDisplayMap = {
      [RolesUsers.SUPER_ADMIN]: 'Super Admin',
      [RolesUsers.ADMIN]: 'Administrador',
      [RolesUsers.CLIENT]: 'Cliente'
    };

    const primaryRole = user.roles[0];
    return roleDisplayMap[primaryRole] || 'Usuario';
  }

  hasMultipleRoles(): boolean {
    return this.authService.hasMultipleRoles();
  }
}
