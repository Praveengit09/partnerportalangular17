import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PharmacyService } from '../pharmacy.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { DoctorSearchModule } from '../../doctorSearch/doctorSearch.module';
import { MedicineSalesModule } from '../medicinesales/medicinesales.module';
import { OtPatientOrdersService } from './otpatientorders.service';
import { OtPatientatientBillingComponent } from './component/otpatientorderslist/list.component';
import { OtPatientOrderSummaryComponent } from './component/ordersummary/ordersummary.component';
import { NewOtPatientAdviceComponent } from './component/newotpatientadvice/newadvice.component';



export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: OtPatientatientBillingComponent },
    { path: 'neworder', component: NewOtPatientAdviceComponent },
    { path: 'ordersummary', component: OtPatientOrderSummaryComponent },

]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        //Ng2CompleterModule,

        WidgetModule,
        UtilsModule,
        FormsModule,
        PatientRegisterModule,
        DoctorSearchModule,
        MedicineSalesModule,
        MatInputModule,
        MatButtonModule
    ],
    declarations: [
        NewOtPatientAdviceComponent,
        OtPatientatientBillingComponent,
        OtPatientOrderSummaryComponent
    ],
    providers: [OtPatientOrdersService, PharmacyService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class OtPatientOrdersModule {
    static routes = routes;
}