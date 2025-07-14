import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ComplaintCategoriesComponent } from './components/complaint-categories/complaint-categories.component';
import { IncidentTypesComponent } from './components/incident-types/incident-types.component';
import { ComplaintsComponent } from './components/complaints/complaints.component';
import { IncidentsComponent } from './components/incidents/incidents.component';
import { ComplaintResponsesComponent } from './components/complaint-responses/complaint-responses.component';
import { IncidentResolutionsComponent } from './components/incident-resolutions/incident-resolutions.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'complaints',
    pathMatch: 'full'
  },
  {
    path: 'categories',
    component: ComplaintCategoriesComponent,
    data: {
      title: 'Complaint Categories'
    }
  },
  {
    path: 'incident-types',
    component: IncidentTypesComponent,
    data: {
      title: 'Incident Types'
    }
  },
  {
    path: 'complaints',
    component: ComplaintsComponent,
    data: {
      title: 'Complaints'
    }
  },
  {
    path: 'incidents',
    component: IncidentsComponent,
    data: {
      title: 'Incidents'
    }
  },
  {
    path: 'complaint-responses',
    component: ComplaintResponsesComponent,
    data: {
      title: 'Complaint Responses'
    }
  },
  {
    path: 'incident-resolutions',
    component: IncidentResolutionsComponent,
    data: {
      title: 'Incident Resolutions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComplaintsIncidentsRoutingModule { } 