import { AuthService } from './../../auth/auth.service';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { WidgetModule } from './../../layout/widget/widget.module';
import { EmployeeService } from "../../superadmin/employee/employee.service";

import { EmployeeInformationComponent } from './employeeinformation/employeeinformation.con.component';
import { EmployeeListComponent } from './employeelist/employeelist.component';
import { EmployeeLocationComponent } from './employeelocation/employeelocation.component';
import { EmployeeRolesComponent } from './employeeroles/employeeroles.componenet';
import { EmployeeSidebarComponent } from "./employeesidebar/employeesidebar.component";
import { EmployeeUpdationComponent } from './employeeUpdation/employeeUpdation.component';
import { OptionNavigatorModule } from '../../layout/widget/optionNavigator/optionNavigator.module';
import { EmployeeProfessionalDetailsComponent } from './employeeprofessionalDetails/employeeprofessionalDetails.component';



export const routes: Routes = [
    { path: '', redirectTo: 'employee', pathMatch: 'full' },
    {
        path: 'employee', component: EmployeeSidebarComponent, children: [
            { path: 'list', component: EmployeeListComponent },
            { path: 'updation', component: EmployeeUpdationComponent },


        ]
    }

]


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        WidgetModule,
        FormsModule, OptionNavigatorModule,

    ],
    declarations: [
        EmployeeInformationComponent,
        EmployeeListComponent,
        EmployeeLocationComponent,
        EmployeeRolesComponent,
        EmployeeSidebarComponent,
        EmployeeUpdationComponent,
        EmployeeProfessionalDetailsComponent

    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        EmployeeService, AuthService

    ]
})

export class EmployeeModule {
    static routes = routes;

}
