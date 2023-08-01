import { UploadCardComponent } from './uploadcard.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
    imports: [
        CommonModule,
        MatProgressBarModule
    ],
    declarations: [
        UploadCardComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
    ],
    exports:[
        UploadCardComponent
    ]
})
export class UploadModule {
}