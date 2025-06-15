import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AnimationService } from '../../../../core/services/animation.service';
import { UserRole } from '../../../../core/models/auth.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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
    // Inicializar el tema desde localStorage (por defecto claro)
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');

    // Si no hay tema guardado, establecer por defecto como claro
    if (!savedTheme) {
      this.isDarkMode = false;
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      this.isDarkMode = savedTheme === 'dark';

      // Aplicar el tema al documento
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
    // Inicializamos el ancho de la ventana
    this.windowWidth = window.innerWidth;
    // Iniciar el reloj en tiempo real
    this.startClock();

    // Forzar una actualización después de un pequeño retraso
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
      // Limitar las actualizaciones del reloj para no afectar el rendimiento
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
  }  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    // Aplicar cambios inmediatamente al DOM
    const htmlElement = document.documentElement;

    if (this.isDarkMode) {
      // Modo oscuro activado
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      // Modo claro activado
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Forzar detección de cambios
    this.cdr.detectChanges();

    // Debug info mejorado
    console.log('🌙 Theme toggled:', this.isDarkMode ? 'DARK MODE' : 'LIGHT MODE');
    console.log('🔧 HTML classes:', htmlElement.className);
    console.log('💾 LocalStorage theme:', localStorage.getItem('theme'));
    console.log('🎨 Dark class present:', htmlElement.classList.contains('dark'));
  }
  logout(): void {
    this.closeUserMenu();

    // Mostrar animación de despedida
    this.animationService.showGoodbyeAnimation();

    // Esperar a que termine la animación antes de hacer logout
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }, 3000); // 3 segundos para la animación
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
}
