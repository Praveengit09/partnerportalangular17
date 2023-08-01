import { SuperAdminService } from '../superadmin/superadmin.service';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { CentralOrdersTotalCount } from './component/centralorderstotalcount/centralorderstotalcount.component';
import { CentralOrdersTotalCountService } from './centralorderstotalcount.service';

export const routes = [
    { path: 'totalorderscount', component: CentralOrdersTotalCount }
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
        CentralOrdersTotalCount
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
    providers: [
          SuperAdminService,
        CentralOrdersTotalCountService

    ],
    exports: [

    ]
})
export class CentralOrdersTotalCountModule {
    static routes = routes;
}
