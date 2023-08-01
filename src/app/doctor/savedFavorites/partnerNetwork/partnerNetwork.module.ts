import { HSDatePickerModule } from './../../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';


// import 'bootstrap/dist/css/bootstrap.css';
// import 'jquery/dist/jquery.min.js';
// import 'bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css';
// import 'bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js';
// import 'bootstrap-timepicker/css/bootstrap-timepicker.min.css';
// import 'bootstrap-timepicker/js/bootstrap-timepicker.js';
import { WidgetModule } from '../../../layout/widget/widget.module';
import { RouterModule, Routes } from '../../../../../node_modules/@angular/router';
import { PartnerNetworkComponent } from './myPartnerNetwork/partnerNetwork.component';
import { managePartnerNetworkComponent } from './managePartnerNetwork/managePartnerNetwork.component';

export const routes:Routes = [
    { path: '', redirectTo: 'partnerNetwork', pathMatch: 'full' },
    { path: 'partnerNetwork', component: PartnerNetworkComponent },
    { path: 'manageNetwork', component: managePartnerNetworkComponent }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        //Ng2CompleterModule,

        HSDatePickerModule,
        WidgetModule,
        FormsModule
    ],
    declarations: [
        PartnerNetworkComponent,
        managePartnerNetworkComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    exports: [
    ]
})
export class PartnerNetworkModule {
    static routes = routes;
}