import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DistributionService } from '../../../../../core/services/distribution.service';
import { routes, Status } from '../../../../../core/models/distribution.model';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-routes-list',
  templateUrl: './routes-list.component.html',
  imports: [
    CommonModule,
    FormsModule,
]})
export class RoutesListComponent implements OnInit {
  private router = inject(Router);
  private routesService = inject(DistributionService);

  allRoutes: routes[] = [];
  filteredRoutes: routes[] = [];
  users: any[] = []; // Asegúrate de cargar esto desde el backend si aplica

  // 🔹 Filtros
  searchTerm: string = '';
  selectedStatus: 'activo' | 'inactivo' = 'activo';

  // 🔹 Alertas
  showAlert: boolean = false;
  alertType: 'success' | 'error' | 'info' = 'success';
  alertMessage: string = '';
  organizations: any;
  loading: boolean | undefined;
  zones: any;

  ngOnInit() {
    this.loadRoutes();
  }

loadRoutes() {
  this.loading = true;
  this.routesService.getAllR().subscribe({
    next: (routes: routes[]) => {
      this.allRoutes = routes;
      this.applyFilters();
      this.loading = false;
    },
    error: () => {
      this.showErrorAlert('Error al cargar las rutas.');
      this.loading = false;
    }
  });
}


  // 🔹 Contadores
  getActiveRCount(): number {
    return this.allRoutes.filter(route => route.status === Status.ACTIVE).length;
  }
  
getNameOrganization(id: string): string {
  if (!this.organizations) {
    console.warn('Lista de organizaciones aún no cargada');
    return 'Desconocido';
  }

  const org = this.organizations.find((o: { organizationId: string; }) => o.organizationId === id);
  return org?.organizationName || 'Desconocido';
}


  getInactiveRCount(): number {
    return this.allRoutes.filter(route => route.status === Status.INACTIVE).length;
  }

  // 🔹 Filtros
  onSearch() {
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredRoutes = this.allRoutes.filter(route => {
      const matchesSearch = route.routeName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const isActive = route.status === Status.ACTIVE;
      const isInactive = route.status === Status.INACTIVE;
      const matchesStatus = this.selectedStatus === 'activo' ? isActive : isInactive;
      return matchesSearch && matchesStatus;
    });
  }

  // 🔹 Acciones
  addNewRoute(): void {
    this.router.navigate(['/distributions/routes/new']);
  }

  trackByRouteId(index: number, route: routes): string {
    return route.id;
  }

  getZoneNames(zones: any[]): string {
    return zones.map(zone => `Zona ${zone.order}`).join(', ');
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Sin asignar';
  }

  // 🔹 Alertas
  dismissAlert() {
    this.showAlert = false;
  }

  showSuccessAlert(message: string) {
    this.alertType = 'success';
    this.alertMessage = message;
    this.showAlert = true;
  }

  showErrorAlert(message: string) {
    this.alertType = 'error';
    this.alertMessage = message;
    this.showAlert = true;
  }

  showInfoAlert(message: string) {
    this.alertType = 'info';
    this.alertMessage = message;
    this.showAlert = true;
  }
  getStatusClass(status: Status): string {
  return status === Status.ACTIVE
    ? 'text-green-700 bg-green-100'
    : 'text-red-700 bg-red-100';
}

getStatusLabel(status: Status): string {
  switch (status) {
    case Status.ACTIVE: return 'Activo';
    case Status.INACTIVE: return 'Inactivo';
    default: return 'Desconocido';
  }
}

}
