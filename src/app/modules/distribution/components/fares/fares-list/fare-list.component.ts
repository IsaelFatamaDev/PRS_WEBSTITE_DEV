import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { OrganizationService } from '../../../../../core/services/organization.service';
import { DistributionService } from '../../../../../core/services/distribution.service';
import { fares } from '../../../../../core/models/distribution.model';
import { organization } from '../../../../../core/models/organization.model';
import { Status } from '../../../../../core/models/payment.model';

@Component({
  selector: 'app-fare-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './fare-list.component.html',
  styleUrls: ['./fare-list.component.css']
})
export class FareListComponent implements OnInit {
  fares: fares[] = [];
  filteredFares: fares[] = [];
  organizations: organization[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'activo';
  loading: boolean = false;

  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';

  constructor(
    private organizationService: OrganizationService,
    private distributionService: DistributionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFares();
    this.loadOrganizations();
  }

  loadFares(): void {
    this.loading = true;

    const request$ = this.selectedStatus === 'activo'
      ? this.distributionService.getAllActiveF()
      : this.distributionService.getAllInactiveF();

    request$.subscribe({
      next: (data) => {
        this.fares = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar tarifas', err);
        this.loading = false;
      }
    });
  }

  loadOrganizations(): void {
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
    this.loadFares();
  }

  private applyFilters(): void {
    this.filteredFares = this.fares.filter(fare => {
      const matchesSearch = this.searchTerm === '' ||
        fare.fareCode?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fare.fareName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fare.fareType?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        (this.selectedStatus === 'activo' && fare.status === Status.ACTIVE) ||
        (this.selectedStatus === 'inactivo' && fare.status === Status.INACTIVE) ||
        this.selectedStatus === 'todos';

      return matchesSearch && matchesStatus;
    });
  }

  deactivateFare(fare: fares): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la tarifa "${fare.fareName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.distributionService.deactivateFares(fare.id).subscribe({
          next: () => {
            fare.status = Status.INACTIVE;
            this.applyFilters();
            this.showAlertMessage(`Tarifa ${fare.fareName} eliminada correctamente`, 'success');
          },
          error: (err) => {
            console.error('Error al eliminar tarifa', err);
            this.showAlertMessage('Error al eliminar tarifa', 'error');
          }
        });
      }
    });
  }

  activateFare(fare: fares): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas restaurar la tarifa "${fare.fareName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.distributionService.activateFares(fare.id).subscribe({
          next: () => {
            fare.status = Status.ACTIVE;
            this.applyFilters();
            this.showAlertMessage(`Tarifa ${fare.fareName} restaurada correctamente`, 'success');
          },
          error: (err) => {
            console.error('Error al restaurar tarifa', err);
            this.showAlertMessage('Error al restaurar tarifa', 'error');
          }
        });
      }
    });
  }

  editFare(fareId: string): void {
    this.router.navigate(['/admin/distribution/fares/edit', fareId]);
  }

  addNewFare(): void {
    this.router.navigate(['/admin/distribution/fares/new']);
  }

  getStatusClass(status: string): string {
    return status === Status.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusLabel(status: string): string {
    return status === Status.ACTIVE ? 'Activo' : 'Inactivo';
  }

  getActiveFareCount(): number {
    return this.fares.filter(f => f.status === Status.ACTIVE).length;
  }

  getInactiveFareCount(): number {
    return this.fares.filter(f => f.status === Status.INACTIVE).length;
  }

  getNameOrganization(organizationId: string): string {
    const org = this.organizations.find(o => o.organizationId === organizationId);
    return org ? org.organizationName : organizationId;
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  trackByFareId(index: number, fare: fares): string {
    return fare.id;
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
