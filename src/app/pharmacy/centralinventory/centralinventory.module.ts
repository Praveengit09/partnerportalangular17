import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { CentralInventoryUploadComponent } from './component/uploadinventory/uploadinventory.component';
import { CentralInventoryInformationComponent } from './component/inventoryinformation/inventoryinformation.component';
import { CentralInventoryProductDetailsComponent } from './component/productdetails/productdetails.component';
import { CentralInventoryReportsComponent } from './component/reports/inventryReports.component';
import { CentralInventryService } from './centralinventory.service';
import { SearchAndUpdateComponent } from './component/searchandupdateprice/searchandupdateprice.component';


export const routes: Routes = [
  { path: '', redirectTo: 'uploadinventory', pathMatch: 'full' },
  { path: 'uploadinventory', component: CentralInventoryUploadComponent },
  { path: 'inventoryinformation', component: CentralInventoryInformationComponent },
  { path: 'productdetails/:pocId', component: CentralInventoryProductDetailsComponent },
  { path: 'reports', component: CentralInventoryReportsComponent },
  { path: 'searchandupdate', component: SearchAndUpdateComponent }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Ng2CompleterModule,
    // NKDatetimeModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CentralInventoryUploadComponent,
    CentralInventoryInformationComponent,
    CentralInventoryProductDetailsComponent,
    CentralInventoryReportsComponent,
    SearchAndUpdateComponent
  ],
  providers: [CentralInventryService],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CentralInventoryModule {
  static routes = routes;
}