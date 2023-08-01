import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { UploadModule } from '../uploadcard/upload.module';

import { PrescriptionListComponent } from './prescriptionlist.component';

export const routes: Routes = [
    { path: '', redirectTo: 'listing', pathMatch: 'full' },
    { path: 'listing', component: PrescriptionListComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        WidgetModule,
        UtilsModule,
        FormsModule,
        UploadModule,
        MatInputModule
    ],
    declarations: [
        PrescriptionListComponent
    ]
})
export class DoctorPrescriptionListModule {
    static routes = routes;
}