import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { dayliRecors, testing_points } from '../../../../../core/models/water-quality.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { UserService } from '../../../../../core/services/user.service';
import { UserResponseDTO } from '../../../../../core/models/user.model';
import { organization } from '../../../../../core/models/organization.model';

@Component({
  selector: 'app-chlorine-detail',
  standalone: true,
  imports: [CommonModule],
templateUrl: './chlorine-detail.component.html',
  styleUrl: './chlorine-detail.component.css'
})
export class ChlorineDetailComponent implements OnInit {
  chlorine: dayliRecors | null = null;
  loading = false;
  error = false;
  errorMessage = '';
  testingPoints:testing_points[]=[];
  users :UserResponseDTO[]=[];
  organizations:organization[]=[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qualityService: WaterQualityService,
    private usuariosService:UserService,
    private organizationService:OrganizationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadChlorine(id);
    }
    this.loadTestingPoints();
    this.loadOrganizations();
    this.loadUsers();
  }

  private loadChlorine(id: string): void {
    this.loading = true;
    this.qualityService.getChlorineById(id).subscribe({
      next: (data) => {
        this.chlorine = data;
        this.loading = false;
        console.log('Datos del registro:', data);
      },
      error: (error) => {
        console.error('Error al cargar el registro:', error);
        this.error = true;
        this.errorMessage = 'Error al cargar el registro';
        this.loading = false;
      }
    });
  }
  
  loadOrganizations(): void {
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

  getOrganizationName(organizationId :string):string{
    const organization = this.organizations.find(o => o.organizationId === organizationId);
    return organization ? organization.organizationName : organizationId
  }

  getTestingPointName(testingPointId: string): string {
    const point = this.testingPoints.find(p => p.id === testingPointId);
    return point ? point.pointName : testingPointId;
  }

  getUserName(usersId : string):string{
    const user = this.users.find(u => u.id === usersId);
    return user ? user.username : usersId;
  }

  loadTestingPoints(): void {
    this.qualityService.getAllTestingPoints().subscribe({
      next: (points) => {
        console.log('Puntos de prueba cargados:', points);
        this.testingPoints = points;
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
      }
    });
  }
loadUsers() {
  this.usuariosService.getAllUsers().subscribe({
    next: (response) => {
      this.users = response;
      console.log('Usuarios cargados:', this.users);
    },
  });
}


  getStatusClass(acceptable: boolean): string {
    return acceptable 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  }

  getStatusText(acceptable: boolean): string {
    return acceptable ? 'Aceptable' : 'No Aceptable';
  }

  getActionClass(required: boolean): string {
    return required 
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  }

  getActionText(required: boolean): string {
    return required ? 'Se requiere acción' : 'No requiere acción';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/water-quality']);
  }

}
