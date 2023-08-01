import { AgmKeyModule } from './../agmkey.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HsMapAutoCompleteComponent } from './hsMapAutoComplete.component';
import { LocationSearchAutoCompleteComponent } from './search/locationSearchAutoComplete.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        AgmKeyModule
    ],
    declarations: [
        HsMapAutoCompleteComponent,
        LocationSearchAutoCompleteComponent
    ],
    exports: [HsMapAutoCompleteComponent, LocationSearchAutoCompleteComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HsMapAutoCompleteModule {
}