import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { doctorSearchComponent } from './doctorSearch.component';
import { DoctorSearchService } from './doctorSearch.service';
import { HSSelectModule } from '../layout/widget/dropdowntable/hs-select.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HSSelectModule        
      ],
      declarations: [doctorSearchComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [DoctorSearchService],
  exports: [doctorSearchComponent]

})

export class DoctorSearchModule {

}