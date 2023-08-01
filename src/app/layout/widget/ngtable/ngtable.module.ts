import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NGTableComponent } from './ngtable.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { OrderByPipe } from './orderby.pipe';
import { FormatPipe } from './format.pipe';
import { sanitizeHtmlPipe } from './sanitize-html.pipe';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  declarations: [
    NGTableComponent,
    OrderByPipe,
    FormatPipe,
    sanitizeHtmlPipe
  ],
  exports: [NGTableComponent, sanitizeHtmlPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class NGTableModule {

  constructor() {
    console.log('NG Table Module');
  }

}