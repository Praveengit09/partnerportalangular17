import { Routes, RouterModule } from '@angular/router';
import { Layout } from './layout.component';

import { ReceptionGuard } from '../auth/guard/reception-guard.service';
import { NurseGuard } from '../auth/guard/nurse-guard.service';
import { WellnessGuard } from '../auth/guard/wellness-guard.service';
import { DoctorGuard } from '../auth/guard/doctor-guard.service';
import { MISGuard } from '../auth/guard/mis-guard.service';
import { DefaultGuard } from '../auth/guard/default-guard.service';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '', component: Layout, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', canActivate: [DefaultGuard], loadChildren: () => import('../dashboard/dashboard.module').then(x => x.DashboardModule) },
      { path: 'diagnostics', loadChildren: () => import('../diagnostics/diagnostics.module').then(x => x.DiagnosticsModule) },
      { path: 'pharmacy', loadChildren: () => import('../pharmacy/pharmacy.module').then(x => x.PharmacyModule) },
      { path: 'nurse', canActivate: [NurseGuard], loadChildren: () => import('../nurse/nurse.module').then(x => x.NurseModule) },
      { path: 'payment', loadChildren: () => import('../payment/payment.module').then(x => x.PaymentModule) },
      { path: 'reception', canActivate: [ReceptionGuard], loadChildren: () => import('../reception/reception.module').then(x => x.ReceptionModule) },
      { path: 'onboarding', loadChildren: () => import('../onboarding/onboarding.module').then(x => x.OnboardingModule) },
      { path: 'admin', loadChildren: () => import('../admin/admin.module').then(x => x.AdminModule) },
      { path: 'product', loadChildren: () => import('../product/product.module').then(x => x.ProductModule) },
      { path: 'finance', loadChildren: () => import('../businessadmin/businessadmin.module').then(x => x.BusinessAdminModule) },
      { path: 'package', loadChildren: () => import('../packages/package.module').then(x => x.PackageModule) },
      { path: 'master', loadChildren: () => import('../superadmin/superadmin.module').then(x => x.SuperAdminModule) },
      { path: 'doctor', canActivate: [DoctorGuard], loadChildren: () => import('../doctor/doctor.module').then(x => x.DoctorModule) },
      { path: 'wellness', canActivate: [WellnessGuard], loadChildren: () => import('../newwellness/wellness.module').then(x => x.WellnessModule) },
      { path: 'mis', canActivate: [MISGuard], loadChildren: () => import('../mis/mis.module').then(x => x.ManagementInformationSystemModule) },
      { path: 'ops', canActivate: [MISGuard], loadChildren: () => import('../ops/ops.module').then(x => x.OpsModule) },
      { path: 'revenuereports', canActivate: [MISGuard], loadChildren: () => import('../revenuereports/centralorderstotalcount.module').then(x => x.CentralOrdersTotalCountModule) }
    ]
  }
];

export const ROUTES = RouterModule.forChild(routes);
