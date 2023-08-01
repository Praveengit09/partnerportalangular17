import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

//import 'bootstrap_calendar/bootstrap_calendar/js/bootstrap_calendar.js';

import { PaymentGuard } from '../auth/guard/payment-guard.service';
import { ProcedureGuard } from '../auth/guard/procedure-guard.service';

import { PaymentComponent } from './payment.component';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';
import { PaymentInvoiceComponent } from './component/invoice/invoice.component';
import { MiscellaneousComponent } from './component/miscellaneous/miscellaneous.component'
import { ImmunizationComponent } from './component/immunization/immunization.component'
import { ImmuneAdviceDetailComponent } from './component/immuneadvicedetail/immuneadvicedetail.component';
import { ImmuneInvoiceComponent } from './component/immuneinvoice/immuneinvoice.component';
import { MiscAdviceDetailComponent } from './component/miscadvicedetail/miscadvicedetail.component';
import { MiscInvoiceComponent } from './component/miscinvoice/miscinvoice.component';
import { UpdateProcedureComponent } from './component/updateprocedure/updateprocedure.component';
import { UpdateImmunizationComponent } from './component/updateimmunization/updateimmunization.component';
import { WalkinImmunizationComponent } from './component/immunizationwalkin/walkinimmunization.component';
import { AdmissionNoteComponent } from './component/admissionnote/admissionnote.component';
import { AdmissionNoteAdviceDetailComponent } from './component/admissionnoteadvicedetail/admissionnoteadvisedetail.component';
import { AdmissionNoteInvoiceComponent } from './component/admissionnoteinvoice/admissionnoteinvoice.component';
import { WalkinAdmissionNoteComponent } from './component/admissionnotewalkin/walkinadmissionnote.component';
import { UpdateAdmissionNoteComponent } from './component/updateadmissionnote/updateadmissionnote.component';
import { WalkinMiscellaneousComponent } from './component/walkin/walkinmiscellaneous.component';
import { PatientRegisterModule } from '../patientregister/patientregister.module';
import { MatInputModule } from '@angular/material/input';
import { MiscOrderInvoiceComponent } from './component/miscellaneouspayments/miscorderinvoice/miscorderinvoice.component';
import { MiscellaneousPaymentsComponent } from './component/miscellaneouspayments/newmiscorder/miscellaneouspayments.component';
import { MiscellaneousPaymentsListingComponent } from './component/miscellaneouspayments/miscellaneouslisting/listing.component';
import { MiscellaneousPaymentsAdviceDetailComponent } from './component/miscellaneouspayments/miscpaymentsadvicedetail/miscpaymentsadvicedetail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'desk', pathMatch: 'full' },
  { path: 'desk', canActivate: [PaymentGuard], component: PaymentComponent },
  { path: 'invoice', canActivate: [PaymentGuard], component: PaymentInvoiceComponent },
  { path: 'misc', canActivate: [ProcedureGuard], component: MiscellaneousComponent },
  { path: 'miscadvice', canActivate: [ProcedureGuard], component: MiscAdviceDetailComponent },
  { path: 'miscinvoice', canActivate: [ProcedureGuard], component: MiscInvoiceComponent },
  { path: 'immunization', canActivate: [ProcedureGuard], component: ImmunizationComponent },
  { path: 'immuneadvice', canActivate: [ProcedureGuard], component: ImmuneAdviceDetailComponent },
  { path: 'immuneinvoice', canActivate: [ProcedureGuard], component: ImmuneInvoiceComponent },
  { path: 'updateprocedure', canActivate: [ProcedureGuard], component: UpdateProcedureComponent },
  { path: 'updateimmunization', canActivate: [ProcedureGuard], component: UpdateImmunizationComponent },
  { path: 'walkinimmunization', canActivate: [ProcedureGuard], component: WalkinImmunizationComponent },
  { path: 'walkinmiscellaneous', canActivate: [ProcedureGuard], component: WalkinMiscellaneousComponent },
  { path: 'admissionnote', canActivate: [ProcedureGuard], component: AdmissionNoteComponent },
  { path: 'admissionadvice', canActivate: [ProcedureGuard], component: AdmissionNoteAdviceDetailComponent },
  { path: 'admissioninvoice', canActivate: [ProcedureGuard], component: AdmissionNoteInvoiceComponent },
  { path: 'walkinadmissionnote', canActivate: [ProcedureGuard], component: WalkinAdmissionNoteComponent },
  { path: 'updateadmissionnote', canActivate: [ProcedureGuard], component: UpdateAdmissionNoteComponent },
  { path: 'miscellaneouspaymentslisting', canActivate: [PaymentGuard], component: MiscellaneousPaymentsListingComponent },
  { path: 'miscellaneouspaymentsorderrequest', canActivate: [PaymentGuard], component: MiscellaneousPaymentsComponent },
  { path: 'miscellaneouspaymentsinvoice', canActivate: [PaymentGuard], component: MiscOrderInvoiceComponent },
  { path: 'miscellaneouspaymentsadvicedetail', canActivate: [PaymentGuard], component: MiscellaneousPaymentsAdviceDetailComponent }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    RickshawChartModule,
    PatientRegisterModule,
    HSDatePickerModule,
    MatInputModule
  ],
  declarations: [
    PaymentComponent,
    PaymentInvoiceComponent,
    MiscellaneousComponent,
    MiscAdviceDetailComponent,
    MiscInvoiceComponent,
    ImmunizationComponent,
    ImmuneAdviceDetailComponent,
    ImmuneInvoiceComponent,
    UpdateProcedureComponent,
    WalkinMiscellaneousComponent,
    UpdateImmunizationComponent,
    WalkinImmunizationComponent,
    AdmissionNoteComponent,
    AdmissionNoteAdviceDetailComponent,
    AdmissionNoteInvoiceComponent,
    WalkinAdmissionNoteComponent,
    UpdateAdmissionNoteComponent,
    MiscellaneousPaymentsListingComponent,
    MiscellaneousPaymentsComponent,
    MiscOrderInvoiceComponent,
    MiscellaneousPaymentsAdviceDetailComponent
  ],
  providers: []
})
export class PaymentModule {
  static routes = routes;
}
