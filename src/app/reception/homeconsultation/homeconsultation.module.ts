import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// import { WidgetModule } from './../../layout/widget/widget.module';
import { UtilsModule } from './../../layout/utils/utils.module';
import { HomeConsultationListingComponent } from './listing/homeConsultationListing.component';
import { HomeConsultationRequestComponent } from './request/homeConsultRequest.component';
import { HomeConsultationUpdateComponent } from './update/homeConsultUpdate.component';
// import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { EditHomeConsultationComponent } from './edithomeconsultation/edithomeconsultation.component';
import { MatInputModule } from '@angular/material/input';

export const routes: Routes = [
  { path: '', redirectTo: 'listing', pathMatch: 'full' },
  { path: 'listing', component: HomeConsultationListingComponent },
  { path: 'request', component: HomeConsultationRequestComponent },
  { path: 'update', component: HomeConsultationUpdateComponent },
  { path: 'edit', component: EditHomeConsultationComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // WidgetModule,
    UtilsModule,
    FormsModule,
    HSDatePickerModule,
    // PatientRegisterModule,
    MatInputModule
  ],
  declarations: [
    HomeConsultationListingComponent,
    HomeConsultationRequestComponent,
    HomeConsultationUpdateComponent,
    EditHomeConsultationComponent
  ]
})
export class HomeConsultationModule {
  static routes = routes;
}