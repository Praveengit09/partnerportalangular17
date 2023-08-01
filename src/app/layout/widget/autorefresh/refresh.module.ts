import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RefreshComponent } from './refresh.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    RefreshComponent
  ],
  exports: [RefreshComponent]
})

export class RefreshModule {
}