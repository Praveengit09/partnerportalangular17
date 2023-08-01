import { WidgetModule } from './../../../layout/widget/widget.module';
import { HSDatePickerModule } from './../../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MyPackagesComponent } from './myPackages/myPackages.component';
import { RouterModule, Routes } from '../../../../../node_modules/@angular/router';
import { MorePackagesComponent } from './morePackages/morePackages.component';

export const routes: Routes = [
    { path: '', redirectTo: 'packages', pathMatch: 'full' },
    { path: 'packages', component: MyPackagesComponent },
    { path: 'morePackages', component: MorePackagesComponent }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        //Ng2CompleterModule,
        WidgetModule,
        HSDatePickerModule,
        FormsModule
    ],
    declarations: [
        MyPackagesComponent,
        MorePackagesComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    exports: [
    ]
})
export class PackagesModule {
    static routes = routes;
}