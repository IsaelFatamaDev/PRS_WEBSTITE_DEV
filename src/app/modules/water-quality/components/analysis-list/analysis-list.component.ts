import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QualityTest, testing_points } from '../../../../core/models/water-quality.model';
import { WaterQualityService } from '../../../../core/services/water-quality.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-analysis-list',
  templateUrl: './analysis-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AnalysisListComponent implements OnInit {
  analyses: QualityTest[] = [];
  filteredAnalyses: QualityTest[] = [];
  loading = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'info' = 'info';
  alertMessage = '';
  searchTerm = '';
  selectedAnalysisType = 'todos';
  selectedStatus = 'todos';
  testingPoints: testing_points[] = [];

  constructor(
    private waterQualityService: WaterQualityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnalyses();
    this.loadTestingPoints();
  }

  private loadAnalyses(): void {
    this.loading = true;
    this.waterQualityService.getAllTest().subscribe({
      next: (analyses) => {
        this.analyses = analyses;
        this.filteredAnalyses = analyses;
        this.loading = false;
      },
      error: (error) => {
        this.handleError('Error al cargar los análisis', error);
        this.loading = false;
      }
    });
  }
  
  onSearch(): void {
    this.filterAnalyses();
  }

  onAnalysisTypeChange(): void {
    this.filterAnalyses();
  }

  onStatusChange(): void {
    this.filterAnalyses();
  }

  private filterAnalyses(): void {
    this.filteredAnalyses = this.analyses.filter(analysis => {
      const testingPointName = this.getTestingPointName(analysis.testingPointId);
      const matchesSearch = !this.searchTerm || 
        analysis.testCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        testingPointName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = this.selectedAnalysisType === 'todos' || 
        analysis.testType === this.selectedAnalysisType;

      const matchesStatus = this.selectedStatus === 'todos' || 
        this.getStatusText(analysis) === this.selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  getAcceptableAnalysesCount(): number {
    return this.analyses.filter(analysis => 
      this.getStatusText(analysis) === 'ACCEPTABLE'
    ).length;
  }

  getWarningAnalysesCount(): number {
    return this.analyses.filter(analysis => 
      this.getStatusText(analysis) === 'WARNING'
    ).length;
  }

  getCriticalAnalysesCount(): number {
    return this.analyses.filter(analysis => 
      this.getStatusText(analysis) === 'CRITICAL'
    ).length;
  }

  getStatusText(analysis: QualityTest): string {
    if (!analysis || !analysis.results || analysis.results.length === 0) {
      return 'PENDIENTE';
    }

    const hasCritical = analysis.results.some(result => result.status === 'CRITICAL');
    const hasWarning = analysis.results.some(result => result.status === 'WARNING');

    if (hasCritical) return 'CRITICAL';
    if (hasWarning) return 'WARNING';
    return 'ACCEPTABLE';
  }

  getStatusClass(analysis: QualityTest): string {
    const status = this.getStatusText(analysis);
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

  viewAnalysisDetail(id: string): void {
    this.router.navigate(['/admin/water-quality/testDetail', id]);
  }

  addNewAnalysis(): void {
    this.router.navigate(['/admin/water-quality/testNew']);
  }

  updateAnalysis(id:string):void{
    this.router.navigate(['/admin/water-quality/testEdit',id])
  }

  trackByAnalysisId(index: number, analysis: QualityTest): string {
    return analysis.id;
  }

  getTestingPointName(testingPointId: string): string {
    const point = this.testingPoints.find(p => p.id === testingPointId);
    return point ? point.pointName : testingPointId;
  }

  private handleError(message: string, error: any): void {
    console.error('Error:', error);
    this.showAlert = true;
    this.alertType = 'error';
    this.alertMessage = message;
  }

  dismissAlert(): void {
    this.showAlert = false;
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
