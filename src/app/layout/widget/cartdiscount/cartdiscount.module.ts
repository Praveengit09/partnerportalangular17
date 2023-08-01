import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartDiscountComponent } from './cartdiscount.component';
import { MessageComponent } from '../message/message.component';
import { HSSelectModule } from '../dropdowntable/hs-select.module';
import { SuperAdminService } from '../../../superadmin/superadmin.service';
// import { WidgetModule } from '../widget.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HSSelectModule
        // require('../widget/widget.module')
        // WidgetModule
    ],
    declarations: [
        CartDiscountComponent
    ],
    exports: [CartDiscountComponent],
    providers: [
        SuperAdminService
    ]
    // schemas: [NO_ERRORS_SCHEMA]
})

export class CartDiscountModule {
}