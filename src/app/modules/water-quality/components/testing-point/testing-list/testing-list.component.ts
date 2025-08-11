import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { testing_points, PointType, Status } from '../../../../../core/models/water-quality.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { OrganizationResolverService } from '../../../../../core/services/organization-resolver.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { zones, organization } from '../../../../../core/models/organization.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-testing-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './testing-list.component.html',
  styleUrl: './testing-list.component.css'
})
export class TestingListComponent implements OnInit {
  points: testing_points[] = [];
  filteredPoints: testing_points[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = 'ACTIVE';
  showAlert = false;
  alertType: 'success' | 'error' | 'info' = 'info';
  alertMessage = '';
  zones: zones[] = [];
  organizations: organization[] = [];
  currentUserOrganizationId: string | null = null;

  constructor(
    private waterQualityService: WaterQualityService,
    private organizationService: OrganizationService,
    private router: Router,
    private organizationResolver: OrganizationResolverService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setCurrentUserOrganization();
    this.loadPoints();
    this.loadZones();
  }

  private setCurrentUserOrganization(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.organizationId) {
      this.currentUserOrganizationId = currentUser.organizationId;
      console.log('Organización del usuario:', this.currentUserOrganizationId);
    } else {
      console.error('Usuario no tiene organización asignada');
      this.router.navigate(['/unauthorized']);
    }
  }

  loadPoints(): void {
    this.loading = true;
    this.waterQualityService.getAllTestingPoints().subscribe({
      next: (points) => {
        this.points = points;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar puntos de prueba:', error);
        this.showErrorAlert('Error al cargar los puntos de prueba');
        this.loading = false;
      }
    });
  }
  
  loadZones(): void {
    if (this.currentUserOrganizationId) {
    this.organizationService.getAllZones().subscribe({
      next: (zones) => {
          // Filtrar solo las zonas de la organización del usuario
          this.zones = zones.filter(zone => zone.organizationId === this.currentUserOrganizationId);
      }
    });
    }
  }

  getZoneNameById(zoneId: string): string {
    const zone = this.zones.find(z => z.zoneId === zoneId);
    return zone ? zone.zoneName : zoneId;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredPoints = this.points.filter(point => {
      const matchesSearch = !this.searchTerm || 
        point.pointCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        point.pointName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        point.locationDescription.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'todos' || point.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  getActivePointsCount(): number {
    return this.points.filter(point => point.status === Status.ACTIVE).length;
  }

  getInactivePointsCount(): number {
    return this.points.filter(point => point.status === Status.INACTIVE).length;
  }

  getPointTypeLabel(pointType: PointType): string {
    switch (pointType) {
      case PointType.RESERVORIO:
        return 'Reservorio';
      case PointType.RED_DISTRIBUCION:
        return 'Red de Distribución';
      case PointType.DOMICILIO:
        return 'Domicilio';
      default:
        return pointType;
    }
  }

  getStatusLabel(status: Status): string {
    return status === Status.ACTIVE ? 'Activo' : 'Inactivo';
  }

  getStatusClass(status: Status): string {
    return status === Status.ACTIVE 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  trackByPointId(index: number, point: testing_points): string {
    return point.id;
  }

  addNewPoint(): void {
    this.router.navigate(['/admin/water-quality/testing/new']);
  }

  editPoint(id: string): void {
    this.router.navigate(['/admin/water-quality/testingEdit', id]);
  }

  detailPoint(id: string): void {
    this.router.navigate(['/admin/water-quality/testingDetail', id]);
  }

  showSuccessAlert(message: string): void {
    this.alertType = 'success';
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.dismissAlert(), 5000);
  }

  showErrorAlert(message: string): void {
    this.alertType = 'error';
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.dismissAlert(), 5000);
  }

  showInfoAlert(message: string): void {
    this.alertType = 'info';
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.dismissAlert(), 5000);
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  confirmDelete(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará el punto de prueba.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.deletePoint(id);
      }
    });
  }

  deletePoint(id: string): void {
    this.waterQualityService.deleteTestingPoint(id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Punto de prueba desactivado',
          text: 'El punto ha sido desactivado correctamente.',
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'swal2-popup-custom' }
        }).then((result: any) => {
          if (result.isConfirmed) {
            this.loadPoints();
          }
        });
      },
      error: () => {
        this.showSwal('error', 'Error al desactivar el punto de prueba');
      }
    });
  }

  confirmRestore(id: string): void {
    Swal.fire({
      title: '¿Restaurar punto?',
      text: 'Esto reactivará el punto de prueba.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.restorePoint(id);
      }
    });
  }

  restorePoint(id: string): void {
    this.waterQualityService.restoreTestingPoint(id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Punto de prueba restaurado',
          text: 'El punto ha sido restaurado correctamente.',
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'swal2-popup-custom' }
        }).then((result: any) => {
          if (result.isConfirmed) {
            this.loadPoints();
          }
        });
      },
      error: () => {
        this.showSwal('error', 'Error al restaurar el punto de prueba');
      }
    });
  }

  showSwal(type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: message,
      timer: 1800,
      showConfirmButton: false
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}-${month}-${year}`;
  }

  getOrganizationName(organizationId: string): string {
    if (organizationId === this.currentUserOrganizationId) {
      // Obtener el nombre real de la organización usando el servicio
      this.organizationResolver.getOrganizationName(organizationId).subscribe({
        next: (organizationName) => {
          console.log('Nombre de organización cargado:', organizationName);
          // Aquí podrías actualizar la vista si fuera necesario
        },
        error: (error) => {
          console.error('Error al cargar nombre de organización:', error);
        }
      });
      
      // Por ahora retornamos un nombre genérico, pero en una implementación completa
      // podrías usar un observable o un estado local para mostrar el nombre real
      return `Organización ${organizationId}`;
    }
    return organizationId;
  }
}
