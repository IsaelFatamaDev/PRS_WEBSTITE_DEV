import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ComplaintsIncidentsRoutingModule } from './complaints-incidents-routing.module';

// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

// Components
import { ComplaintCategoriesComponent } from './components/complaint-categories/complaint-categories.component';
import { IncidentTypesComponent } from './components/incident-types/incident-types.component';
import { ComplaintsComponent } from './components/complaints/complaints.component';
import { IncidentsComponent } from './components/incidents/incidents.component';
import { ComplaintResponsesComponent } from './components/complaint-responses/complaint-responses.component';
import { IncidentResolutionsComponent } from './components/incident-resolutions/incident-resolutions.component';
import { IncidentFormModalComponent } from './components/incident-form-modal/incident-form-modal.component';
import { IncidentTypeFormModalComponent } from './components/incident-type-form-modal/incident-type-form-modal.component';
import { IncidentResolutionFormModalComponent } from './components/incident-resolutions/incident-resolution-form-modal/incident-resolution-form-modal.component';

// Services
import { ComplaintCategoriesService } from './services/complaint-categories.service';
import { IncidentTypesService } from './services/incident-types.service';
import { ComplaintsService } from './services/complaints.service';
import { IncidentsService } from './services/incidents.service';
import { ComplaintResponsesService } from './services/complaint-responses.service';
import { IncidentResolutionsService } from './services/incident-resolutions.service';
import { ENDPOINT_TOKEN } from './services/base.service';
import { BaseService } from './services/base.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ComplaintsIncidentsRoutingModule,
    // Material Modules
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    // Standalone Components
    ComplaintCategoriesComponent,
    IncidentTypesComponent,
    ComplaintsComponent,
    IncidentsComponent,
    ComplaintResponsesComponent,
    IncidentResolutionsComponent,
    IncidentFormModalComponent,
    IncidentTypeFormModalComponent,
    IncidentResolutionFormModalComponent
  ],
  providers: [
    {
      provide: ENDPOINT_TOKEN,
      useValue: 'complaint-categories'
    },
    ComplaintCategoriesService,
    {
      provide: ENDPOINT_TOKEN,
      useValue: 'incident-types'
    },
    IncidentTypesService,
    {
      provide: ENDPOINT_TOKEN,
      useValue: 'complaints'
    },
    ComplaintsService,
    {
      provide: ENDPOINT_TOKEN,
      useValue: 'incidents'
    },
    IncidentsService,
    {
      provide: ENDPOINT_TOKEN,
      useValue: 'complaint-responses'
    },
    ComplaintResponsesService,
    {
      provide: ENDPOINT_TOKEN,
      useValue: 'incident-resolutions'
    },
    IncidentResolutionsService,
    BaseService
  ]
})
export class ComplaintsIncidentsModule { } 