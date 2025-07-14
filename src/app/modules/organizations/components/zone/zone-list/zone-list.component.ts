import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { zones, Status, organization } from '../../../../../core/models/organization.model';
import { OrganizationService } from '../../../../../core/services/organization.service';

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zone-list.component.html',
  styleUrl: './zone-list.component.css'
})
export class ZoneListComponent implements OnInit {
  zones: zones[] = [];
  filteredZones: zones[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'activo';
  loading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  organizations:organization[]=[];
  constructor(
    private organizationService: OrganizationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadZones();
    this.loadOrganizations();
    
  }

  loadZones() {
    this.loading = true;
    this.organizationService.getAllZones().subscribe({
      next: (data) => {
        this.zones = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar zonas', err);
        this.loading = false;
        this.showAlertMessage('Error al cargar zonas', 'error');
      }
    });
  }

  loadOrganizations() {
    this.organizationService.getAllOrganization().subscribe({
      next: (data) => {
        this.organizations = data.filter(org => org.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar organizaciones', err);
        Swal.fire('Error', 'No se pudieron cargar las organizaciones', 'error');
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
    this.filteredZones = this.zones.filter(zone => {
      // Filtro de búsqueda
      const matchesSearch = this.searchTerm === '' ||
        zone.zoneCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        zone.zoneName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        zone.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro de estado
      const matchesStatus = (this.selectedStatus === 'activo' && zone.status === Status.ACTIVE) ||
        (this.selectedStatus === 'inactivo' && zone.status === Status.INACTIVE);

      return matchesSearch && matchesStatus;
    });
  }

  deleteZone(zone: zones): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la zona "${zone.zoneName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.organizationService.deleteZones(zone.zoneId).subscribe({
          next: () => {
            const zoneIndex = this.zones.findIndex(z => z.zoneId === zone.zoneId);
            if (zoneIndex !== -1) {
              this.zones[zoneIndex].status = Status.INACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Zona ${zone.zoneName} eliminada correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al eliminar zona:', error);
            this.showAlertMessage('Error al eliminar zona', 'error');
          }
        });
      }
    });
  }

  restoreZone(zone: zones): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas restaurar la zona "${zone.zoneName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.organizationService.restoreZones(zone.zoneId).subscribe({
          next: () => {
            const zoneIndex = this.zones.findIndex(z => z.zoneId === zone.zoneId);
            if (zoneIndex !== -1) {
              this.zones[zoneIndex].status = Status.ACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Zona ${zone.zoneName} restaurada correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al restaurar zona:', error);
            this.showAlertMessage('Error al restaurar zona', 'error');
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

  editZone(zoneId: string): void {
    this.router.navigate(['/super-admin/organizations/zonas/edit', zoneId]);
  }

  addNewZone(): void {
    this.router.navigate(['/super-admin/organizations/zonas/new']);
  }

  getStatusClass(status: Status): string {
    return status === Status.ACTIVE ?
      'bg-green-100 text-green-800' :
      'bg-red-100 text-red-800';
  }

  getNameOrganization(organizationId:string): string{
    const organizacion = this.organizations.find(o =>o.organizationId === organizationId);
    return organizacion?organizacion.organizationName:organizationId;
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  trackByZoneId(index: number, zone: zones): string {
    return zone.zoneId;
  }

  getActiveZoneCount(): number {
    return Array.isArray(this.zones) ?
      this.zones.filter(z => z.status === Status.ACTIVE).length : 0;
  }

  getInactiveZoneCount(): number {
    return Array.isArray(this.zones) ?
      this.zones.filter(zone => zone.status === Status.INACTIVE).length : 0;
  }
} 