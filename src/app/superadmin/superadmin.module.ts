import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { SuperAdminService } from './superadmin.service';

import { SuperAdminGuard } from '../auth/guard/superadmin-guard.service';
import { POCAdminGuard } from '../auth/guard/pocadmin-guard.service';
import { EmployeeAdminGuard } from '../auth/guard/employeeadmin-guard.service';
import { RolesAdminGuard } from '../auth/guard/rolesadmin-guard.service';
import { HsLocalStorage } from '../base/hsLocalStorage.service';
export const routes: Routes = [
    { path: '', redirectTo: 'brand', pathMatch: 'full' },
    { path: 'brand', canActivate: [SuperAdminGuard], loadChildren: () => import('./brand/brand.module').then(x => x.BrandModule) },
    { path: 'poc', canActivate: [POCAdminGuard], loadChildren: () => import('./poc/poc.module').then(x => x.PocModule) },
    { path: 'employee', canActivate: [EmployeeAdminGuard], loadChildren: () => import('./employee/employee.module').then(x => x.EmployeeModule) },
    { path: 'roles', canActivate: [RolesAdminGuard], loadChildren: () => import('./roles/roles.module').then(x => x.RolesModule) }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // WidgetModule,
        UtilsModule,
        FormsModule,
        // OptionNavigatorModule
    ],
    declarations: [
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        SuperAdminService, HsLocalStorage
    ]
})
export class SuperAdminModule {
    static routes = routes;
}
