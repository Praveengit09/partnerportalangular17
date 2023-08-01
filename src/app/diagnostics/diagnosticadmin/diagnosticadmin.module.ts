import { RescheduleHomeOrderComponent } from './component/reschedulehomeorder/reschedulehomeorder.component';
import { PhleboOrderComponent } from './component/phleboemployees/orderdetails/phleboorders.component';
import { AdminService } from './../../admin/admin.service';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Ng2CompleterModule } from "ng2-completer";
import { UtilsModule } from '../../layout/utils/utils.module';
// import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { WidgetModule } from '../../layout/widget/widget.module';
import { DiagnosticAdminService } from './diagnosticadmin.service';
import { SampleInfoDownloadComponent } from './component/sampleinfo/sampleinfodownload.component';
import { TestResultUploadComponent } from './component/testresultupload/testresultupload.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DiagnosticsCentralHomeOrderComponent } from './component/centralhomeorders/listing.component';
import { DiagnosticsCentralWalkInComponent } from './component/centralwalkinorders/centralwalkinlist.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown-angular7';
import { AbandonedDiagnosticOrdersComponent } from './component/abandoneddiagnosticorders/abandonedDiagnosticorders.component';
import { CustomerReviewModalModule } from '../../layout/widget/customerreviewmodal/customer_review_modal.module';
import { RequestOrderComponent } from './component/requestorder/requestorder.component';
import { ReportingOrdersComponent } from './component/reporting/reporting.component';
import { OrderDetailsComponent } from './component/orderdetails/orderdetails.component';
import { PhlebolistComponent } from './component/phleboemployees/listing/phlebolist.component';
import { CancelledOrderComponent } from './component/cancelledorders/cancelledorders.component';
import { EnquirylistComponent } from './component/enquirydetails/enquirydetails.component';



export const routes = [
  { path: 'diagnosticadmin/centralhomeorders', component: DiagnosticsCentralHomeOrderComponent },
  { path: 'diagnosticadmin/centralwalkinorders', component: DiagnosticsCentralWalkInComponent },
  { path: 'diagnosticadmin/sampleinfodownload', component: SampleInfoDownloadComponent },
  { path: 'diagnosticadmin/testresultupload', component: TestResultUploadComponent },
  { path: 'diagnosticadmin/abandoneddiagnosticorders', component: AbandonedDiagnosticOrdersComponent },
  { path: 'diagnosticadmin/requestorders', component: RequestOrderComponent },
  { path: 'diagnosticadmin/reportedorders', component: ReportingOrdersComponent },
  { path: 'diagnosticadmin/orderdetails', component: OrderDetailsComponent },
  { path: 'diagnosticadmin/phlebolist', component: PhlebolistComponent },
  { path: 'diagnosticadmin/phleboorder', component: PhleboOrderComponent },
  { path: 'diagnosticadmin/cancelledorders', component: CancelledOrderComponent },
  { path: 'diagnosticadmin/reschedule', component: RescheduleHomeOrderComponent },
  { path: 'diagnosticadmin/enquirylist', component: EnquirylistComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Ng2CompleterModule,
    // NKDatetimeModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgMultiSelectDropDownModule,
    CustomerReviewModalModule,
    MatInputModule
  ],
  declarations: [
    DiagnosticsCentralHomeOrderComponent,
    DiagnosticsCentralWalkInComponent,
    SampleInfoDownloadComponent,
    TestResultUploadComponent,
    AbandonedDiagnosticOrdersComponent,
    RequestOrderComponent,
    ReportingOrdersComponent,
    OrderDetailsComponent,
    PhlebolistComponent,
    PhleboOrderComponent,
    CancelledOrderComponent,
    RescheduleHomeOrderComponent,
    EnquirylistComponent
  ],
  providers: [
    DiagnosticAdminService,
    AdminService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class DiagnosticAdminModule {
  static routes = routes;
}