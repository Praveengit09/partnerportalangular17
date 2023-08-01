import { WidgetModule } from './../../../widget/widget.module';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HSSelectModule } from './../../../widget/dropdowntable/hs-select.module';
import { UtilComponentsService } from '../uticomponent.service';
import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SelectAddressDropDownComponent } from './addressdropdown.component';

@NgModule({
    imports: [CommonModule, HSSelectModule, MatInputModule, FormsModule, WidgetModule],
    declarations: [SelectAddressDropDownComponent],
    exports: [SelectAddressDropDownComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [UtilComponentsService]
})
export class AddressDropdownModule { }
