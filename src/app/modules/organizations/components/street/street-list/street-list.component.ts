import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { street, Status, zones } from '../../../../../core/models/organization.model';
import { OrganizationService } from '../../../../../core/services/organization.service';

@Component({
  selector: 'app-street-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './street-list.component.html',
  styleUrl: './street-list.component.css'
})
export class StreetListComponent implements OnInit {
  streets: street[] = [];
  filteredStreets: street[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'activo';
  loading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  zones: zones[] = [];

  constructor(
    private organizationService: OrganizationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStreets();
    this.loadZones();
  }

  loadStreets() {
    this.loading = true;
    this.organizationService.getAllStreet().subscribe({
      next: (data) => {
        this.streets = data;
        this.filteredStreets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar calles', err);
        this.loading = false;
        this.showAlertMessage('Error al cargar calles', 'error');
      }
    });
  }

  loadZones() {
    this.organizationService.getAllZones().subscribe({
      next: (data) => {
        this.zones = data.filter(z => z.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar zonas', err);
        Swal.fire('Error', 'No se pudieron cargar las zonas', 'error');
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  getStatusLabel(status: Status): string {
    return status === Status.ACTIVE ? 'Activo' : 'Inactivo';
  }

  private applyFilters(): void {
    this.filteredStreets = this.streets.filter(street => {
      // Filtro de búsqueda
      const matchesSearch = this.searchTerm === '' ||
        street.streetCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        street.streetName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        street.streetType.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro de estado
      const matchesStatus = (this.selectedStatus === 'activo' && street.status === Status.ACTIVE) ||
        (this.selectedStatus === 'inactivo' && street.status === Status.INACTIVE);

      return matchesSearch && matchesStatus;
    });
  }

  deleteStreet(street: street): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la calle "${street.streetName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.organizationService.deleteStreet(street.streetId).subscribe({
          next: () => {
            const streetIndex = this.streets.findIndex(s => s.streetId === street.streetId);
            if (streetIndex !== -1) {
              this.streets[streetIndex].status = Status.INACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Calle ${street.streetName} eliminada correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al eliminar calle:', error);
            this.showAlertMessage('Error al eliminar calle', 'error');
          }
        });
      }
    });
  }

  restoreStreet(street: street): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas restaurar la calle "${street.streetName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.organizationService.restoreStreet(street.streetId).subscribe({
          next: () => {
            const streetIndex = this.streets.findIndex(s => s.streetId === street.streetId);
            if (streetIndex !== -1) {
              this.streets[streetIndex].status = Status.ACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Calle ${street.streetName} restaurada correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al restaurar calle:', error);
            this.showAlertMessage('Error al restaurar calle', 'error');
          }
        });
      }
    });
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  editStreet(streetId: string): void {
    this.router.navigate(['/super-admin/organizations/street/edit', streetId]);
  }

  addNewStreet(): void {
    this.router.navigate(['/super-admin/organizations/street/new']);
  }

  getStatusClass(status: Status): string {
    return status === Status.ACTIVE ?
      'bg-green-100 text-green-800' :
      'bg-red-100 text-red-800';
  }

  getNameZone(zoneId: string): string {
    const zone = this.zones.find(z => z.zoneId === zoneId);
    return zone ? zone.zoneName : zoneId;
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  trackByStreetId(index: number, street: street): string {
    return street.streetId;
  }

  getActiveStreetCount(): number {
    return Array.isArray(this.streets) ?
      this.streets.filter(s => s.status === Status.ACTIVE).length : 0;
  }

  getInactiveStreetCount(): number {
    return Array.isArray(this.streets) ?
      this.streets.filter(street => street.status === Status.INACTIVE).length : 0;
  }
}
