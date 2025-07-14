import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChlorineFormComponent } from './components/chlorine-control/chlorine-form/chlorine-form.component';
import { ChlorineControlComponent } from './components/chlorine-control/chlorine-control.component';
import { ChlorineDetailComponent } from './components/chlorine-control/chlorine-detail/chlorine-detail.component';
import { AnalysisListComponent } from './components/analysis-list/analysis-list.component';
import { AnalysisDetailComponent } from './components/analysis-list/analysis-detail/analysis-detail.component';
import { AnalysisFormComponent } from './components/analysis-list/analysis-form/analysis-form.component';
import { QualityRecordsComponent } from './components/quality-records/quality-records.component';
import { QualityDetailComponent } from './components/quality-records/quality-detail/quality-detail.component';
import { QualityFormComponent } from './components/quality-records/quality-form/quality-form.component';
import { TestingListComponent } from './components/testing-point/testing-list/testing-list.component';
import { TestingFormComponent } from './components/testing-point/testing-form/testing-form.component';
import { TestingDetailComponent } from './components/testing-point/testing-detail/testing-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ChlorineControlComponent
  },
  {
    path: 'new',
    component: ChlorineFormComponent
  },
  {
    path: 'edit/:id',
    component: ChlorineFormComponent
  },
  {
    path: 'detail/:id',
    component: ChlorineDetailComponent
  },

  //Analysis Test routing 
  {
    path: 'test',
    component: AnalysisListComponent
  },
  {
    path: 'testDetail/:id',
    component: AnalysisDetailComponent
  },
  {
    path: 'testEdit/:id',
    component: AnalysisFormComponent
  },
  {
    path: 'testNew',
    component: AnalysisFormComponent
  },

  //Quality Incident routing
  {
    path: 'incident',
    component: QualityRecordsComponent
  },
  {
    path: 'incidentDetail/:id',
    component: QualityDetailComponent
  },
  {
    path: 'incidentEdit/:id',
    component: QualityFormComponent
  },
  {
    path: 'incidentNew',
    component: QualityFormComponent
  },
  // Testing point 
  {
    path: 'testing',
    component: TestingListComponent
  },
  {
    path: 'testing/new',
    component: TestingFormComponent
  },
  {
    path: 'testingEdit/:id',
    component: TestingFormComponent
  },
  {
    path:'testingDetail/:id',
    component:TestingDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WaterQualityRoutingModule { }
