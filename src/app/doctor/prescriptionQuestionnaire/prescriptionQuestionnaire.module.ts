import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';


import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';

import { PrescriptionQuestionnaireComponent } from './prescriptionQuestionnaire.component';
import { NurseService } from '../../nurse/nurse.service';
import { DoctorService } from '../doctor.service';



export const routes: Routes = [
    { path: '', redirectTo: 'listing', pathMatch: 'full' },
    { path: 'prescptionQuestinnaire', component: PrescriptionQuestionnaireComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        WidgetModule,
        UtilsModule,
        FormsModule,

    ],
    declarations: [
        PrescriptionQuestionnaireComponent
    ],
    providers: [
        NurseService,
        DoctorService
    ],
    exports: [PrescriptionQuestionnaireComponent]
})
export class PrescriptionQuestionnaireModule {
    static routes = routes;
}