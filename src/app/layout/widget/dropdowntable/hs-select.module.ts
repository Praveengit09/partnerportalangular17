import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HSSelectComponent } from "./hs-select.component";
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule
  ],
  declarations: [
    HSSelectComponent
  ],
  exports: [HSSelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HSSelectModule {

  constructor() {
    console.log('HS Select Module');
  }

}