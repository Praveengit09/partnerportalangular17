import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ImageDrawingModule } from 'ngx-image-drawing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagePointerComponent } from './imagepointer.component';

@NgModule({
  imports: [
    CommonModule,
    ImageDrawingModule,
    FormsModule
  ],
  declarations: [
    ImagePointerComponent
 
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports:[
    ImagePointerComponent
  ]
})
export class ImagePointerModule {
}