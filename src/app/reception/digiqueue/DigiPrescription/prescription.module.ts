import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// import { WidgetModule } from '../../../layout/widget/widget.module';
import { UtilsModule } from '../../../layout/utils/utils.module';
//import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { ApprovePrescriptionComponent } from './approveprescription/approveprescription.component';
import { PrescriptionComponent } from './prescriptionlist/prescription.component';
import { MatInputModule } from '@angular/material/input';



export const routes: Routes = [
    { path: '', redirectTo: 'prescription', pathMatch: 'full' },
    { path: 'prescription', component: PrescriptionComponent },
    { path: 'approveprescription', component: ApprovePrescriptionComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // WidgetModule,
        UtilsModule,
        FormsModule,
        MatInputModule
        // NKDatetimeModule
    ],
    declarations: [
        PrescriptionComponent,
        ApprovePrescriptionComponent
    ]
})
export class PrescriptionModule {
    static routes = routes;
}