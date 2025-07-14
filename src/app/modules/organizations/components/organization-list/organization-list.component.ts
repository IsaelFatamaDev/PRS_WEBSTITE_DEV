import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { organization, Status } from '../../../../core/models/organization.model';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-organization-list',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.css'
})
export class OrganizationListComponent implements OnInit{
  organizations: organization[] = [];
  filteredOrganizations: organization[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'activo';
  loading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success'|'error'|'info' = 'success';

  constructor(
    private organizationService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {   
    this.loadOrganizations();
  }

  loadOrganizations() {
  this.organizationService.getAllOrganization().subscribe({
    next: (data) => {
      this.organizations = data;
      this.applyFilters();
    },
    error: (err) => {
      console.error('Error al cargar organizaciones', err);
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
    this.filteredOrganizations = this.organizations.filter(organization => {
      // Filtro de búsqueda
      const matchesSearch = this.searchTerm === '' ||
        organization.organizationCode.toLowerCase().includes(this.searchTerm.toLowerCase())||
        organization.organizationName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        organization.legalRepresentative.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        organization.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        organization.phone.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro de estado
      const matchesStatus = (this.selectedStatus === 'activo' && organization.status === Status.ACTIVE) ||
        (this.selectedStatus === 'inactivo' && organization.status === Status.INACTIVE);

      return matchesSearch && matchesStatus;
    });
  }

  deleteOrganization(organization: organization): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la organización "${organization.organizationName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.organizationService.deleteOrganization(organization.organizationId).subscribe({
          next: () => {
            const organizationIndex = this.organizations.findIndex(o => o.organizationId === organization.organizationId);
            if (organizationIndex !== -1) {
              this.organizations[organizationIndex].status = Status.INACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Organización ${organization.organizationName} eliminada correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al eliminar organización:', error);
            this.showAlertMessage('Error al eliminar organización', 'error');
          }
        });
      }
    });
  }

  restoreOrganization(organization: organization): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas restaurar la organización "${organization.organizationName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.organizationService.restoreOrganization(organization.organizationId).subscribe({
          next: () => {
            const organizationIndex = this.organizations.findIndex(o => o.organizationId === organization.organizationId);
            if (organizationIndex !== -1) {
              this.organizations[organizationIndex].status = Status.ACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Organización ${organization.organizationName} restaurada correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al restaurar organización:', error);
            this.showAlertMessage('Error al restaurar organización', 'error');
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

  editOrganization(organizationId: string): void {
    this.router.navigate(['/super-admin/organizations/edit', organizationId]);
  }
  
  addNewOrganization(): void {
    this.router.navigate(['/super-admin/organizations/new']);
  }

  getStatusClass(status: Status): string {
    return status === Status.ACTIVE ?
      'bg-green-100 text-green-800' :
      'bg-red-100 text-red-800';
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  trackByOrganizationId(index: number, organization: organization): string {
    return organization.organizationId;
  }


  getActiveOrganizationCount(): number {
    return Array.isArray(this.organizations) ? 
      this.organizations.filter(o => o.status === Status.ACTIVE).length : 0;
  }

  getInactiveOrganizationCount(): number {
    return Array.isArray(this.organizations) ? 
      this.organizations.filter(organization => organization.status === Status.INACTIVE).length : 0;
  }
}
