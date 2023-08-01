import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UtilsModule } from '../../layout/utils/utils.module';
import { WidgetModule } from '../../layout/widget/widget.module';
import { VdcUserPrivilegeService } from "./vdcuserprivilege.service";
import { VdcUserPrivilegeComponent } from "./component/vdcUserPrivilege.component";
import { DiagnosticHomeOrderGuard } from '../../../app/auth/guard/diagnostichomeorder-guard.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
export const routes = [
  // { path: 'vdcuser', component: VdcUserPrivilegeComponent }
  { path: 'vdcuser', canActivate: [DiagnosticHomeOrderGuard], component: VdcUserPrivilegeComponent },

]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    MatInputModule
  ],
  declarations: [
    VdcUserPrivilegeComponent
  ],
  //  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    VdcUserPrivilegeService
  ]

})
export class VdcUserPrivilegeModule {
  static routes = routes;
}