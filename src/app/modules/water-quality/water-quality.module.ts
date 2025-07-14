import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterQualityRoutingModule } from './water-quality-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { QualityRecordsComponent } from './components/quality-records/quality-records.component';
import { FormsModule } from '@angular/forms';
import { TestingListComponent } from './components/testing-point/testing-list/testing-list.component';
import { TestingFormComponent } from './components/testing-point/testing-form/testing-form.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    WaterQualityRoutingModule,
    HttpClientModule ,
    QualityRecordsComponent,
    TestingListComponent,
    TestingFormComponent
  ],
  exports:[
    TestingFormComponent,
    TestingListComponent,
    QualityRecordsComponent,
  ]
})
export class WaterQualityModule { }
