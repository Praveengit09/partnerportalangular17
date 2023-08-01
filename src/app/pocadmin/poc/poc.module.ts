import { OnboardingService } from './../../onboarding/onboarding.service';
// import { WidgetModule } from './../../layout/widget/widget.module';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RouterModule, Routes } from '@angular/router';
import { AddressAndLocationComponent } from './addressandlocation/addressandlocation.component';
import { BasicInformationComponent } from './basicinformation/basicinformation.component';
import { PocAdminSideBarComponent } from './pocadminsidebar/pocadminsidebar.component';
import { ServicesOfferedComponent } from './servicesoffered/servicesoffered.compoment';
import { SoftwareSettings } from './softwaresettings/softwaresettings.component';
import { saasSubscriptionsService } from '../../superadmin/poc/component/saas/saassubscriptions.service';
import { NavigatePageComponent } from './navigatepage/navigatepage.component';

export const routes: Routes = [
    { path: '', redirectTo: 'sidebar', pathMatch: 'full' },
    {
        path: 'sidebar', component: PocAdminSideBarComponent, children: [
            { path: 'basicinfo', component: BasicInformationComponent },
            { path: 'addressandlocation', component: AddressAndLocationComponent },
            { path: 'serviceoffered', component: ServicesOfferedComponent },
            { path: 'softweresetting', component: SoftwareSettings },
        ]
    },
    { path: 'navigatepage', component: NavigatePageComponent}
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // WidgetModule,
        FormsModule
    ],
    declarations: [
        BasicInformationComponent,
        AddressAndLocationComponent,
        ServicesOfferedComponent,
        SoftwareSettings,
        PocAdminSideBarComponent,
        NavigatePageComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        OnboardingService, saasSubscriptionsService
    ]
})

export class PocModule {
    static routes = routes;

}