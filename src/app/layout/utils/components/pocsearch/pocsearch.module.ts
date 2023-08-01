import { WidgetModule } from './../../../widget/widget.module';
import { HSSelectModule } from './../../../widget/dropdowntable/hs-select.module';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { UtilComponentsService } from '../uticomponent.service';
import { PocSearchComponent } from './pocsearch.component';


@NgModule({
    imports: [CommonModule, HSSelectModule, MatInputModule,FormsModule,WidgetModule],
    declarations: [PocSearchComponent],
    exports: [PocSearchComponent],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    providers: [UtilComponentsService]
})
export class PocSearchModule { }
