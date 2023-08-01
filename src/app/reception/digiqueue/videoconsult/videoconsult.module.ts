import { PrescriptionSummaryModule } from './../../../doctor/prescription/prescriptionsummary/pastprescriptionsbox.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoConsultComponent } from './videoconsult.component';
// import { WidgetModule } from '../../../layout/widget/widget.module';
import { UtilsModule } from '../../../layout/utils/utils.module';
import { PublisherComponent } from './publisher/publisher.component';
import { SubscriberComponent } from './subscriber/subscriber.component';
import { PreCallTestComponent } from './precalltest/precalltest.component';

export const routes: Routes = [
    { path: '', redirectTo: 'consult', pathMatch: 'full' },
    { path: 'consult', component: VideoConsultComponent },
    { path: 'precalltest', component: PreCallTestComponent },
    { path: 'consult/:sessionId', component: VideoConsultComponent },
];



@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // WidgetModule,
        MatProgressBarModule,
        PrescriptionSummaryModule,
        UtilsModule,
        FormsModule,
    ],
    declarations: [
        VideoConsultComponent,
        PublisherComponent,
        PreCallTestComponent,
        SubscriberComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class VideoConsultModule {
    static routes = routes;
}