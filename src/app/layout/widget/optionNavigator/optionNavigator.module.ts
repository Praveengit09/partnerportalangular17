import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OptionNavigatorComponent } from './optionNavigator.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, 
    ],
    declarations: [OptionNavigatorComponent],
    exports: [OptionNavigatorComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OptionNavigatorModule { }