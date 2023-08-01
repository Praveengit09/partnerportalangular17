import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ImageDrawingComponent } from './imagedrawing.component';

@NgModule({
    declarations: [
        ImageDrawingComponent,
    ],
    exports: [
        ImageDrawingComponent,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    imports: [
        CommonModule,
        FormsModule
    ]
})
export class ImageDrawingModule { }