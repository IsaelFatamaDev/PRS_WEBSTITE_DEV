import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QualityIncident, testing_points } from '../../../../../core/models/water-quality.model';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-quality-detail',
  templateUrl: './quality-detail.component.html',
  imports: [CommonModule,ReactiveFormsModule,RouterModule,NgClass],
})
export class QualityDetailComponent implements OnInit {
  incident: QualityIncident | null = null;
  loading = true;
  error: string | null = null;
  testingPoints: testing_points[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private waterQualityService: WaterQualityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIncident(id);
      this.loadTestingPoints();
    }
  }


  getTestingPointName(testingPointId: string): string {
    const point = this.testingPoints.find(p => p.id === testingPointId);
    return point ? point.pointName : testingPointId;
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

  loadIncident(id: string): void {
    this.loading = true;
    this.waterQualityService.getIncidentById(id).subscribe({
      next: (incident) => {
        this.incident = incident;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el incidente';
        this.loading = false;
        console.error('Error loading incident:', error);
      }
    });
  }

  editIncident(): void {
    if (this.incident) {
      this.router.navigate(['/water-quality/incidents/edit', this.incident.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/water-quality/incident']);
  }
}
