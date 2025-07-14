import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ClientListComponent
  },
  {
    path: 'create',
    component: ClientFormComponent
  },
  {
    path: 'edit/:id',
    component: ClientFormComponent
  },
  {
    path: 'detail/:id',
    component: ClientDetailComponent
  },
  {
    path: ':id',
    component: ClientDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
