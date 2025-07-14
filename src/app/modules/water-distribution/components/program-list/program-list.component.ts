import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DistributionProgram } from '../../../../core/models/water-distribution.model';
import { DistributionService } from '../../../../core/services/distribution.service';
import { User, UserResponseDTO } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { organization } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';
import { FormsModule } from '@angular/forms';
import { ProgramsService } from '../../../../core/services/water-distribution.service';
import { routes, schedules } from '../../../../core/models/distribution.model';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class ProgramListComponent implements OnInit {
  programs: DistributionProgram[] = [];
  filteredPrograms: DistributionProgram[] = [];
  routes: routes[] = [];
  schedules: schedules[] = [];
  users: UserResponseDTO[] = [];
  organization: organization[] = [];
  loading = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'info' = 'info';
  alertMessage = '';
  searchTerm = '';
  selectedStatus = 'todos';

  constructor(
    private programsService: ProgramsService,
    private distributionService: DistributionService,
    private UserService: UserService,
    private OrganizationService: OrganizationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPrograms();
    this.loadRoutes();
    this.loadSchedules();
    this.loadUsers();
    this. loadOrganizations();
  }

  private loadPrograms(): void {
    this.loading = true;
    this.programsService.getAllPrograms().subscribe({
      next: (programList) => {
        this.programs = programList;
        this.filteredPrograms = programList;
        this.loading = false;
      },
      error: (error) => {
        this.handleError('Error al cargar los programas', error);
        this.loading = false;
      }
    });
  }

  private loadRoutes(): void {
    this.distributionService.getAllR().subscribe({
      next: (data: routes[]) => this.routes = data,
      error: (error: any) => console.error('Error al cargar rutas:', error)
    });
  }

  private loadSchedules(): void {
    this.distributionService.getAll().subscribe({
      next: (data: schedules[]) => this.schedules = data,
      error: (error: any) => console.error('Error al cargar horarios:', error)
    });
  }

  private loadUsers(): void {
    this.UserService.getAllUsers().subscribe({
      next: (data: UserResponseDTO[]) => {
        console.log('Usuarios cargados:', data); // <- Agrega esto
        this.users = data;
      },
      error: (error: any) => console.error('Error al cargar usuarios:', error)
    });
  }

  private loadOrganizations(): void {
    this.OrganizationService.getAllOrganization().subscribe({
      next: (data: organization[]) => {
        console.log('Organizaciones cargados:', data); // <- Agrega esto
        this.organization = data;
      },
      error: (error: any) => console.error('Error al cargar organizaciones:', error)
    });
  }

  onSearch(): void {
    this.filterPrograms();
  }

  onStatusChange(): void {
    this.filterPrograms();
  }

  private filterPrograms(): void {
    this.filteredPrograms = this.programs.filter(program => {
      const matchesSearch = !this.searchTerm ||
        program.programCode.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'todos' ||
        program.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  getAcceptableProgramsCount(): number {
    return this.programs.filter(p => p.status === 'COMPLETED').length;
  }

  getResponsibleName(responsibleUserId: string): string {
  const user = this.users.find(u => u.fullName === responsibleUserId);
  return user ? user.fullName : responsibleUserId;
}



  getWarningProgramsCount(): number {
    return this.programs.filter(p => p.status === 'IN_PROGRESS').length;
  }

  getCriticalProgramsCount(): number {
    return this.programs.filter(p => p.status === 'CANCELLED').length;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PLANNED': return 'PLANIFICADO';
      case 'IN_PROGRESS': return 'EN CURSO';
      case 'COMPLETED': return 'TERMINADO';
      case 'CANCELLED': return 'CANCELADO';
      default: return 'DESCONOCIDO';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

viewProgramsDetail(id: string): void {
  this.router.navigate(['/admin/distribution/programs/view', id]);
}


  updatePrograms(id: string): void {
   this.router.navigate(['/admin/distribution/programs/edit', id]);
  }

  addNewPrograms(): void {
   this.router.navigate(['/admin/distribution/programs/new']);
  }

  trackByProgramsId(index: number, program: DistributionProgram): string {
    return program.id;
  }

  getOrganizationName(organizationId: string): string {
    const organization = this.organization.find(o => o.organizationId === organizationId);
    return organization ? organization.organizationName : organizationId;
  }

  getRouteName(routeId: string): string {
    const route = this.routes.find(r => r.id === routeId);
    return route ? route.routeName : routeId;
  }

  getScheduleName(scheduleId: string): string {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    return schedule ? schedule.scheduleName : scheduleId;
  }


  dismissAlert(): void {
    this.showAlert = false;
  }

  private handleError(message: string, error: any): void {
    console.error('Error:', error);
    this.showAlert = true;
    this.alertType = 'error';
    this.alertMessage = message;
  }
}
