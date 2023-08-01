import { DigiQueueService } from './../reception/digiqueue/digiqueue.service';
import 'jquery-slimscroll';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { TooltipModule } from 'ng2-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ROUTES } from './layout.routes';
import { Layout } from './layout.component';
import { Sidebar } from './sidebar/sidebar.component';
import { Navbar } from './navbar/navbar.component';
import { Footer } from './footer/footer.component';
import { SearchPipe } from './pipes/search.pipe';
import { NotificationLoad } from './notifications/notifications-load.directive';
import { Notifications } from './notifications/notifications.component';
import { WidgetModule } from './widget/widget.module';

import { ReceptionService } from '../reception/reception.service';
import { DiagnosticsService } from '../diagnostics/diagnostics.service';
import { PaymentService } from '../payment/payment.service';

import { OnboardingService } from '../onboarding/onboarding.service';
import { CommonUtil } from '../base/util/common-util';
import { ValidationUtil } from '../base/util/validation-util';
// import {AccordionModule} from "ng2-accordion";
import { PackageService } from "../packages/package.service";
import { DoctorService } from '../doctor/doctor.service';
import { NurseService } from '../nurse/nurse.service';
import { NotificationsService } from './notifications/notifications.service';
import { VideoCardService } from '../doctor/prescription/videocard/videocard.service';
import { WellnessService } from '../newwellness/wellness.service';
import { FileUtil } from '../base/util/file-util';


@NgModule({
  imports: [
    CommonModule,
    // TooltipModule.forRoot(),
    ROUTES,
    FormsModule,
    ReactiveFormsModule,
    WidgetModule
    // AccordionModule
  ],
  declarations: [
    Layout,
    Sidebar,
    Navbar,
    Footer,
    SearchPipe,
    Notifications,
    NotificationLoad
  ],
  providers: [
    DiagnosticsService,
    ReceptionService,
    WellnessService,
    OnboardingService,
    PackageService,
    CommonUtil,
    ValidationUtil,
    FileUtil,
    VideoCardService,
    NotificationsService,
    PaymentService,
    DoctorService,
    DigiQueueService,
    NurseService,
  ]
})
export class LayoutModule {
}
