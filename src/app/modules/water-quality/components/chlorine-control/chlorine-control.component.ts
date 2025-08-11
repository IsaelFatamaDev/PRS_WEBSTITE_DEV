import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { dayliRecors, testing_points } from '../../../../core/models/water-quality.model';
import { WaterQualityService } from '../../../../core/services/water-quality.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../../../core/services/organization.service';
import { organization } from '../../../../core/models/organization.model';

@Component({
  selector: 'app-chlorine-control',
  imports: [CommonModule,FormsModule],
  templateUrl: './chlorine-control.component.html',
  styleUrl: './chlorine-control.component.css'
})
export class ChlorineControlComponent implements OnInit {
  chlorine: dayliRecors[] = [];
  filteredchlorine: dayliRecors[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = 'todos';
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  testingPoints:testing_points[]=[];
  organizations:organization[]=[];
  constructor(
    private waterQualityService: WaterQualityService,
    private organizationService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChlorine();
    this.loadTestingPoints();
    this.loadOrganizations();
  }

  loadChlorine(): void {
    this.loading = true;
    this.waterQualityService.getAllChlorine().subscribe({
      next: (data) => {
        console.log('✅ Datos de cloro recibidos:', data);  // 👈 Aquí ves cómo llegan los datos
        this.chlorine = data;
        this.filteredchlorine = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar registros:', error);
        this.showAlertMessage('Error al cargar los registros', 'error');
        this.loading = false;
      }
    });
  }


  getTestingPointName(testingPointId: string): string {
    const point = this.testingPoints.find(p => p.id === testingPointId);
    return point ? point.pointName : testingPointId;
  }

  getOrganizationName(organizationId: string): string{
    const organization = this.organizations.find(o => o.organizationId === organizationId);
    return organization ? organization.organizationName : organizationId
  }

  onSearch(): void {
    this.filterRecords();
  }

  onStatusChange(): void {
    this.filterRecords();
  }

  filterRecords(): void {
    this.filteredchlorine = this.chlorine.filter(record => {
      const matchesSearch = !this.searchTerm || 
        record.recordCode.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'todos' ||
        (this.selectedStatus === 'aceptable' && record.acceptable) ||
        (this.selectedStatus === 'no-aceptable' && !record.acceptable);

      return matchesSearch && matchesStatus;
    });
  }

  loadTestingPoints(): void {
    this.waterQualityService.getAllTestingPoints().subscribe({
      next: (points) => {
        console.log('Puntos de prueba cargados:', points);
        this.testingPoints = points;
      },
      error: (error) => {
        console.error('Error al cargar los puntos de prueba:', error);
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

  addNewChlorine(): void {
    this.router.navigate(['/admin/water-quality/new']);
  }

  editChlorine(id: string): void {
    this.router.navigate(['/admin/water-quality/edit', id]);
  }
  detailchlorine(id:string):void{
    this.router.navigate(['/admin/water-quality/detail', id])
  }

  deleteChlorine(chlorine: dayliRecors): void {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.waterQualityService.deleteChlorine(chlorine.id).subscribe({
        next: () => {
          this.showAlertMessage('Registro eliminado exitosamente', 'success');
          this.loadChlorine();
        },
        error: (error) => {
          console.error('Error al eliminar registro:', error);
          this.showAlertMessage('Error al eliminar el registro', 'error');
        }
      });
    }
  }

  getAcceptableLabel(acceptable: boolean): string {
    return acceptable ? 'True' : 'False';
  }

  getAcceptableClass(acceptable: boolean): string {
    return acceptable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getActionRequiredLabel(required: boolean): string {
    return required ? 'Sí' : 'No';
  }

  getActionRequiredClass(required: boolean): string {
    return required 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-gray-100 text-gray-800';
  }

  getActiveRecordsCount(): number {
    return this.chlorine.filter(record => record.acceptable).length;
  }

  getInactiveRecordsCount(): number {
    return this.chlorine.filter(record => !record.acceptable).length;
  }

  showAlertMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.dismissAlert();
    }, 5000);
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  trackByChlorineId(index: number, chlorine: dayliRecors): string {
    return chlorine.id;
  }

  trackByOrganizationId(index: number, organization: organization): string {
    return organization.organizationId;
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
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  }

}
