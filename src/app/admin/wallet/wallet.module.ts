import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { HSDatePickerModule } from '../../layout/widget/datetimepicker/datetimepicker.module';
import { MatInputModule } from '@angular/material/input';
import { UserWalletComponent } from './component/userwallet.component';
import { WalletService } from './wallet.service';
import { CenrralPackageGuard } from '../../auth/guard/package-guard.service';
import { PackageService } from '../../packages/package.service';
import { AdminService } from '../admin.service';

export const routes:Routes = [
    { path: '', redirectTo: 'usage', pathMatch: 'full' },
    { path: 'usage', canActivate: [CenrralPackageGuard], component: UserWalletComponent },
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        WidgetModule,
        UtilsModule,
        FormsModule,
        FormsModule,
        HSDatePickerModule,
        MatInputModule,
    ],
    declarations: [
        UserWalletComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        PackageService,
        WalletService,
        AdminService
    ]
})
export class WalletModule {
    static routes = routes;
}