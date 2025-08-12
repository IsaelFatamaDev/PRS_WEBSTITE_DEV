import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { organization, zones, street, Status } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';

interface OrganizationStats {
  organization: organization;
  zoneCount: number;
  streetCount: number;
  totalStreets: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  organizations: organization[] = [];
  zones: zones[] = [];
  streets: street[] = [];
  loading = true;

  // Estadísticas generales
  totalOrganizations = 0;
  activeOrganizations = 0;
  inactiveOrganizations = 0;
  totalZones = 0;
  totalStreets = 0;

  // Estadísticas por organización
  organizationStats: OrganizationStats[] = [];

  // Datos para gráficos
  organizationStatusData = [
    { status: 'Activas', count: 0, color: 'bg-emerald-500' },
    { status: 'Inactivas', count: 0, color: 'bg-red-500' }
  ];

  // Top organizaciones por zonas
  topOrganizationsByZones: OrganizationStats[] = [];
  
  // Top organizaciones por calles
  topOrganizationsByStreets: OrganizationStats[] = [];

  constructor(private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Cargar organizaciones
    this.organizationService.getAllOrganization().subscribe({
      next: (data) => {
        this.organizations = data;
        this.calculateOrganizationStats();
      },
      error: (err) => console.error('Error cargando organizaciones:', err)
    });

    // Cargar zonas
    this.organizationService.getAllZones().subscribe({
      next: (data) => {
        this.zones = data;
        this.totalZones = data.length;
        this.calculateOrganizationStats();
      },
      error: (err) => console.error('Error cargando zonas:', err)
    });

    // Cargar calles
    this.organizationService.getAllStreet().subscribe({
      next: (data) => {
        this.streets = data;
        this.totalStreets = data.length;
        this.calculateOrganizationStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando calles:', err);
        this.loading = false;
      }
    });
  }

  calculateOrganizationStats(): void {
    if (this.organizations.length === 0 || this.zones.length === 0) return;

    this.totalOrganizations = this.organizations.length;
    this.activeOrganizations = this.organizations.filter(org => org.status === Status.ACTIVE).length;
    this.inactiveOrganizations = this.organizations.filter(org => org.status === Status.INACTIVE).length;
    
    this.organizationStatusData[0].count = this.activeOrganizations;
    this.organizationStatusData[1].count = this.inactiveOrganizations;

    // Calcular estadísticas por organización
    this.organizationStats = this.organizations.map(org => {
      const orgZones = this.zones.filter(zone => zone.organizationId === org.organizationId);
      const orgStreets = this.streets.filter(street => {
        return orgZones.some(zone => zone.zoneId === street.zoneId);
      });

      return {
        organization: org,
        zoneCount: orgZones.length,
        streetCount: orgStreets.length,
        totalStreets: orgStreets.length
      };
    });

    // Top organizaciones por zonas
    this.topOrganizationsByZones = [...this.organizationStats]
      .sort((a, b) => b.zoneCount - a.zoneCount)
      .slice(0, 5);

    // Top organizaciones por calles
    this.topOrganizationsByStreets = [...this.organizationStats]
      .sort((a, b) => b.streetCount - a.streetCount)
      .slice(0, 5);
  }

  getStatusClass(status: Status): string {
    return status === Status.ACTIVE 
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  getStatusLabel(status: Status): string {
    return status === Status.ACTIVE ? 'Activa' : 'Inactiva';
  }

  getZoneCountClass(count: number): string {
    if (count === 0) return 'text-gray-500 dark:text-gray-400';
    if (count <= 3) return 'text-blue-600 dark:text-blue-400';
    if (count <= 6) return 'text-purple-600 dark:text-purple-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }

  getStreetCountClass(count: number): string {
    if (count === 0) return 'text-gray-500 dark:text-gray-400';
    if (count <= 10) return 'text-blue-600 dark:text-blue-400';
    if (count <= 25) return 'text-purple-600 dark:text-purple-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }
}
