import { DoctorDashGuard } from './../auth/guard/doctor-dash-guard';
import { DoctorPHRSummary } from './phrsummary/doctorphrsummary.component';
import { RouterModule, Routes } from "@angular/router";
import { DoctorQueueComponent } from "./queue/doctorqueue.component";
import { NgModule } from "@angular/core";
import { DoctorDashboardComponent } from './dashboard/doctordashboard.component';
import { HomeCareServicesGuard } from '../auth/guard/homecareservices-guard.service';
import { DoctorGuard } from '../auth/guard/doctor-guard.service';
import { DoctorDashboardV1Component } from './dashboardv1/doctordashboardv1.component';

export const routes: Routes = [
  { path: "", canActivate: [DoctorGuard], redirectTo: "dashboard", pathMatch: "full" },
  { path: "dashboard", canActivate: [DoctorDashGuard], component: DoctorDashboardComponent },
  { path: "doctordashboardv1", component: DoctorDashboardV1Component },
  { path: "queue", component: DoctorQueueComponent },
  { path: "patientphrsummary", component: DoctorPHRSummary },
  { path: 'doctorhomeconsult', canActivate: [HomeCareServicesGuard], loadChildren: () => import('./homeconsultation/doctorhomeconsultation.module').then(x => x.DoctorHomeConsultationModule) },
  { path: 'past', loadChildren: () => import('./prescriptionlist/prescriptionlist.module').then(x => x.DoctorPrescriptionListModule) },
  { path: "favorites", loadChildren: () => import('./savedFavorites/savedFavorites.module').then(x => x.SavedFavoritesModule) },
  { path: "chat", loadChildren: () => import('./chat/chat.module').then(x => x.ChatModule) },
  { path: "prescription", loadChildren: () => import('./prescription/doctorprescription.module').then(x => x.DoctorPrescriptionModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoute { }
