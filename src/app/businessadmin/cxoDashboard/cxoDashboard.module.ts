import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { CxoDashboardComponent } from "./components/dashboard/cxodashboard.component";
// import { PocRevenueComponent } from "./components/pocrevenue/pocrevenue.component";
// import { PocServiceComponent } from "./components/pocservice/pocservice.component";
// import { StatePocComponent } from "./components/statepoc/statepoc.component";
@NgModule({
    imports: [
        CommonModule,
        BrowserModule
    ],
    declarations: [
        CxoDashboardComponent,
        // PocRevenueComponent,
        // PocServiceComponent,
        // StatePocComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: []

})


export class CxoDashBoard {

}



