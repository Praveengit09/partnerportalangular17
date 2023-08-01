// import { PocSearchModule } from './../../layout/utils/components/pocsearch/pocsearch.module';

import { OptionNavigatorModule } from './../../layout/widget/optionNavigator/optionNavigator.module';
import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// import { WidgetModule } from './../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { FormsModule } from '@angular/forms';
import 'rxjs';

import { EmployeeListComponent } from './component/employeelist/employeelist.component';
import { EmployeeDetailsComponent } from './component/employeedetails/employeedetails.component';
import { EmployeePersonalDetailsComponent } from './component/employeepersonaldetails/employeepersonaldetails.component';
import { EmployeeService } from './employee.service';
import { EmployeeProfessionalDetailsComponent } from './component/employeeprofessionaldetails/employeeprofessionaldetails.component';
import { EmployeeLocationComponent } from './component/employeelocation/employeelocation.component';
import { EmployeeRolesComponent } from './component/employeeroles/employeeroles.component';
import { EmployeeUpdation } from './component/employeeUpdation/employeeUpdation.component';
import { EmployeeParticipatedetailsComponent } from './component/participatedetails/participatedetails.component';
import { MatInputModule } from '@angular/material/input';

export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: EmployeeListComponent },
    { path: 'employeeUpdation', component: EmployeeUpdation },

    { path: 'employeedetails', component: EmployeeDetailsComponent },
    { path: 'employeepersonaldetails', component: EmployeePersonalDetailsComponent },
    { path: 'employeeprofessionaldetails', component: EmployeeProfessionalDetailsComponent },
    { path: 'employeelocation', component: EmployeeLocationComponent },
    { path: 'employeeroles', component: EmployeeRolesComponent },
    { path: 'employeeparticipatedetails', component: EmployeeParticipatedetailsComponent }

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
        MatInputModule,
        OptionNavigatorModule
    ],

    declarations: [
        EmployeeListComponent,
        EmployeeDetailsComponent,
        EmployeePersonalDetailsComponent,
        EmployeeProfessionalDetailsComponent,
        EmployeeLocationComponent,
        EmployeeRolesComponent,
        EmployeeUpdation,
        EmployeeParticipatedetailsComponent,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],

    providers: [
        EmployeeService
    ]
})
export class EmployeeModule {
    static routes = routes;
}
