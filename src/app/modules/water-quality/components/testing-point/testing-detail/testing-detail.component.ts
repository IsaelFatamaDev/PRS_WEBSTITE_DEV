import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { testing_points, PointType, Status } from '../../../../../core/models/water-quality.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { organization, zones } from '../../../../../core/models/organization.model';

@Component({
  selector: 'app-testing-detail',
  imports: [CommonModule],
  templateUrl: './testing-detail.component.html',
  styleUrl: './testing-detail.component.css'
})
export class TestingDetailComponent implements OnInit {
  point: testing_points | null = null;
  loading = false;
  zonas: zones[] = [];
  organizations: organization[] = [];
  constructor(
    private waterQualityService: WaterQualityService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPoint();
    this.loadZones();
    this.loadOrganizations();
  }

  private loadPoint(): void {
    this.loading = true;
    const pointId = this.route.snapshot.paramMap.get('id');
    
    if (pointId) {
      this.waterQualityService.getPointstById(pointId).subscribe({
        next: (point) => {
          this.point = point;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar el punto de prueba:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadZones() {
    this.organizationService.getAllZones().subscribe({
      next: (zonas) => {
        console.log('Organizaciones cargados:', zonas);
        this.zonas = zonas;
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
      }
    });
  }

  loadOrganizations() {
    this.organizationService.getAllOrganization().subscribe({
      next: (organizations) => {
        console.log('Organizaciones cargados:', organizations);
        this.organizations = organizations;
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
      }
    });
  }

  getOrganizationName(organizationId: string): string {
    const organization = this.organizations.find(org => org.organizationId === organizationId);
    return organization ? organization.organizationName : organizationId;
  }

  getZonaName(zonesId: string): string {
    const zona = this.zonas.find(zon => zon.zoneId === zonesId);
    return zona ? zona.zoneName : zonesId;
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

  goBack(): void {
    this.router.navigate(['/admin/water-quality/testing']);
  }

  editPoint(): void {
    if (this.point) {
      this.router.navigate(['/admin/water-quality/testingEdit', this.point.id]);
    }
  }
}
