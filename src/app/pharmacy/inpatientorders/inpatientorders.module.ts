import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';


import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';

import { InpatientBillingComponent } from './component/inpatientorderslist/list.component';
import { InpatientOrdersService } from './inpatientorders.service';
import { NewInPatientAdviceComponent } from './component/newinpatientadvice/newadvice.component';
import { PharmacyAdviceModule } from '../advice/advice.module';
import { PharmacyService } from '../pharmacy.service';
import { InPatientOrderSummaryComponent } from './component/ordersummary/ordersummary.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InPatientPharmacyInvoiceComponent } from './component/invoice/invoice.component';
import { MedicineSalesModule } from '../medicinesales/medicinesales.module';
import { DoctorSearchModule } from '../../doctorSearch/doctorSearch.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';



export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: InpatientBillingComponent },
    { path: 'neworder', component: NewInPatientAdviceComponent },
    { path: 'ordersummary', component: InPatientOrderSummaryComponent },
    { path: 'invoice', component: InPatientPharmacyInvoiceComponent }

]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        Ng2CompleterModule,
        // NKDatetimeModule,
        // PharmacyAdviceModule,
        WidgetModule,
        UtilsModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MedicineSalesModule,
        DoctorSearchModule,
        PatientRegisterModule,
    ],
    declarations: [
        InpatientBillingComponent,
        NewInPatientAdviceComponent,
        InPatientOrderSummaryComponent,
        InPatientPharmacyInvoiceComponent
    ],
    providers: [InpatientOrdersService, PharmacyService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class InPatientOrdersModule {
    static routes = routes;
}