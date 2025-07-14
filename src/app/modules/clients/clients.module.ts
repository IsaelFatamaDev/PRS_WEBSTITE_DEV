import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClientsRoutingModule,
    ClientListComponent,
    ClientFormComponent,
    ClientDetailComponent
  ]
})
export class ClientsModule { }
