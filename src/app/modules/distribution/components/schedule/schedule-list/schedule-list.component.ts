import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { DistributionService } from '../../../../../core/services/distribution.service';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { schedules } from '../../../../../core/models/distribution.model';
import { organization, zones } from '../../../../../core/models/organization.model';
import { Status } from '../../../../../core/models/payment.model';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-list.component.html'
})
export class ScheduleListComponent implements OnInit {
  schedules: schedules[] = [];
  filteredSchedules: schedules[] = [];
  organizations: organization[] = [];
  zones: zones[] = [];

  searchTerm: string = '';
  selectedStatus: string = 'activo';

  loading: boolean = false;
  showAlert: boolean = false;
  alertType: 'success' | 'error' | 'info' = 'success';
  alertMessage: string = '';

  constructor(
    private distributionService: DistributionService,
    private organizationService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
    this.loadOrganizations();
    this.loadZones();
  }

  loadSchedules(): void {
    this.distributionService.getAll().subscribe({
      next: (data) => {
        this.schedules = Array.isArray(data) ? data : [];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al cargar horarios', err);
        this.schedules = [];
      }
    });
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganization().subscribe({
      next: (data) => {
        this.organizations = data.filter(o => o.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar organizaciones', err);
        Swal.fire('Error', 'No se pudieron cargar las organizaciones', 'error');
      }
    });
  }

  loadZones(): void {
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

  private applyFilters(): void {
    const searchTermLower = this.searchTerm.toLowerCase();

    this.filteredSchedules = this.schedules.filter(s => {
      const matchesSearch =
        s.scheduleCode.toLowerCase().includes(searchTermLower) ||
        s.scheduleName.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        (this.selectedStatus === 'activo' && s.status === Status.ACTIVE) ||
        (this.selectedStatus === 'inactivo' && s.status === Status.INACTIVE);

      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }
  
  

  getStatusLabel(status: string): string {
    return status === Status.ACTIVE ? 'Activo' : 'Inactivo';
  }

  deactivateSchedules(schedule: schedules): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el horario "${schedule.scheduleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        this.distributionService.deactivateSchedules(schedule.id).subscribe({
          next: () => {
            schedule.status = Status.INACTIVE;
            this.applyFilters();
            this.showAlertMessage(`Horario "${schedule.scheduleName}" eliminado correctamente`, 'success');
          },
          error: (err) => {
            console.error('Error al eliminar el horario:', err);
            this.showAlertMessage('Error al eliminar el horario', 'error');
          }
        });
      }
    });
  }

  activateSchedules(schedule: schedules): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas restaurar el horario "${schedule.scheduleName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) {
        this.distributionService.activateSchedules(schedule.id).subscribe({
          next: () => {
            schedule.status = Status.ACTIVE;
            this.applyFilters();
            this.showAlertMessage(`Horario "${schedule.scheduleName}" restaurado correctamente`, 'success');
          },
          error: (err) => {
            console.error('Error al restaurar el horario:', err);
            this.showAlertMessage('Error al restaurar el horario', 'error');
          }
        });
      }
    });
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

editSchedule(scheduleCode: string) {
  this.router.navigate(['/admin/distribution/schedule/edit', scheduleCode]);
}



addNewSchedule() {
  console.log('Navegando a formulario');
  this.router.navigate(['/admin/distribution/schedule/new']);
}


  getStatusClass(status: string): string {
    return status === Status.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getNameZone(id: string): string {
    const zone = this.zones.find(z => z.zoneId === id);
    return zone?.zoneName ?? 'Zona desconocida';
  }

  getNameOrganization(id: string): string {
    const org = this.organizations.find(o => o.organizationId === id);
    return org?.organizationName ?? 'Org. desconocida';
  }

  trackByScheduleId(index: number, item: schedules): string {
    return item.scheduleCode;
  }

  getActiveSCount(): number {
    return this.schedules.filter(s => s.status === Status.ACTIVE).length;
  }

  getInactiveSCount(): number {
    return this.schedules.filter(s => s.status === Status.INACTIVE).length;
  }
}
