import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiscountComponent } from './slotbookingdiscount.component';
import { HSSelectModule } from '../dropdowntable/hs-select.module';
import { SuperAdminService } from '../../../superadmin/superadmin.service';
// import { WidgetModule } from '../widget.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HSSelectModule
        // WidgetModule
    ],
    declarations: [
        DiscountComponent
    ],
    exports: [DiscountComponent],
    providers: [
        SuperAdminService
    ]
})

export class DiscountModule {
}