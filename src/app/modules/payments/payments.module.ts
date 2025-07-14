import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentListComponent } from './components/payment-list/payment-list.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { PaymentDetailComponent } from './components/payment-detail/payment-detail.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PaymentsRoutingModule,
    PaymentListComponent,
    PaymentFormComponent,
    PaymentDetailComponent
  ],
  exports: [
    PaymentListComponent,
    PaymentFormComponent,
    PaymentDetailComponent
  ]
})
export class PaymentsModule { }
