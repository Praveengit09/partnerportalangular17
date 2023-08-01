import { OrderHistoryComponent } from './component/orderhistory/orderhistory.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CentralDoctorBookingsComponent } from './component/centraldoctorbookings/centraldoctorbookings.component';
import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';


import { AdminDashboardComponent } from './component/dashboard/admindashboard.component';
import { OrderCancellationComponent } from './component/ordercancellation/ordercancellation.component';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { OrderCancellationGuard } from '../auth/guard/ordercancellation-guard.service';
import { AdminService } from "./admin.service";
import { PharmacyService } from '../pharmacy/pharmacy.service';
import { MatInputModule } from '@angular/material/input';
import { AbandonedDoctorBookingsComponent } from './component/centraldoctorbookings/abandonedoctorbookings/abandonedoctorbookings.component';
import { CustomerReviewModalModule } from '../layout/widget/customerreviewmodal/customer_review_modal.module';
import { CentralPackageBookingsComponent } from './component/centralpackages/centralpackages.component';
import { PocPackageBookingsComponent } from './component/pocpackages/pocpackages.component';
import { CentralPostWalletComponent } from './component/postwallet/centralpostwallet.component';
import { NonBuyingUsersComponent } from './component/nonbuyingusers/nonbuyingusers.component';
import { CalendarviewComponent } from './component/calendar/calendarview.component';
import { CenrralPackageGuard } from '../auth/guard/package-guard.service';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'ordercancellations', canActivate: [OrderCancellationGuard], component: OrderCancellationComponent },
  { path: 'centraldoctorbookings', component: CentralDoctorBookingsComponent },
  { path: 'abandoneddoctorbookings', component: AbandonedDoctorBookingsComponent },
  { path: 'centralpackages', canActivate: [CenrralPackageGuard], component: CentralPackageBookingsComponent },
  { path: 'pocpackages', component: PocPackageBookingsComponent },
  { path: 'postwallet', canActivate: [CenrralPackageGuard], component: CentralPostWalletComponent },
  { path: 'nonbuyingusers', component: NonBuyingUsersComponent },
  { path: 'calendar', component: CalendarviewComponent },
  { path: 'orderhistory', component: OrderHistoryComponent },
  { path: 'wallet', loadChildren: () => import('./wallet/wallet.module').then(x => x.WalletModule) },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    FormsModule,
    HSDatePickerModule,
    MatInputModule,
    CustomerReviewModalModule,
    FullCalendarModule
  ],
  declarations: [
    AdminDashboardComponent,
    OrderCancellationComponent,
    CentralDoctorBookingsComponent,
    AbandonedDoctorBookingsComponent,
    CentralPackageBookingsComponent,
    PocPackageBookingsComponent,
    CentralPostWalletComponent,
    NonBuyingUsersComponent,
    CalendarviewComponent,
    OrderHistoryComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    AdminService,
    PharmacyService
  ]
})
export class AdminModule {
  static routes = routes;
}
