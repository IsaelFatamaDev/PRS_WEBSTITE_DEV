import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationListComponent } from './components/organization-list/organization-list.component';
import { OrganizationFormComponent } from './components/organization-form/organization-form.component';
import { ZoneListComponent } from './components/zone/zone-list/zone-list.component';
import { ZoneFormComponent } from './components/zone/zone-form/zone-form.component';
import { StreetListComponent } from './components/street/street-list/street-list.component';
import { StreetFormComponent } from './components/street/street-form/street-form.component';

const routes: Routes = [
  {
    path:"",
    component:OrganizationListComponent
  },
  {
    path:"edit/:id",
    component:OrganizationFormComponent
  },
  {
    path:"new",
    component:OrganizationFormComponent
  },
  {
    path:"zonas",
    component:ZoneListComponent
  },
  {
    path:"zonas/edit/:id",
    component:ZoneFormComponent
  },
  {
    path:"zonas/new",
    component:ZoneFormComponent
  },
  {
    path:"street",
    component:StreetListComponent
  },
  {
    path:"street/new",
    component:StreetFormComponent
  },
  {
    path:"street/edit/:id",
    component:StreetFormComponent
  }

];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationsRoutingModule { }
