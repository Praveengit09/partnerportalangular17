import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { FormsModule } from '@angular/forms';
//import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { HomeConsultationListing } from './homeconsultationlisting/homeconsultationlisting.component';
import { EditHomeConsultationComponent } from './edithomeconsultation/edithomeconsultation.component';
import { UpdateHomeConsultationComponent } from './updatehomeconsultation/updatehomeconsultation.component';
import { UploadModule } from '../uploadcard/upload.module';

export const routes: Routes = [
  { path: '', redirectTo: 'listing', pathMatch: 'full' },
  { path: 'listing', component: HomeConsultationListing },
  { path: 'edit', component: EditHomeConsultationComponent },
  { path: 'update', component: UpdateHomeConsultationComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    UploadModule
  ],
  declarations: [
    HomeConsultationListing,
    EditHomeConsultationComponent,
    UpdateHomeConsultationComponent
  ]
})
export class DoctorHomeConsultationModule {
  static routes = routes;
}