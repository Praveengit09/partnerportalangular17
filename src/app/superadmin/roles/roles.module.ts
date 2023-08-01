import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// import { WidgetModule } from './../../layout/widget/widget.module';
import { UtilsModule } from './../../layout/utils/utils.module';
import { FormsModule } from '@angular/forms';
import 'rxjs';

import { RolesComponent } from './roles.component';


export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: RolesComponent },

];

@NgModule({

    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // WidgetModule,
        FormsModule,
        UtilsModule,
        FormsModule,
        HSDatePickerModule


    ],

    declarations: [
        RolesComponent,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],


    providers: [

    ]
})
export class RolesModule {
    static routes = routes;
}
