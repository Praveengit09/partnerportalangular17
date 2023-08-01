import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestConsentComponent } from './requestconsent.component';
import { NgOtpInputModule } from 'ng-otp-input';



@NgModule({
    imports: [
        CommonModule,
        NgOtpInputModule
    ],
    declarations: [
        RequestConsentComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [

    ],
    exports: [
        RequestConsentComponent
    ]
})
export class RequestConsentModule {
}