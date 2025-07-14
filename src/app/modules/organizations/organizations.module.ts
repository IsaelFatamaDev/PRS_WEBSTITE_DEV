import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationFormComponent } from './components/organization-form/organization-form.component';
import { OrganizationListComponent } from './components/organization-list/organization-list.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    OrganizationsRoutingModule,
    OrganizationFormComponent,
    OrganizationListComponent
  ],
  exports:[
    OrganizationFormComponent,
    OrganizationListComponent
  ]
})
export class OrganizationsModule { }
