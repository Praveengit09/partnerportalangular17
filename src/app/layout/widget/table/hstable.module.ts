import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { PaginationModule } from 'ng2-bootstrap';
// import { NgxPaginationModule } from 'ngx-pagination';

import { OrderByPipe } from "./orderby.pipe";
import { FormatPipe } from "./format.pipe";
import { HSTableComponent } from "./hstable.component";

@NgModule({
  imports: [
    CommonModule,
    // NgxPaginationModule,
    // //PaginationModule.forRoot()
  ],
  declarations: [
    HSTableComponent,
    OrderByPipe,
    FormatPipe
  ],
  exports: [HSTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HSTableModule {

  constructor() {
    console.log('HS Table Module');
  }

}