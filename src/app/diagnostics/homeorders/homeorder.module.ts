import { SlotSummaryDashboardComponent } from './component/slotdashboard/slotdashboard.component';
import { LogisticTravelledComponent } from './component/distance/distancetravelled.component';
import { ViewAgentDetailsComponent } from './component/viewlogistics/viewagent.component';
import { CentralLogisticsComponent } from './component/centrallogistics/logisticlisting.component';
import { CentralCashListingComponent } from './component/cashdetails/central/cashlisting.component';
import { CashDetailsComponent } from './component/cashdetails/agentdetails/agentdetails.component';
import { CashDetailsListingComponent } from './component/cashdetails/listing/listing.component';
import { PickupOrderDetailsComponent } from './component/pickuporderdetails/pickuporderdetails.component';
import { PickupRequestComponent } from './component/pickuprequest/pickuprequest.component';
import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { DiagnosticHomeOrderGuard } from '../../auth/guard/diagnostichomeorder-guard.service';
import { HomeOrderComponent } from './component/homeorders/homeorder.component';
import { OrderDetailsComponent } from './component/orderdetails/orderdetails.component';
import { EditOrderDetailsComponent } from './component/editorderdetail/editorderdetails.component';
import { MatInputModule } from '@angular/material/input';
// import { OrderResultsComponent } from './component/ordertestresults/ordertestresults.component';
import { BarCodeScannerComponent } from './component/barcodescanner/barcode.component';
import { ManageHomeOrderComponent } from './component/managehomeorders/managehomeorders.component';
import { AdminHomeOrderComponent } from './component/adminhomeorders/adminhomeorders.component';
import { DiagnosticAdminHomeOrderGuard } from '../../auth/guard/diagnosticadminhomeorder-guard.service';
import { HomeOrderLogisticComponent } from './component/homeorderlogistics/homeorderlogistics.component';
import { DeliveryBoyDetailsComponent } from './component/deliveryboydetails/deliveryboydetails.component';
import { DiagnosticLogisticAdminGuard } from '../../auth/guard/diagnosticlogisticadmin-guard.service';
import { DiagnosticOrderDetailGuard } from '../../auth/guard/diagnosticorderdetail-guard.service';
import { ViewOrderComponent } from './component/order/vieworder.component';
import { PickupOrdersComponent } from './component/pickuporderlist/pickuporders.component';
import { CustomerReviewModalModule } from '../../layout/widget/customerreviewmodal/customer_review_modal.module';
import { PhleboLoginHistoryComponent } from './component/loginhistory/loginhistory.component';

export const routes = [
  { path: 'homeorderlist', canActivate: [DiagnosticHomeOrderGuard], component: HomeOrderComponent },
  { path: 'managehomeorderlist', canActivate: [DiagnosticHomeOrderGuard], component: ManageHomeOrderComponent },
  { path: 'adminhomeorderlist', canActivate: [DiagnosticAdminHomeOrderGuard], component: AdminHomeOrderComponent },
  { path: 'orderdetails', canActivate: [DiagnosticOrderDetailGuard], component: OrderDetailsComponent },
  { path: 'editorderdetail', canActivate: [DiagnosticHomeOrderGuard], component: EditOrderDetailsComponent },
  { path: 'barcodescanner', component: BarCodeScannerComponent },
  { path: 'deliveryboydetails', component: DeliveryBoyDetailsComponent },
  { path: 'vieworder', component: ViewOrderComponent },
  { path: 'pickuporderlist', component: PickupOrdersComponent },
  { path: 'pickuporderdetails', component: PickupOrderDetailsComponent},
  { path: 'pickuprequest', component: PickupRequestComponent},
  { path: 'cashbyagentlist', component: CashDetailsListingComponent},
  { path: 'cashagentdetails', component: CashDetailsComponent},
  { path: 'centralcashagentlist', component: CentralCashListingComponent},
  { path: 'centrallogistics', component: CentralLogisticsComponent},
  { path: 'viewagentdetails', component: ViewAgentDetailsComponent}, 
  { path: 'logistics', component: HomeOrderLogisticComponent },
  { path: 'distancetravelled', component: LogisticTravelledComponent},
  { path: 'slotdashboard', component: SlotSummaryDashboardComponent },
  { path: 'loginhistory', component: PhleboLoginHistoryComponent },

]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    PatientRegisterModule,
    HSDatePickerModule,
    MatInputModule,
    CustomerReviewModalModule
  ],
  declarations: [
    HomeOrderComponent,
    OrderDetailsComponent,
    EditOrderDetailsComponent,
    BarCodeScannerComponent,
    ManageHomeOrderComponent,
    AdminHomeOrderComponent,
    HomeOrderLogisticComponent,
    DeliveryBoyDetailsComponent,
    ViewOrderComponent,
    PickupOrdersComponent,
    PickupOrderDetailsComponent,
    PickupRequestComponent,
    CashDetailsListingComponent,
    CashDetailsComponent,
    CentralCashListingComponent,
    CentralLogisticsComponent,
    ViewAgentDetailsComponent,
    LogisticTravelledComponent,
    SlotSummaryDashboardComponent,
    PhleboLoginHistoryComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeOrderModule {
  static routes = routes;
}