import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterQualityService } from '../../../../../core/services/water-quality.service';
import { QualityTest, testing_points } from '../../../../../core/models/water-quality.model';


@Component({
  selector: 'app-analysis-detail',
  templateUrl: './analysis-detail.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class AnalysisDetailComponent implements OnInit {
  analysis: QualityTest | null = null;
  loading = false;
  error = false;
  errorMessage = '';
  testingPoints: testing_points[] = [];

  constructor(
    private waterQualityService: WaterQualityService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID obtenido de la ruta:', id);
    if (id) {
      this.loadAnalysis(id);
    } else {
      this.handleError('ID de análisis no proporcionado');
    }
    this.loadTestingPoints();
  }

  getTestingPointName(testingPointId: string): string {
    const point = this.testingPoints.find(p => p.id === testingPointId);
    return point ? point.pointName : testingPointId;
  }
  
  private loadAnalysis(id: string): void {
    this.loading = true;
    this.error = false;
    console.log('Iniciando carga del análisis con ID:', id);
    

   

    this.waterQualityService.getTestById(id).subscribe({
      next: (response: QualityTest) => {
        console.log('Respuesta completa del servicio:', response);
        
        if (!response) {
          console.error('La respuesta del servicio está vacía');
          this.handleError('No se encontró el análisis solicitado');
          return;
        }

        try {
          console.log('Datos del análisis:', response);
          this.analysis = response;
          this.loading = false;
        } catch (error) {
          console.error('Error al procesar la respuesta:', error);
          this.handleError('Error al procesar los datos del análisis');
        }
      },
      error: (error: any) => {
        console.error('Error en la llamada al servicio:', error);
        let errorMessage = 'Error al cargar el análisis';
        
        if (error.status === 404) {
          errorMessage = 'El análisis solicitado no existe';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.handleError(errorMessage, error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTABLE':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ACCEPTABLE':
        return 'Aceptable';
      case 'WARNING':
        return 'Advertencia';
      case 'CRITICAL':
        return 'Crítico';
      default:
        return 'Pendiente';
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/water-quality/test']);
  }

  private handleError(message: string, error?: any): void {
    console.error('Error en el componente:', error);
    this.error = true;
    this.errorMessage = message;
    this.loading = false;
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
}
