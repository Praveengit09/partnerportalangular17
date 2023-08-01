import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerReviewModalComponent } from './customer_review_modal.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    CustomerReviewModalComponent
  ],
  exports: [CustomerReviewModalComponent]
})

export class CustomerReviewModalModule {
}