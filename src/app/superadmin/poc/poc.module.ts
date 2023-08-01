import { PocSearchModule } from './../../layout/utils/components/pocsearch/pocsearch.module';
import { OptionNavigatorModule } from './../../layout/widget/optionNavigator/optionNavigator.module';
import { NGTableModule } from './../../layout/widget/ngtable/ngtable.module';
import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WidgetModule } from './../../layout/widget/widget.module';
import { UtilsModule } from './../../layout/utils/utils.module';
import { MyPocComponent } from './component/mypoc/mypoc.component';
import { CreatePocComponent } from './component/createpoc/createpoc.component';
import { ServicePortfoiloComponent } from './component/createpoc/serviceportfolio/serviceportfolio.component';

import { FormsModule } from '@angular/forms';
import 'rxjs';

import { PartnerAgreementComponent } from './component/createpoc/partneragreement/partneragreement.component';
import { PocInformationComponent } from './component/pocinformation/pocinformation.component';
import { ManageTaggingComponent } from './component/managetagging/managetagging.component';
import { ManageFollowupDiscountComponent } from './component/managefollowupdiscount/managefollowupdiscount.component';
import { ManageScheduleComponent } from './component/manageschedule/manageschedule.component';
import { DoctorDetailsComponent } from './component/doctordetails/doctordetails.component';
import { CreatenewWellnessScheduleComponent } from './component/wellnessschedule/createnewwellnessschedule/createnewwellnessschedule.component';
import { WellnessScheduleComponent } from './component/wellnessschedule/wellnessschedule.component';
import { SelectedTest_Component } from './component/wellnessschedule/selectedtest/selectedtest.component';
import { Precautions_Component } from './component/wellnessschedule/precaution/precaution.component';

import { PocEmployeesComponent } from './component/pocemployees/pocemployees.component';
import { ReceptionService } from '../../reception/reception.service';
// import { AngularMultiSelectModule } from 'angular4-multiselect-dropdown/dist/multiselect.component';
import { MatInputModule } from '@angular/material/input';
import { ManagePayoutComponent } from './component/managepayouts/managepayout.component';
import { POCAdminGuard } from '../../auth/guard/pocadmin-guard.service';

export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: MyPocComponent },
    { path: 'maploader', component: CreatePocComponent },
    { path: 'create', component: CreatePocComponent },
    { path: 'serviceportfolio', component: ServicePortfoiloComponent },
    { path: 'partneragreement', component: PartnerAgreementComponent },
    { path: 'information', component: PocInformationComponent },
    { path: 'manage/tagging', component: ManageTaggingComponent },
    { path: 'manage/discount', component: ManageFollowupDiscountComponent },
    { path: 'manage/schedule', component: ManageScheduleComponent },
    { path: 'manage/payouts', component: ManagePayoutComponent },
    { path: 'employees', component: PocEmployeesComponent },
    { path: 'manage/doctordetails', component: DoctorDetailsComponent },
    { path: 'manage/wellnessschedule', component: WellnessScheduleComponent },
    { path: 'manage/createnewwellnessschedule', component: CreatenewWellnessScheduleComponent },
    { path: 'manage/selectedWellnesstests', component: SelectedTest_Component },
    { path: 'manage/wellnessPrecaution', component: Precautions_Component },
    { path: 'saas-subscriptions', canActivate: [POCAdminGuard], loadChildren: () => import('./component/saas/saas.module').then(x => x.SaasModule) },
];

@NgModule({

    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // UtilComponentsModule,
        // PocSearchModule,
        // WidgetModule,
        FormsModule,
        UtilsModule,
        FormsModule,
        HSDatePickerModule,
        // AngularMultiSelectModule,
        NGTableModule,
        HSDatePickerModule,
        MatInputModule,
        OptionNavigatorModule
    ],

    declarations: [
        MyPocComponent,
        CreatePocComponent,
        ServicePortfoiloComponent,
        PartnerAgreementComponent,
        PocInformationComponent,
        ManageTaggingComponent,
        ManageScheduleComponent,
        ManageFollowupDiscountComponent,
        ManagePayoutComponent,
        PocEmployeesComponent,
        DoctorDetailsComponent,
        WellnessScheduleComponent,
        CreatenewWellnessScheduleComponent,
        SelectedTest_Component,
        Precautions_Component
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],

    //  exports:[MapsAPILoader],
    providers: [ReceptionService
    ]
})
export class PocModule {
    static routes = routes;
}
