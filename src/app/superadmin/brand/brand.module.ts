import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { WidgetModule } from './../../layout/widget/widget.module';
import { UtilsModule } from './../../layout/utils/utils.module';
import { BrandListingComponent } from './component/listing/brandlist.component';
import { BrandDetailsComponent } from './component/details/branddetails.component';
import { from } from 'rxjs';
import { BrandConfigurationComponent } from './component/configuration/brandconfiguration.component';
import { BrandSettingsComponent } from './component/settings/settings.component';
import { SlotBufferComponent } from './component/slotbuffer/slotbuffer.component';
import { BrandMappingComponent } from './component/mapping/brandappmapping.component';
export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: BrandListingComponent },
    { path: 'details', component: BrandDetailsComponent },
    { path: 'configuration', component: BrandConfigurationComponent },
    { path: 'settings', component: BrandSettingsComponent },
    { path: 'slotBuffer', component: SlotBufferComponent },
    { path: 'brandAppMapping', component: BrandMappingComponent }


];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // WidgetModule,
        UtilsModule,
        FormsModule,
        HSDatePickerModule
    ],
    declarations: [
        BrandListingComponent,
        BrandDetailsComponent,
        BrandConfigurationComponent,
        BrandSettingsComponent,
        SlotBufferComponent,
        BrandMappingComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
    ]
})
export class BrandModule {
    static routes = routes;
}
